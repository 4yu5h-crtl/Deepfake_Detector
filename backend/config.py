"""
Configuration settings for the Multi-Modal Deepfake Detection System.
"""
import os

class Config:
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-12345')
    DEBUG = False
    
    # Upload settings
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4', 'avi'}
    
    # Model settings
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH_CNN = os.path.join(BASE_DIR, 'models', 'cnn_baseline.pt')
    MODEL_PATH_LSTM = os.path.join(BASE_DIR, 'models', 'cnn_lstm.pt')
    
    # Inference settings
    FACE_DETECTION_THRESHOLD = 0.90
    FRAME_SAMPLE_RATE = 1  # 1 frame per second
    MAX_FRAMES_PER_VIDEO = 20
    IMAGE_SIZE = (224, 224)
    
    # Explainability
    TOP_K_FAKE_FRAMES = 3
    
    # Thresholds
    PREDICTION_THRESHOLD = 0.5
