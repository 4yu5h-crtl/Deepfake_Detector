"""
Explainability Service using Grad-CAM.
Responsibility: Generate heatmaps highlighting manipulated regions.
"""
import torch
import torch.nn.functional as F
import numpy as np
import cv2

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.hook_layers()

    def hook_layers(self):
        def forward_hook(module, input, output):
            self.activations = output
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0]

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate_heatmap(self, input_tensor):
        """
        Generates a Grad-CAM heatmap for the given input.
        """
        self.model.zero_grad()
        output = self.model(input_tensor)
        
        # Target: probability of "Fake"
        # output is shape [1, 2] (Real, Fake), so we target index 1
        output[0][1].backward()
        
        # Pull gradients and activations
        gradients = self.gradients.detach().cpu().numpy()[0]
        activations = self.activations.detach().cpu().numpy()[0]
        
        # GAP of gradients
        weights = np.mean(gradients, axis=(1, 2))
        
        # Weighted sum of activations
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i]
            
        # ReLU on CAM
        cam = np.maximum(cam, 0)
        
        # Resize to 224x224
        cam = cv2.resize(cam, (224, 224))
        
        # Normalize
        cam = cam - np.min(cam)
        cam = cam / (np.max(cam) + 1e-8)
        
        return cam

    def apply_on_image(self, original_image, heatmap):
        """
        Overlays heatmap on original image.
        :param original_image: RGB numpy array (224, 224)
        :param heatmap: Normalised 2D numpy array
        """
        heatmap_color = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
        
        overlay = cv2.addWeighted(original_image, 0.6, heatmap_color, 0.4, 0)
        return overlay
