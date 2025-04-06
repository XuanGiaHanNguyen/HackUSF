"""
CNN model for skin cancer classification.
"""
import tensorflow as tf
from tensorflow.keras import layers, models, applications
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

from config import (
    IMG_SIZE, BATCH_SIZE, NUM_CLASSES, LEARNING_RATE,
    NORMALIZE_MEAN, NORMALIZE_STD, BACKBONE
)

def create_data_generators(train_dir, val_dir, test_dir=None):
    """
    Create data generators for training, validation, and optionally test sets.
    """
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        preprocessing_function=applications.resnet50.preprocess_input,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Only preprocessing for validation/test
    val_datagen = ImageDataGenerator(
        preprocessing_function=applications.resnet50.preprocess_input
    )
    
    # Create generators
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    if test_dir:
        test_generator = val_datagen.flow_from_directory(
            test_dir,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=False
        )
        return train_generator, val_generator, test_generator
    
    return train_generator, val_generator

def build_model():
    """
    Build a CNN model using transfer learning.
    
    Returns:
        tf.keras.Model: Compiled model
    """
    # Base model
    if BACKBONE == "resnet50":
        base_model = applications.ResNet50(
            include_top=False,
            weights='imagenet',
            input_shape=(*IMG_SIZE, 3)
        )
    elif BACKBONE == "inception_v3":
        base_model = applications.InceptionV3(
            include_top=False,
            weights='imagenet',
            input_shape=(*IMG_SIZE, 3)
        )
    else:
        raise ValueError(f"Unsupported backbone: {BACKBONE}")
    
    # Freeze base model layers
    for layer in base_model.layers:
        layer.trainable = False
    
    # Create model
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(128, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC()]
    )
    
    return model

def unfreeze_layers(model, percent_to_unfreeze=0.3):
    """
    Unfreeze some percentage of the base model layers for fine-tuning.
    
    Args:
        model: Keras model
        percent_to_unfreeze: Percentage of layers to unfreeze (from the end)
    """
    # Get the base model (first layer in our sequential model)
    base_model = model.layers[0]
    
    # Calculate how many layers to unfreeze
    total_layers = len(base_model.layers)
    unfreeze_from = int(total_layers * (1 - percent_to_unfreeze))
    
    # Unfreeze layers
    for layer in base_model.layers[unfreeze_from:]:
        layer.trainable = True
    
    # Recompile with a lower learning rate for fine-tuning
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE / 10),
        loss='categorical_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC()]
    )
    
    return model

def train_model(model, train_generator, val_generator, save_path, epochs=50, fine_tune=True):
    """
    Train the model with early stopping and learning rate reduction.
    
    Args:
        model: Compiled Keras model
        train_generator: Training data generator
        val_generator: Validation data generator
        save_path: Path to save the best model
        epochs: Maximum number of epochs to train
        fine_tune: Whether to fine-tune the model after initial training
    
    Returns:
        trained model, history
    """
    # Callbacks
    checkpoint = ModelCheckpoint(
        save_path,
        monitor='val_accuracy',
        verbose=1,
        save_best_only=True,
        mode='max'
    )
    
    early_stopping = EarlyStopping(
        monitor='val_accuracy',
        patience=10,
        restore_best_weights=True
    )
    
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=5,
        min_lr=1e-6
    )
    
    callbacks = [checkpoint, early_stopping, reduce_lr]
    
    # Initial training with frozen base model
    print("Training with frozen base layers...")
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator,
        callbacks=callbacks
    )
    
    # Fine-tuning
    if fine_tune:
        print("Fine-tuning model...")
        model = unfreeze_layers(model)
        
        # Fine-tune for a few more epochs
        fine_tune_history = model.fit(
            train_generator,
            epochs=20,  # Fewer epochs for fine-tuning
            validation_data=val_generator,
            callbacks=callbacks
        )
        
        # Combine histories
        for key in history.history.keys():
            history.history[key].extend(fine_tune_history.history[key])
    
    return model, history

def load_model(model_path):
    """
    Load a saved model.
    
    Args:
        model_path: Path to the saved model
    
    Returns:
        tf.keras.Model: Loaded model
    """
    return tf.keras.models.load_model(model_path)

def get_feature_extractor(model):
    """
    Create a feature extractor from a trained model.
    
    Args:
        model: Trained Keras model
    
    Returns:
        tf.keras.Model: Feature extractor model
    """
    # Remove the last dense layer to get features
    feature_extractor = tf.keras.models.Model(
        inputs=model.input,
        outputs=model.layers[-3].output  # Before the final dense layer
    )
    
    return feature_extractor