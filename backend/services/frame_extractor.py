"""
Frame Extractor Service.
Responsibility: Extract frames from video at a specified sampling rate.
"""
import cv2
import os

class FrameExtractor:
    def __init__(self, sample_rate=1, max_frames=20):
        self.sample_rate = sample_rate
        self.max_frames = max_frames

    def extract_frames(self, video_path):
        """
        Extracts frames from a video file.
        :param video_path: Path to the video file.
        :return: List of BGR images.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
            
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if fps == 0:
            return []
            
        frame_interval = int(fps / self.sample_rate) if self.sample_rate > 0 else 1
        
        frames = []
        count = 0
        while cap.isOpened() and len(frames) < self.max_frames:
            ret, frame = cap.read()
            if not ret:
                break
                
            if count % frame_interval == 0:
                frames.append(frame)
                
            count += 1
            
        cap.release()
        return frames
