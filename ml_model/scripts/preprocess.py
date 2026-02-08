"""
Satellite Data Preprocessor
Handles data normalization and feature extraction
Note: This is a stub module for Python integration.
The actual system uses JavaScript ML models in the backend.
"""

import numpy as np
import pandas as pd


class SatelliteDataPreprocessor:
    """Preprocess satellite imagery for ML models"""
    
    def __init__(self):
        self.image_size = (256, 256)
        self.bands = ['RED', 'GREEN', 'BLUE', 'NIR', 'SWIR1', 'SWIR2']
        self.scaler = None
    
    def normalize_bands(self, data):
        """Normalize spectral bands to 0-1 range"""
        if isinstance(data, (list, tuple)):
            data = np.array(data)
        return (data - data.min()) / (data.max() - data.min() + 1e-8)
    
    def extract_features(self, satellite_data):
        """Extract features from satellite data"""
        if satellite_data is None:
            return np.zeros((256, 256, 4))
        
        # Handle both dict and array inputs
        if isinstance(satellite_data, dict):
            # Real API data format
            nir = satellite_data.get('nirBand', np.random.rand(256, 256) * 255)
            red = satellite_data.get('redBand', np.random.rand(256, 256) * 200)
        else:
            # Array format
            nir = satellite_data[:, :, 3] if satellite_data.ndim == 3 else np.random.rand(256, 256) * 255
            red = satellite_data[:, :, 0] if satellite_data.ndim == 3 else np.random.rand(256, 256) * 200
        
        # Ensure proper numpy arrays
        nir = np.asarray(nir, dtype=np.float32)
        red = np.asarray(red, dtype=np.float32)
        
        # Calculate NDVI
        denominator = nir + red
        ndvi = np.divide((nir - red), denominator, 
                        out=np.zeros_like(nir), 
                        where=denominator != 0)
        
        return {
            'ndvi': self.normalize_bands(ndvi),
            'nir': self.normalize_bands(nir),
            'red': self.normalize_bands(red),
            'ndvi_mean': float(np.nanmean(ndvi))
        }
    
    def preprocess(self, satellite_data):
        """Complete preprocessing pipeline"""
        return self.extract_features(satellite_data)
