"""
Face Detection Service using MTCNN.
Responsibility: Detect and crop faces from images/frames.
"""
import cv2
import numpy as np
from facenet_pytorch import MTCNN
import torch

class FaceDetector:
    def __init__(self, threshold=0.90):
        # Force CPU as per TRD
        self.device = torch.device('cpu')
        self.detector = MTCNN(
            keep_all=False, 
            device=self.device,
            thresholds=[0.6, 0.7, 0.7], # default internal thresholds
            min_face_size=20,
            selection_method='probability'
        )
        self.conf_threshold = threshold

    def detect_and_crop(self, image):
        """
        Detects the primary face and returns a cropped RGB image.
        :param image: numpy array (BGR or RGB)
        :return: cropped_face (RGB numpy array) or None
        """
        if image is None:
            return None
            
        # Convert BGR to RGB if necessary
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) if image.shape[2] == 3 else image
        
        # Detect faces
        boxes, probs = self.detector.detect(image_rgb)
        
        if boxes is not None and len(boxes) > 0:
            # Get the best face
            best_idx = np.argmax(probs)
            if probs[best_idx] >= self.conf_threshold:
                box = boxes[best_idx].astype(int)
                # Ensure box within image boundaries
                x1, y1, x2, y2 = box
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(image_rgb.shape[1], x2), min(image_rgb.shape[0], y2)
                
                cropped_face = image_rgb[y1:y2, x1:x2]
                return cropped_face, box
                
        return None, None
