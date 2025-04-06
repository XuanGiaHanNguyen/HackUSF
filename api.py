"""
API server for skin cancer detection.
"""
import os
import json
import tempfile
from pathlib import Path
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

from config import SAVED_MODELS_DIR
from src.models.hybrid_model import HybridModel

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load model globally for faster prediction
CNN_MODEL_PATH = SAVED_MODELS_DIR / 'cnn_model.h5'
RF_MODEL_PATH = SAVED_MODELS_DIR / 'rf_model.joblib'

# Check if models exist
if not os.path.isfile(CNN_MODEL_PATH):
    print(f"Warning: CNN model not found at {CNN_MODEL_PATH}")
    print("Please train the model first using train.py")

# Initialize model (will be loaded on first request if lazy_loading=True)
hybrid_model = None
lazy_loading = True

def get_model():
    """Get or initialize the model."""
    global hybrid_model
    if hybrid_model is None:
        print("Loading model...")
        rf_path = RF_MODEL_PATH if os.path.isfile(RF_MODEL_PATH) else None
        hybrid_model = HybridModel(CNN_MODEL_PATH, rf_path)
    return hybrid_model

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok'})

@app.route('/predict', methods=['POST'])
def predict():
    """Predict endpoint."""
    if 'image' not in request.files and 'image' not in request.form:
        return jsonify({'error': 'No image provided'}), 400
    
    try:
        # Get model
        model = get_model()
        
        # Process image
        if 'image' in request.files:
            # Handle file upload
            file = request.files['image']
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp:
                file.save(temp.name)
                img = cv2.imread(temp.name)
                os.unlink(temp.name)  # Delete temporary file
        else:
            # Handle base64 image
            base64_img = request.form['image']
            if base64_img.startswith('data:image'):
                # Remove data URL prefix if present
                base64_img = base64_img.split(',')[1]
            
            img_data = base64.b64decode(base64_img)
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({'error': 'Invalid image'}), 400
        
        # Make prediction
        prediction, probability, abcde_features = model.predict(img)
        
        # Format result
        result = {
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
        
        return jsonify(result)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load model immediately if not using lazy loading
    if not lazy_loading:
        get_model()
    
    # Start the server
    app.run(host='0.0.0.0', port=5000, debug=True)
