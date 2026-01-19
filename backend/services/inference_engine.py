"""
Inference Engine Service.
Responsibility: Load models and perform predictions on faces.
"""
import torch
import os
from models.architectures import DeepfakeCNN
from config import Config

class InferenceEngine:
    def __init__(self, model_path=None):
        self.device = torch.device('cpu')
        self.model = DeepfakeCNN()
        
        if model_path and os.path.exists(model_path):
            try:
                state_dict = torch.load(model_path, map_location=self.device)
                # Handle possible 'model' or 'state_dict' keys
                if 'state_dict' in state_dict:
                    state_dict = state_dict['state_dict']
                elif 'model' in state_dict:
                    state_dict = state_dict['model']
                
                # Handling prefix mismatch if saved from raw EfficientNet vs DeepfakeCNN wrapper
                new_state_dict = {}
                for k, v in state_dict.items():
                    if k.startswith('features.') or k.startswith('classifier.'):
                        new_key = f"efficientnet.{k}"
                        new_state_dict[new_key] = v
                    else:
                        new_state_dict[k] = v
                
                # Check if we primarily have mapped keys now, otherwise fallback to original
                # This check prevents breaking if the keys were already correct
                if any(k.startswith('efficientnet.') for k in new_state_dict.keys()) and not any(k.startswith('efficientnet.') for k in state_dict.keys()):
                    state_dict = new_state_dict

                self.model.load_state_dict(state_dict)
                print(f"Successfully loaded model weights from {model_path}")
            except Exception as e:
                print(f"Warning: Could not load model weights from {model_path}: {e}")
                
        self.model.to(self.device)
        self.model.eval()

    def predict(self, face_tensor):
        """
        Runs inference on a single face tensor.
        :param face_tensor: Normalized tensor [1, 3, 224, 224]
        :return: Probability of 'Fake' (float)
        """
        with torch.no_grad():
            output = self.model(face_tensor)
            # Apply softmax to get probabilities for [Real, Fake]
            probs = torch.softmax(output, dim=1)
            # Return probability of 'Fake' (index 1)
            fake_prob = probs[0][1].item()
        return fake_prob

    def predict_video(self, face_tensors):
        """
        Runs inference on multiple face tensors (video frames).
        :param face_tensors: List of normalized tensors.
        :return: List of probabilities.
        """
        probs = []
        for tensor in face_tensors:
            probs.append(self.predict(tensor))
        return probs
