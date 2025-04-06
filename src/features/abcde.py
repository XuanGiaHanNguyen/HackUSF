"""
Module for extracting ABCDE features from skin lesion images.
ABCDE rule: Asymmetry, Border, Color, Diameter, Evolution.
"""
import cv2
import numpy as np
from scipy.spatial.distance import directed_hausdorff
from sklearn.cluster import KMeans
import math

from config import (
    ASYMMETRY_THRESHOLD,
    BORDER_THRESHOLD,
    COLOR_VARIANCE_THRESHOLD,
    DIAMETER_THRESHOLD_MM,
    NUM_COLORS_THRESHOLD
)

def segment_lesion(img):
    """
    Segment the skin lesion from an image.
    
    Returns:
        tuple: (segmented image, mask, contour)
    """
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Otsu's thresholding
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Morphological operations to clean up the mask
    kernel = np.ones((5, 5), np.uint8)
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
    
    # Find the largest contour (assumed to be the lesion)
    contours, _ = cv2.findContours(opening, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return img, None, None  # Return original image if no contours found
    
    # Get the largest contour
    largest_contour = max(contours, key=cv2.contourArea)
    
    # Create a mask with the largest contour
    mask = np.zeros_like(gray)
    cv2.drawContours(mask, [largest_contour], 0, 255, -1)
    
    # Apply the mask to the original image
    result = cv2.bitwise_and(img, img, mask=mask)
    
    return result, mask, largest_contour

def compute_asymmetry(mask):
    """
    Compute asymmetry score based on comparing flipped halves of the lesion.
    
    Returns:
        float: Asymmetry score (0-1, higher is more asymmetric)
    """
    if mask is None:
        return 0.0
    
    # Find moments and centroid of the mask
    M = cv2.moments(mask)
    if M["m00"] == 0:
        return 0.0
    
    cx = int(M["m10"] / M["m00"])
    cy = int(M["m01"] / M["m00"])
    
    # Split mask into left and right halves
    height, width = mask.shape
    left_half = mask[:, :cx]
    right_half = mask[:, cx:]
    
    # Flip right half for comparison
    right_half_flipped = cv2.flip(right_half, 1)
    
    # Resize to match dimensions for comparison
    max_width = max(left_half.shape[1], right_half_flipped.shape[1])
    left_half_resized = np.zeros((height, max_width), dtype=np.uint8)
    right_half_resized = np.zeros((height, max_width), dtype=np.uint8)
    
    left_half_resized[:, :left_half.shape[1]] = left_half
    right_half_resized[:, :right_half_flipped.shape[1]] = right_half_flipped
    
    # Compare the halves using Hausdorff distance
    left_points = np.argwhere(left_half_resized > 0)
    right_points = np.argwhere(right_half_resized > 0)
    
    if len(left_points) == 0 or len(right_points) == 0:
        return 0.0
    
    # Hausdorff distance (both directions)
    d1 = directed_hausdorff(left_points, right_points)[0]
    d2 = directed_hausdorff(right_points, left_points)[0]
    hausdorff_distance = max(d1, d2)
    
    # Normalize the distance by the width of the image
    asymmetry_score = min(hausdorff_distance / width, 1.0)
    
    return asymmetry_score

def compute_border_irregularity(contour):
    """
    Compute border irregularity using the compactness measure.
    
    Returns:
        float: Border irregularity score (0-1, higher is more irregular)
    """
    if contour is None:
        return 0.0
    
    # Calculate perimeter and area
    perimeter = cv2.arcLength(contour, True)
    area = cv2.contourArea(contour)
    
    if area == 0:
        return 0.0
    
    # Compute compactness (circularity)
    # Perfect circle has value of 1, higher values indicate more irregular shapes
    compactness = (perimeter ** 2) / (4 * np.pi * area)
    
    # Normalize to 0-1 range
    irregularity_score = min((compactness - 1) / 5, 1.0)  # Empirical normalization
    
    return irregularity_score

def compute_color_variance(segmented_img, mask):
    """
    Compute color variance and number of distinct colors in the lesion.
    
    Returns:
        tuple: (color_variance_score, num_colors)
    """
    if mask is None or segmented_img is None:
        return 0.0, 0
    
    # Convert to HSV color space for better color analysis
    hsv_img = cv2.cvtColor(segmented_img, cv2.COLOR_BGR2HSV)
    
    # Get pixels within the mask
    mask_bool = mask > 0
    lesion_pixels = hsv_img[mask_bool]
    
    if len(lesion_pixels) == 0:
        return 0.0, 0
    
    # Calculate color variance (using hue channel)
    hue_values = lesion_pixels[:, 0]
    color_variance = np.var(hue_values)
    
    # Normalize variance score
    color_variance_score = min(color_variance / COLOR_VARIANCE_THRESHOLD, 1.0)
    
    # Determine number of distinct colors using K-means clustering
    # Take a sample of pixels for efficiency
    max_samples = 1000
    if len(lesion_pixels) > max_samples:
        indices = np.random.choice(len(lesion_pixels), max_samples, replace=False)
        sample_pixels = lesion_pixels[indices]
    else:
        sample_pixels = lesion_pixels
    
    # Apply K-means to find color clusters
    k_max = 6  # Maximum number of colors to check
    
    # Calculate inertia for different k values
    inertias = []
    for k in range(1, k_max + 1):
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(sample_pixels)
        inertias.append(kmeans.inertia_)
    
    # Find optimal k using elbow method
    if len(inertias) <= 1:
        num_colors = 1
    else:
        # Calculate differences between consecutive inertias
        differences = np.diff(inertias)
        # Find where the difference becomes small (elbow point)
        differences_normalized = differences / np.max(np.abs(differences))
        elbow_point = np.argmin(differences_normalized) + 1  # +1 because diff reduces array size by 1
        num_colors = elbow_point + 1  # +1 because index starts at 0
    
    return color_variance_score, num_colors

def compute_diameter(contour, img_width, calibration_factor=1.0):
    """
    Compute the maximum diameter of the lesion.
    
    Args:
        contour: Lesion contour
        img_width: Width of the image in pixels
        calibration_factor: Factor to convert pixels to mm (if known)
    
    Returns:
        float: Diameter in mm (estimated)
    """
    if contour is None:
        return 0.0
    
    # Find minimum enclosing circle
    (_, _), radius = cv2.minEnclosingCircle(contour)
    diameter_px = 2 * radius
    
    # Convert to mm (estimate)
    # Assuming typical dermoscopic image covers ~2cm width
    # This is a rough estimate; in a clinical setting, you would use a proper calibration
    mm_per_pixel = 20.0 / img_width * calibration_factor
    diameter_mm = diameter_px * mm_per_pixel
    
    return diameter_mm

def extract_abcde_features(img):
    """
    Extract ABCDE features from an image.
    
    Args:
        img: Input image (BGR format)
    
    Returns:
        dict: ABCDE feature scores and interpretation
    """
    # Segment the lesion
    segmented_img, mask, contour = segment_lesion(img)
    
    if mask is None:
        return {
            'asymmetry_score': 0.0,
            'border_score': 0.0,
            'color_variance_score': 0.0,
            'num_colors': 0,
            'diameter_mm': 0.0,
            'evolution': 'unknown',  # Evolution requires multiple images or user input
            'asymmetry_high': False,
            'border_irregular': False,
            'color_variegated': False,
            'diameter_large': False,
            'malignant_indicators': 0
        }
    
    # A - Asymmetry
    asymmetry_score = compute_asymmetry(mask)
    asymmetry_high = asymmetry_score > ASYMMETRY_THRESHOLD
    
    # B - Border irregularity
    border_score = compute_border_irregularity(contour)
    border_irregular = border_score > BORDER_THRESHOLD
    
    # C - Color variance
    color_variance_score, num_colors = compute_color_variance(segmented_img, mask)
    color_variegated = (num_colors >= NUM_COLORS_THRESHOLD)
    
    # D - Diameter
    h, w = img.shape[:2]
    diameter_mm = compute_diameter(contour, w)
    diameter_large = diameter_mm > DIAMETER_THRESHOLD_MM
    
    # E - Evolution (requires user input or multiple images)
    evolution = 'unknown'
    
    # Count malignant indicators
    malignant_indicators = sum([
        asymmetry_high,
        border_irregular,
        color_variegated,
        diameter_large
    ])
    
    return {
        'asymmetry_score': float(asymmetry_score),
        'border_score': float(border_score),
        'color_variance_score': float(color_variance_score),
        'num_colors': int(num_colors),
        'diameter_mm': float(diameter_mm),
        'evolution': evolution,
        'asymmetry_high': bool(asymmetry_high),
        'border_irregular': bool(border_irregular),
        'color_variegated': bool(color_variegated),
        'diameter_large': bool(diameter_large),
        'malignant_indicators': int(malignant_indicators)
    }

def get_abcde_probability(features):
    """
    Calculate malignancy probability based on ABCDE features.
    
    Args:
        features: Dict of ABCDE features
    
    Returns:
        float: Probability of malignancy (0-1)
    """
    # Simple heuristic based on number of malignant indicators
    indicators = features['malignant_indicators']
    total_indicators = 4  # A, B, C, D (excluding E which is usually unknown)
    
    # Base probability on percentage of indicators present
    base_prob = indicators / total_indicators
    
    # Weight the indicators (can be adjusted based on medical literature)
    weighted_prob = (
        0.3 * features['asymmetry_high'] +
        0.25 * features['border_irregular'] +
        0.25 * features['color_variegated'] +
        0.2 * features['diameter_large']
    )
    
    # Return average of the two approaches
    return (base_prob + weighted_prob) / 2