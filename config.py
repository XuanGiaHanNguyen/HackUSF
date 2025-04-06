"""
Configuration file for the skin cancer detection project.
"""
import os
from pathlib import Path

# Project paths
ROOT_DIR = Path(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = ROOT_DIR / "data"
DATASET_DIR = DATA_DIR / "skin_dataset_resized"  # Path to your existing dataset
MODELS_DIR = ROOT_DIR / "models"
SAVED_MODELS_DIR = MODELS_DIR / "saved_models"

# Ensure directories exist
for dir_path in [SAVED_MODELS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Dataset paths - updated for your structure
TRAIN_DIR = DATASET_DIR / "train_set"
VAL_DIR = DATASET_DIR / "val_set"
TEST_DIR = DATASET_DIR / "test_set"

# Image processing
IMG_SIZE = (224, 224)  # Standard for many CNNs
BATCH_SIZE = 32
NORMALIZE_MEAN = [0.485, 0.456, 0.406]  # ImageNet mean
NORMALIZE_STD = [0.229, 0.224, 0.225]   # ImageNet std

# Model parameters
BACKBONE = "resnet50"
NUM_CLASSES = 2  # Binary: benign or malignant
LEARNING_RATE = 0.0001
NUM_EPOCHS = 50
EARLY_STOPPING_PATIENCE = 10

# ABCDE rule thresholds
ASYMMETRY_THRESHOLD = 0.2      # Higher value = more asymmetry
BORDER_THRESHOLD = 0.3         # Higher value = more irregular
COLOR_VARIANCE_THRESHOLD = 20  # Higher value = more color variation
DIAMETER_THRESHOLD_MM = 6      # Standard ABCDE rule threshold
NUM_COLORS_THRESHOLD = 3       # Multiple colors suggest malignancy

# Classification thresholds
CONFIDENCE_THRESHOLD = 0.5  # Above this is considered malignant

# Model weights
CNN_WEIGHT = 0.7
ABCDE_WEIGHT = 0.3