import os
import shutil
import pandas as pd
from pathlib import Path

def preprocess_ham10000(ham10000_path, metadata_path, destination_path):
    """
    Preprocess HAM10000 dataset by distributing images into benign/malignant folders
    based on metadata CSV file
    
    Args:
        ham10000_path: Path to the HAM10000 images folders
        metadata_path: Path to the HAM10000_metadata.csv file
        destination_path: Path to save the binary classified dataset
    """
    print("Starting HAM10000 preprocessing...")
    
    # Define class mapping (HAM10000 class -> binary class)
    class_mapping = {
        'mel': 'malignant',  # Melanoma
        'bcc': 'malignant',  # Basal Cell Carcinoma
        'akiec': 'malignant',  # Actinic Keratosis
        'nv': 'benign',      # Melanocytic Nevus
        'bkl': 'benign',     # Benign Keratosis
        'df': 'benign',      # Dermatofibroma
        'vasc': 'benign'     # Vascular Lesion
    }
    
    # Load metadata
    df = pd.read_csv(metadata_path)
    print(f"Loaded metadata with {len(df)} entries")
    
    # Create destination folders matching friend's structure
    for split in ['train_set', 'test_set', 'val_set']:
        for class_name in ['benign', 'malignant']:
            os.makedirs(os.path.join(destination_path, split, class_name), exist_ok=True)
    
    # Split data: 70% train, 15% validation, 15% test
    # First, shuffle the data
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Determine split indices
    train_end = int(len(df) * 0.7)
    val_end = int(len(df) * 0.85)
    
    # Assign splits
    df.loc[:train_end, 'split'] = 'train_set'
    df.loc[train_end:val_end, 'split'] = 'val_set'
    df.loc[val_end:, 'split'] = 'test_set'
    
    # Process each image
    processed_count = 0
    for idx, row in df.iterrows():
        image_id = row['image_id']
        dx = row['dx']  # Diagnosis
        split = row['split']
        
        # Skip if class not in mapping
        if dx not in class_mapping:
            print(f"Warning: Unknown diagnosis {dx} for image {image_id}. Skipping.")
            continue
        
        binary_class = class_mapping[dx]
        
        # Find the image file (could be in part_1 or part_2)
        image_found = False
        for part in ['HAM10000_images_part_1', 'HAM10000_images_part_2']:
            img_path = os.path.join(ham10000_path, part, f"{image_id}.jpg")
            if os.path.exists(img_path):
                # Copy file to destination
                dst_path = os.path.join(destination_path, split, binary_class, f"ham_{dx}_{image_id}.jpg")
                shutil.copy2(img_path, dst_path)
                processed_count += 1
                image_found = True
                break
        
        if not image_found:
            print(f"Warning: Image {image_id} not found in HAM10000 folders. Skipping.")
        
        # Print progress every 500 images
        if processed_count % 500 == 0 and processed_count > 0:
            print(f"Processed {processed_count} images...")
    
    print(f"Successfully processed {processed_count} images")
    
    # Count files in each class for verification
    total_benign = 0
    total_malignant = 0
    for split in ['train_set', 'test_set', 'val_set']:
        for class_name in ['benign', 'malignant']:
            dir_path = os.path.join(destination_path, split, class_name)
            file_count = len([f for f in os.listdir(dir_path) if os.path.isfile(os.path.join(dir_path, f))])
            print(f"{split}/{class_name}: {file_count} images")
            if class_name == 'benign':
                total_benign += file_count
            else:
                total_malignant += file_count
    
    print(f"Total benign: {total_benign}, Total malignant: {total_malignant}")
    print("HAM10000 preprocessing completed!")

ham10000_path = "./ham10000"
metadata_path = "./HAM10000_metadata.csv"
destination_path = "./data/skin_dataset_resized"
    
preprocess_ham10000(ham10000_path, metadata_path, destination_path)