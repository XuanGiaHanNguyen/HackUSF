"""
Script for training the skin cancer detection model.
"""
import os
import argparse
import tensorflow as tf
from pathlib import Path
import joblib
import numpy as np
from glob import glob

from config import (
    TRAIN_DIR, VAL_DIR, TEST_DIR, SAVED_MODELS_DIR,
    NUM_EPOCHS, BATCH_SIZE
)
from src.models.cnn_model import (
    build_model, create_data_generators, train_model
)
from src.models.hybrid_model import HybridModel

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Train skin cancer detection model')
    parser.add_argument('--train_dir', type=str, default=str(TRAIN_DIR),
                        help='Directory containing training data')
    parser.add_argument('--val_dir', type=str, default=str(VAL_DIR),
                        help='Directory containing validation data')
    parser.add_argument('--test_dir', type=str, default=str(TEST_DIR),
                        help='Directory containing test data')
    parser.add_argument('--model_dir', type=str, default=str(SAVED_MODELS_DIR),
                        help='Directory to save models')
    parser.add_argument('--epochs', type=int, default=NUM_EPOCHS,
                        help='Number of epochs to train')
    parser.add_argument('--batch_size', type=int, default=BATCH_SIZE,
                        help='Batch size for training')
    parser.add_argument('--fine_tune', action='store_true',
                        help='Whether to fine-tune the model after initial training')
    parser.add_argument('--train_hybrid', action='store_true',
                        help='Whether to train the hybrid model')
    
    return parser.parse_args()

def train_cnn_model(args):
    """Train the CNN model."""
    print("Training CNN model...")
    
    # Data generators
    train_dir = args.train_dir
    val_dir = args.val_dir
    test_dir = args.test_dir
    
    # Verify that directories exist
    for dir_path in [train_dir, val_dir, test_dir]:
        if not os.path.exists(dir_path):
            print(f"Error: Directory not found: {dir_path}")
            return None
    
    # Check for class directories
    for dir_path in [train_dir, val_dir, test_dir]:
        benign_dir = os.path.join(dir_path, 'benign')
        malignant_dir = os.path.join(dir_path, 'malignant')
        
        if not os.path.exists(benign_dir) or not os.path.exists(malignant_dir):
            print(f"Error: Class directories not found in {dir_path}")
            print(f"Expected: {benign_dir} and {malignant_dir}")
            return None
    
    # Create data generators
    try:
        train_generator, val_generator, test_generator = create_data_generators(
            train_dir, val_dir, test_dir
        )
    except Exception as e:
        print(f"Error creating data generators: {e}")
        return None
    
    # Build model
    model = build_model()
    
    # Create save path
    os.makedirs(args.model_dir, exist_ok=True)
    save_path = os.path.join(args.model_dir, 'cnn_model.h5')
    
    # Train model
    model, history = train_model(
        model,
        train_generator,
        val_generator,
        save_path,
        epochs=args.epochs,
        fine_tune=args.fine_tune
    )
    
    # Evaluate on test set
    print("Evaluating model on test set...")
    test_loss, test_acc, test_auc = model.evaluate(test_generator)
    print(f"Test accuracy: {test_acc:.4f}")
    print(f"Test AUC: {test_auc:.4f}")
    
    return save_path

def train_hybrid_model(args, cnn_model_path):
    """Train the hybrid model."""
    print("Training hybrid model (RF classifier on top of CNN + ABCDE features)...")
    
    # Load CNN model
    hybrid_model = HybridModel(cnn_model_path)
    
    # Get image paths and labels for training the RF model
    train_dir = args.train_dir
    benign_dir = os.path.join(train_dir, 'benign')
    malignant_dir = os.path.join(train_dir, 'malignant')
    
    benign_paths = glob(os.path.join(benign_dir, '*.jpg'))
    if not benign_paths:
        benign_paths = glob(os.path.join(benign_dir, '*.jpeg'))
    if not benign_paths:
        benign_paths = glob(os.path.join(benign_dir, '*.png'))
    
    malignant_paths = glob(os.path.join(malignant_dir, '*.jpg'))
    if not malignant_paths:
        malignant_paths = glob(os.path.join(malignant_dir, '*.jpeg'))
    if not malignant_paths:
        malignant_paths = glob(os.path.join(malignant_dir, '*.png'))
    
    # Limit to a subset for efficiency if needed
    max_samples = 1000
    if len(benign_paths) > max_samples:
        benign_paths = benign_paths[:max_samples]
    if len(malignant_paths) > max_samples:
        malignant_paths = malignant_paths[:max_samples]
    
    if not benign_paths or not malignant_paths:
        print(f"Error: Could not find image files in {benign_dir} or {malignant_dir}")
        return None
    
    image_paths = benign_paths + malignant_paths
    labels = [0] * len(benign_paths) + [1] * len(malignant_paths)
    
    print(f"Training hybrid model on {len(image_paths)} images...")
    print(f"Class distribution: {len(benign_paths)} benign, {len(malignant_paths)} malignant")
    
    # Train the RF model
    rf_model = hybrid_model.train_rf_model(image_paths, labels)
    
    # Save the RF model
    rf_model_path = os.path.join(args.model_dir, 'rf_model.joblib')
    hybrid_model.save_rf_model(rf_model_path)
    
    return rf_model_path

def main():
    """Main function."""
    args = parse_args()
    
    print(f"Training with data from:")
    print(f"  Train: {args.train_dir}")
    print(f"  Validation: {args.val_dir}")
    print(f"  Test: {args.test_dir}")
    
    # Train CNN model
    cnn_model_path = train_cnn_model(args)
    
    if cnn_model_path is None:
        print("CNN model training failed. Exiting.")
        return
    
    # Train hybrid model if requested
    if args.train_hybrid:
        rf_model_path = train_hybrid_model(args, cnn_model_path)
        if rf_model_path:
            print(f"Hybrid model training complete. Models saved to:")
            print(f"  CNN model: {cnn_model_path}")
            print(f"  RF model: {rf_model_path}")
        else:
            print("Hybrid model training failed.")
    else:
        print(f"CNN model training complete. Model saved to: {cnn_model_path}")

if __name__ == "__main__":
    main()
