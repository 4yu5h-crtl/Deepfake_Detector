"""
Preprocessing utilities for Multi-Modal Deepfake Detection.
Responsibility: Resize and normalize images for PyTorch models.
"""
import torch
from torchvision import transforms
from PIL import Image
import numpy as np

class Preprocessor:
    def __init__(self, image_size=(224, 224)):
        self.transform = transforms.Compose([
            transforms.Resize(image_size),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406], # ImageNet mean
                std=[0.229, 0.224, 0.225]   # ImageNet std
            )
        ])

    def preprocess(self, face_image):
        """
        Preprocess a single face image (numpy array RGB).
        :param face_image: RGB numpy array.
        :return: Normalized PyTorch tensor.
        """
        if face_image is None:
            return None
            
        # Convert numpy to PIL
        if isinstance(face_image, np.ndarray):
            face_image = Image.fromarray(face_image)
            
        # Apply transforms
        tensor = self.transform(face_image)
        
        # Add batch dimension [1, 3, 224, 224]
        return tensor.unsqueeze(0)
