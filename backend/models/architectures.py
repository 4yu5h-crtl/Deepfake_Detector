"""
Model Architectures for Deepfake Detection.
Responsibility: Define the CNN and CNN+LSTM architectures.
"""
import torch
import torch.nn as nn
from torchvision import models

class DeepfakeCNN(nn.Module):
    def __init__(self):
        super(DeepfakeCNN, self).__init__()
        # Backbone: EfficientNet-B0
        self.efficientnet = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
        
        # Head as per TRD: GlobalAvgPool (done by efficientnet) -> Dense(128) -> ReLU -> Dense(1) -> Sigmoid
        num_ftrs = self.efficientnet.classifier[1].in_features
        self.efficientnet.classifier = nn.Sequential(
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(num_ftrs, 2)
        )

    def forward(self, x):
        return self.efficientnet(x)

class DeepfakeCNNLSTM(nn.Module):
    def __init__(self, cnn_backbone):
        super(DeepfakeCNNLSTM, self).__init__()
        # TRD: CNN as feature extractor
        self.feature_extractor = cnn_backbone
        # Remove the classifier head to get features
        # For EfficientNet-B0, features are before the classifier
        self.feature_extractor.efficientnet.classifier = nn.Identity()
        
        # LSTM settings per TRD: Hidden size: 256, Layers: 1, Bidirectional: False
        self.lstm = nn.LSTM(input_size=1280, hidden_size=256, num_layers=1, batch_first=True)
        self.fc = nn.Sequential(
            nn.Linear(256, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        # x shape: (batch, sequence, 3, 224, 224)
        batch_size, seq_len, c, h, w = x.size()
        x = x.view(batch_size * seq_len, c, h, w)
        features = self.feature_extractor(x) # (batch*seq, 1280)
        features = features.view(batch_size, seq_len, -1)
        
        lstm_out, _ = self.lstm(features)
        # Take the last hidden state
        last_out = lstm_out[:, -1, :]
        return self.fc(last_out)
