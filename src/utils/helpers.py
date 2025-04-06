"""
Utility functions for the skin cancer detection project.
"""
import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
import tensorflow as tf
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import json

from config import IMG_SIZE

def preprocess_image(image_path, target_size=IMG_SIZE):
    """
    Preprocess an image for model input.
    
    Args:
        image_path: Path to the image
        target_size: Target size for resizing
    
    Returns:
        numpy array: Preprocessed image
    """
    # Load image
    img = cv2.imread(str(image_path))
    if img is None:
        raise ValueError(f"Could not load image from {image_path}")
    
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Resize
    img_resized = cv2.resize(img_rgb, target_size)
    
    # Convert to float32 and normalize
    img_array = img_resized.astype(np.float32) / 255.0
    
    # Add batch dimension
    img_batch = np.expand_dims(img_array, axis=0)
    
    return img_batch

def load_and_preprocess_image_tensor(image_path, target_size=IMG_SIZE):
    """
    Load and preprocess an image as a TensorFlow tensor.
    
    Args:
        image_path: Path to the image
        target_size: Target size for resizing
    
    Returns:
        tensorflow.Tensor: Preprocessed image tensor
    """
    # Load the image with target size
    img = load_img(image_path, target_size=target_size)
    
    # Convert to array and add batch dimension
    img_array = img_to_array(img)
    img_batch = np.expand_dims(img_array, axis=0)
    
    # Preprocess for specific backbone
    img_preprocessed = tf.keras.applications.resnet50.preprocess_input(img_batch)
    
    return img_preprocessed

def save_prediction_results(image_path, prediction, probability, abcde_features, output_dir):
    """
    Save prediction results to a JSON file.
    
    Args:
        image_path: Path to the original image
        prediction: Model prediction
        probability: Prediction probability
        abcde_features: Dictionary of ABCDE features
        output_dir: Directory to save results
    
    Returns:
        Path to the saved JSON file
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract image filename
    image_filename = Path(image_path).stem
    
    # Create result dictionary
    result = {
        'image_path': str(image_path),
        'prediction': prediction,
        'confidence': float(probability),
        'abcde_features': {
            'asymmetry': {
                'score': float(abcde_features['asymmetry_score']),
                'high': bool(abcde_features['asymmetry_high'])
            },
            'border': {
                'score': float(abcde_features['border_score']),
                'irregular': bool(abcde_features['border_irregular'])
            },
            'color': {
                'variance_score': float(abcde_features['color_variance_score']),
                'num_colors': int(abcde_features['num_colors']),
                'variegated': bool(abcde_features['color_variegated'])
            },
            'diameter': {
                'mm': float(abcde_features['diameter_mm']),
                'large': bool(abcde_features['diameter_large'])
            },
            'evolution': abcde_features['evolution'],
            'malignant_indicators': int(abcde_features['malignant_indicators'])
        }
    }
    
    # Save to JSON file
    output_path = os.path.join(output_dir, f"{image_filename}_result.json")
    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2)
    
    return output_path

def batch_predict(model, image_dir, output_dir=None):
    """
    Run batch prediction on a directory of images.
    
    Args:
        model: Trained model
        image_dir: Directory containing images
        output_dir: Directory to save results (optional)
    
    Returns:
        List of prediction results
    """
    # Get image paths
    image_paths = []
    for ext in ['*.jpg', '*.jpeg', '*.png']:
        image_paths.extend(list(Path(image_dir).glob(ext)))
    
    results = []
    
    # Process each image
    for img_path in image_paths:
        try:
            # Predict
            prediction, probability, abcde_features = model.predict(str(img_path))
            
            # Create result dictionary
            result = {
                'image_path': str(img_path),
                'prediction': prediction,
                'confidence': probability,
                'abcde_features': abcde_features
            }
            
            results.append(result)
            
            # Save results if output directory is provided
            if output_dir:
                save_prediction_results(
                    img_path, prediction, probability, abcde_features, output_dir
                )
                
            print(f"Processed {img_path}: {prediction} ({probability:.2f})")
            
        except Exception as e:
            print(f"Error processing {img_path}: {e}")
    
    return results
