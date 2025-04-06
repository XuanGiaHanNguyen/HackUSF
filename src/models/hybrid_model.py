"""
Hybrid model combining CNN and ABCDE features for skin cancer classification.
"""
import tensorflow as tf
import numpy as np
from tensorflow.keras import layers, models
from tensorflow.keras.optimizers import Adam
import joblib
from sklearn.ensemble import RandomForestClassifier
import os
import cv2

from config import (
    IMG_SIZE, BATCH_SIZE, CNN_WEIGHT, ABCDE_WEIGHT, 
    CONFIDENCE_THRESHOLD, SAVED_MODELS_DIR
)
from src.features.abcde import extract_abcde_features

class HybridModel:
    """
    Hybrid model that combines CNN features with ABCDE rule-based features.
    """
    def __init__(self, cnn_model_path, rf_model_path=None):
        try:
            # Try loading with standard method first
            self.cnn_model = tf.keras.models.load_model(cnn_model_path)
        except (TypeError, ValueError) as e:
            if 'batch_shape' in str(e):
                # Handle the batch_shape compatibility issue
                import h5py
                import json
                from tensorflow.keras.models import Model
                from tensorflow.keras.layers import Input, Dense, Conv2D, MaxPooling2D, Flatten, Dropout
                
                # Create a basic model structure that matches the original model
                # This approach creates a new model with the same architecture instead of 
                # trying to deserialize the problematic config
                input_layer = Input(shape=(224, 224, 3))  # Standard input shape for most CNN models
                
                # We'll load weights into this model after creating it
                # For now, just create a simple CNN structure that should be compatible
                x = Conv2D(32, (3, 3), activation='relu', padding='same')(input_layer)
                x = MaxPooling2D((2, 2))(x)
                x = Conv2D(64, (3, 3), activation='relu', padding='same')(x)
                x = MaxPooling2D((2, 2))(x)
                x = Conv2D(128, (3, 3), activation='relu', padding='same')(x)
                x = MaxPooling2D((2, 2))(x)
                x = Flatten()(x)
                x = Dense(128, activation='relu')(x)
                x = Dropout(0.5)(x)
                outputs = Dense(2, activation='softmax')(x)  # Binary classification (benign/malignant)
                
                self.cnn_model = Model(inputs=input_layer, outputs=outputs)
                
                # Try to load weights
                try:
                    print("Attempting to load weights only...")
                    self.cnn_model.load_weights(cnn_model_path)
                    print("Successfully loaded weights!")
                except Exception as weight_error:
                    print(f"Warning: Could not load model weights: {weight_error}")
                    print("Using a basic CNN model with random weights. Predictions may not be accurate.")
            else:
                # If it's another error, just raise it
                raise
        
        # Create feature extractor from CNN model
        self.feature_extractor = tf.keras.models.Model(
            inputs=self.cnn_model.inputs,
            outputs=self.cnn_model.layers[-2].output  # Output of the second-to-last layer
        )
        
        # Load or create RF model
        if rf_model_path and os.path.exists(rf_model_path):
            self.rf_model = joblib.load(rf_model_path)
        else:
            self.rf_model = None
    
    def extract_features(self, image_path_or_array):
        """
        Extract both CNN and ABCDE features from an image.
        
        Args:
            image_path_or_array: Image path or numpy array
        
        Returns:
            tuple: (CNN features, ABCDE features)
        """
        # Load image if path is provided
        if isinstance(image_path_or_array, str):
            img = cv2.imread(image_path_or_array)
            if img is None:
                raise ValueError(f"Could not load image from {image_path_or_array}")
        else:
            img = image_path_or_array.copy()
        
        # Preprocess for CNN
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, IMG_SIZE)
        img_preprocessed = img_resized.astype(np.float32) / 255.0
        img_batch = np.expand_dims(img_preprocessed, axis=0)
        
        # Extract CNN features
        cnn_features = self.feature_extractor.predict(img_batch)[0]
        
        # Extract ABCDE features
        abcde_features_dict = extract_abcde_features(img)
        
        # Convert ABCDE features to array
        abcde_features = np.array([
            abcde_features_dict['asymmetry_score'],
            abcde_features_dict['border_score'],
            abcde_features_dict['color_variance_score'],
            abcde_features_dict['num_colors'] / 6.0,  # Normalize by max expected colors
            abcde_features_dict['diameter_mm'] / 10.0  # Normalize by 10mm
        ])
        
        return cnn_features, abcde_features, abcde_features_dict
    
    def predict_with_cnn(self, image_path_or_array):
        """
        Make a prediction using only the CNN model.
        
        Args:
            image_path_or_array: Image path or numpy array
        
        Returns:
            float: Probability of malignancy (0-1)
        """
        # Load image if path is provided
        if isinstance(image_path_or_array, str):
            img = cv2.imread(image_path_or_array)
            if img is None:
                raise ValueError(f"Could not load image from {image_path_or_array}")
        else:
            img = image_path_or_array.copy()
        
        # Preprocess for CNN
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, IMG_SIZE)
        img_preprocessed = img_resized.astype(np.float32) / 255.0
        img_batch = np.expand_dims(img_preprocessed, axis=0)
        
        # Get predictions
        predictions = self.cnn_model.predict(img_batch)[0]
        
        # For binary classification, return probability of malignant class
        if len(predictions) == 2:
            return float(predictions[1])
        else:
            return float(predictions[0])  # Assuming single output for binary classification
    
    def predict_with_abcde(self, image_path_or_array):
        """
        Make a prediction using only ABCDE features.
        
        Args:
            image_path_or_array: Image path or numpy array
        
        Returns:
            float: Probability of malignancy (0-1)
        """
        # Extract ABCDE features
        _, _, abcde_features_dict = self.extract_features(image_path_or_array)
        
        # Simple heuristic based on number of malignant indicators
        indicators = abcde_features_dict['malignant_indicators']
        total_indicators = 4  # A, B, C, D (excluding E which is usually unknown)
        
        # Base probability on percentage of indicators present
        base_prob = indicators / total_indicators
        
        # Weight the indicators
        weighted_prob = (
            0.3 * abcde_features_dict['asymmetry_high'] +
            0.25 * abcde_features_dict['border_irregular'] +
            0.25 * abcde_features_dict['color_variegated'] +
            0.2 * abcde_features_dict['diameter_large']
        )
        
        # Return average of the two approaches
        return (base_prob + weighted_prob) / 2
    
    def predict(self, image_path_or_array):
        """
        Make a prediction using the hybrid model (combining CNN and ABCDE features).
        
        Args:
            image_path_or_array: Image path or numpy array
        
        Returns:
            tuple: (prediction, probability, abcde_features)
        """
        # Get CNN prediction
        cnn_prob = self.predict_with_cnn(image_path_or_array)
        
        # Get ABCDE prediction
        abcde_prob = self.predict_with_abcde(image_path_or_array)
        
        # Extract features for detailed results
        _, _, abcde_features_dict = self.extract_features(image_path_or_array)
        
        # Combine predictions using weighted average
        combined_prob = (CNN_WEIGHT * cnn_prob) + (ABCDE_WEIGHT * abcde_prob)
        
        # Classify as malignant if probability exceeds threshold
        prediction = "malignant" if combined_prob > CONFIDENCE_THRESHOLD else "benign"
        
        return prediction, combined_prob, abcde_features_dict
    
    def train_rf_model(self, image_paths, labels):
        """
        Train a Random Forest model to combine CNN and ABCDE features.
        
        Args:
            image_paths: List of image paths
            labels: List of labels (0 for benign, 1 for malignant)
        
        Returns:
            trained RF model
        """
        # Extract features from all images
        cnn_features_list = []
        abcde_features_list = []
        
        for image_path in image_paths:
            cnn_features, abcde_features, _ = self.extract_features(image_path)
            cnn_features_list.append(cnn_features)
            abcde_features_list.append(abcde_features)
        
        # Combine features
        cnn_features_array = np.array(cnn_features_list)
        abcde_features_array = np.array(abcde_features_list)
        
        combined_features = np.hstack((cnn_features_array, abcde_features_array))
        
        # Train RF model
        rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        rf_model.fit(combined_features, labels)
        self.rf_model = rf_model
        
        return rf_model
    
    def save_rf_model(self, save_path):
        """
        Save the trained Random Forest model.
        
        Args:
            save_path: Path to save the model
        """
        if self.rf_model is not None:
            joblib.dump(self.rf_model, save_path)
            print(f"Random Forest model saved to {save_path}")
        else:
            print("No Random Forest model to save")
