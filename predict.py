"""
Script for making predictions on new skin lesion images.
"""
import os
import argparse
import cv2
import json
from pathlib import Path

from config import (
    SAVED_MODELS_DIR, IMG_SIZE, CNN_WEIGHT, ABCDE_WEIGHT
)
from src.models.hybrid_model import HybridModel

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Predict skin cancer from image')
    parser.add_argument('--image_path', type=str, required=True,
                        help='Path to the image to predict')
    parser.add_argument('--cnn_model_path', type=str, 
                        default=str(SAVED_MODELS_DIR / 'cnn_model.h5'),
                        help='Path to the trained CNN model')
    parser.add_argument('--rf_model_path', type=str, 
                        default=str(SAVED_MODELS_DIR / 'rf_model.joblib'),
                        help='Path to the trained RF model (optional)')
    parser.add_argument('--output_format', type=str, choices=['json', 'text'], 
                        default='json', help='Output format')
    
    return parser.parse_args()

def format_result_as_json(prediction, probability, abcde_features):
    """Format the prediction result as JSON."""
    result = {
        'prediction': prediction,
        'confidence': probability,
        'abcde_features': {
            'asymmetry': {
                'score': abcde_features['asymmetry_score'],
                'high': abcde_features['asymmetry_high']
            },
            'border': {
                'score': abcde_features['border_score'],
                'irregular': abcde_features['border_irregular']
            },
            'color': {
                'variance_score': abcde_features['color_variance_score'],
                'num_colors': abcde_features['num_colors'],
                'variegated': abcde_features['color_variegated']
            },
            'diameter': {
                'mm': abcde_features['diameter_mm'],
                'large': abcde_features['diameter_large']
            },
            'evolution': abcde_features['evolution'],
            'malignant_indicators': abcde_features['malignant_indicators']
        }
    }
    
    return json.dumps(result, indent=2)

def format_result_as_text(prediction, probability, abcde_features):
    """Format the prediction result as human-readable text."""
    result = f"Prediction: {prediction.upper()}\n"
    result += f"Confidence: {probability:.2f}\n\n"
    result += "ABCDE Features:\n"
    result += f"  A - Asymmetry: {abcde_features['asymmetry_score']:.2f} "
    result += "(High)" if abcde_features['asymmetry_high'] else "(Low)"
    result += "\n"
    
    result += f"  B - Border: {abcde_features['border_score']:.2f} "
    result += "(Irregular)" if abcde_features['border_irregular'] else "(Regular)"
    result += "\n"
    
    result += f"  C - Color: Variance {abcde_features['color_variance_score']:.2f}, "
    result += f"{abcde_features['num_colors']} colors "
    result += "(Variegated)" if abcde_features['color_variegated'] else "(Uniform)"
    result += "\n"
    
    result += f"  D - Diameter: {abcde_features['diameter_mm']:.2f} mm "
    result += "(Large)" if abcde_features['diameter_large'] else "(Small)"
    result += "\n"
    
    result += f"  E - Evolution: {abcde_features['evolution']}\n\n"
    
    result += f"Malignant Indicators: {abcde_features['malignant_indicators']} out of 4\n"
    
    return result

def predict_image(args):
    """Predict skin cancer from an image."""
    # Check if image exists
    if not os.path.isfile(args.image_path):
        print(f"Error: Image not found at {args.image_path}")
        return
    
    # Check if model exists
    if not os.path.isfile(args.cnn_model_path):
        print(f"Error: CNN model not found at {args.cnn_model_path}")
        return
    
    # Load image
    img = cv2.imread(args.image_path)
    if img is None:
        print(f"Error: Could not load image from {args.image_path}")
        return
    
    # Initialize hybrid model
    rf_model_path = args.rf_model_path if os.path.isfile(args.rf_model_path) else None
    hybrid_model = HybridModel(args.cnn_model_path, rf_model_path)
    
    # Make prediction
    prediction, probability, abcde_features = hybrid_model.predict(img)
    
    # Format result based on output format
    if args.output_format == 'json':
        result = format_result_as_json(prediction, probability, abcde_features)
    else:  # text
        result = format_result_as_text(prediction, probability, abcde_features)
    
    print(result)
    
    return prediction, probability, abcde_features

def main():
    """Main function."""
    args = parse_args()
    predict_image(args)

if __name__ == "__main__":
    main()
