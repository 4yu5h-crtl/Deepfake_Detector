import cv2
import torch
import base64
import numpy as np
import tempfile
import os
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from services.face_detector import FaceDetector
from services.frame_extractor import FrameExtractor
from services.inference_engine import InferenceEngine
from services.explainability import GradCAM
from utils.preprocess import Preprocessor
from utils.postprocess import aggregate_predictions
from config import Config
from routes.upload import in_memory_store



# Initialize services
face_detector = FaceDetector()
frame_extractor = FrameExtractor()
preprocessor = Preprocessor()
inference_engine = InferenceEngine(model_path=Config.MODEL_PATH_CNN)
grad_cam = GradCAM(inference_engine.model, inference_engine.model.efficientnet.features[-1])

inference_bp = APIRouter()

class PredictRequest(BaseModel):
    filename: str
    type: str = "image"

@inference_bp.post("/predict")
async def predict(request: PredictRequest):
    file_id = request.filename
    input_type = request.type
    
    if file_id not in in_memory_store:
        raise HTTPException(status_code=404, detail="File not found in memory")
        
    file_data = in_memory_store[file_id]
    file_content = file_data["content"]
    
    try:
        results = {
            "input_type": input_type,
            "frame_predictions": []
        }
        
        frames = []
        if input_type == 'video':
            # OpenCV VideoCapture needs a file path, so we use a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
                temp_file.write(file_content)
                temp_path = temp_file.name
            
            try:
                frames = frame_extractor.extract_frames(temp_path)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        else:
            # For images, we can decode directly from memory
            nparr = np.frombuffer(file_content, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None:
                frames = [img]
                
        if not frames:
            raise HTTPException(status_code=400, detail="Could not read frames")
            
        face_tensors = []
        cropped_faces = []
        
        for i, frame in enumerate(frames):
            face, box = face_detector.detect_and_crop(frame)
            if face is not None:
                cropped_faces.append((face, i))
                tensor = preprocessor.preprocess(face)
                face_tensors.append(tensor)
                
        if not face_tensors:
            raise HTTPException(status_code=400, detail="No faces detected in input")
            
        probs = inference_engine.predict_video(face_tensors)
        
        for i, prob in enumerate(probs):
            results["frame_predictions"].append({
                "id": i + 1,
                "prob": prob
            })
            
        final_prob, label, confidence = aggregate_predictions(probs)
        results["final_prediction"] = label
        results["confidence"] = confidence
        
        heatmaps = []
        full_heatmap_images = []
        sorted_indices = sorted(range(len(probs)), key=lambda k: probs[k], reverse=True)
        top_k = Config.TOP_K_FAKE_FRAMES
        
        for idx in sorted_indices[:top_k]:
            prob = probs[idx]
            if prob >= 0.5:
                face_img, frame_id = cropped_faces[idx]
                tensor = face_tensors[idx]
                
                heatmap_arr = grad_cam.generate_heatmap(tensor)
                face_resized = cv2.resize(face_img, (224, 224))
                overlay = grad_cam.apply_on_image(face_resized, heatmap_arr)
                
                # Convert overlay to base64
                _, buffer = cv2.imencode('.jpg', cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
                base64_str = base64.b64encode(buffer).decode('utf-8')
                heatmaps.append(f"data:image/jpeg;base64,{base64_str}")
                full_heatmap_images.append(overlay)
                
        results["heatmaps"] = heatmaps
        results["full_heatmaps"] = full_heatmap_images
        
        # Create a clean response object without non-serializable data
        # 'full_heatmaps' contains numpy arrays which cannot be serialized to JSON
        response_results = results.copy()
        if "full_heatmaps" in response_results:
            del response_results["full_heatmaps"]
        
        return response_results
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
