import os
import torch
from urllib.request import urlretrieve

def download_weights():
    # Model: EfficientNet-B0 trained on FaceForensics++ (C23)
    # Source: Xicor9 on Hugging Face
    url = "https://huggingface.co/Xicor9/efficientnet-b0-ffpp-c23/resolve/main/efficientnet_b0_ffpp_c23.pth?download=true"
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "models")
    target_path = os.path.join(models_dir, "cnn_baseline.pt")
    
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)
        
    print(f"🚀 Downloading high-accuracy pre-trained weights...")
    print(f"📂 Target: {target_path}")
    
    try:
        # Using urlretrieve for simple download without extra dependencies like requests
        urlretrieve(url, target_path)
        print("✅ Download complete!")
        
        # Verify it's a valid torch file
        try:
            torch.load(target_path, map_location='cpu')
            print("💎 Weights verified successfully!")
        except Exception as e:
            print(f"❌ Verification failed (file might be corrupted): {e}")
            
    except Exception as e:
        print(f"❌ Download failed: {e}")

if __name__ == "__main__":
    download_weights()
