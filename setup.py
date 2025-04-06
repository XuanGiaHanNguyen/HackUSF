"""
Setup script to prepare the project structure with existing dataset.
"""
import os
from pathlib import Path
import shutil
import sys

def create_directory_structure():
    """Create the directory structure for the project."""
    # Project root
    root_dir = Path(__file__).parent.absolute()
    
    # Create directories
    dirs = [
        root_dir / "models" / "saved_models",
        root_dir / "src" / "features",
        root_dir / "src" / "models",
        root_dir / "src" / "utils",
    ]
    
    for dir_path in dirs:
        dir_path.mkdir(parents=True, exist_ok=True)
        # Create __init__.py file in each directory
        init_file = dir_path / "__init__.py"
        if not init_file.exists():
            with open(init_file, 'w') as f:
                f.write("# Init file for package\n")
    
    # Create root __init__.py
    with open(root_dir / "src" / "__init__.py", 'w') as f:
        f.write("# Init file for src package\n")
    
    print("Directory structure created successfully.")

def check_dataset_structure():
    """Check if the dataset structure is correct."""
    root_dir = Path(__file__).parent.absolute()
    dataset_dir = root_dir / "data" / "skin_dataset_resized"
    
    if not dataset_dir.exists():
        print(f"Error: Dataset directory not found at {dataset_dir}")
        print("Please create the data directory and copy your dataset there.")
        print("Expected structure:")
        print("  data/skin_dataset_resized/")
        print("    ├── train_set/")
        print("    │   ├── benign/")
        print("    │   └── malignant/")
        print("    ├── val_set/")
        print("    │   ├── benign/")
        print("    │   └── malignant/")
        print("    └── test_set/")
        print("        ├── benign/")
        print("        └── malignant/")
        return False
    
    # Check for required subdirectories
    required_dirs = [
        dataset_dir / "train_set" / "benign",
        dataset_dir / "train_set" / "malignant",
        dataset_dir / "val_set" / "benign",
        dataset_dir / "val_set" / "malignant",
        dataset_dir / "test_set" / "benign",
        dataset_dir / "test_set" / "malignant"
    ]
    
    missing_dirs = [str(d) for d in required_dirs if not d.exists()]
    
    if missing_dirs:
        print("Error: The following required directories are missing:")
        for d in missing_dirs:
            print(f"  - {d}")
        print("\nPlease ensure your dataset is structured correctly.")
        return False
    
    # Quick check for images in each directory
    empty_dirs = []
    for dir_path in required_dirs:
        image_files = list(dir_path.glob("*.jpg")) + list(dir_path.glob("*.jpeg")) + list(dir_path.glob("*.png"))
        if not image_files:
            empty_dirs.append(str(dir_path))
    
    if empty_dirs:
        print("Warning: The following directories do not contain any image files:")
        for d in empty_dirs:
            print(f"  - {d}")
        print("\nPlease ensure your dataset contains images.")
        return False
    
    print("Dataset structure verified successfully.")
    return True

def main():
    """Main function."""
    print("Setting up Skin Cancer Detection project...")
    
    # Create directory structure
    create_directory_structure()
    
    # Check dataset structure
    if not check_dataset_structure():
        print("\nSetup incomplete. Please fix the issues above and run setup.py again.")
        return
    
    print("\nSetup complete!")
    print("\nNext steps:")
    print("1. Train the model:")
    print("   python train.py --epochs 50 --fine_tune --train_hybrid")
    print("\n2. Make predictions:")
    print("   python predict.py --image_path path/to/your/image.jpg")
    print("\n3. Run the API server (optional):")
    print("   python api.py")

if __name__ == "__main__":
    main()
