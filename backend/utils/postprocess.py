"""
Post-processing utilities.
Responsibility: Aggregate probabilities and format labels.
"""
import numpy as np

def aggregate_predictions(probs):
    """
    Aggregates frame-wise probabilities into a final prediction.
    :param probs: List of floats (probabilities)
    :return: (final_prob, label)
    """
    if not probs:
        return 0.0, "UNKNOWN"
        
    # Sort probabilities to find the most suspicious frames
    probs.sort(reverse=True)
    
    # Strategy: Average the top 30% of frames. 
    # If a video is deepfaked, usually a continuous segment or significant number of frames are manipulated.
    # Simple mean dilutes the score if the video is long and mostly real.
    num_frames = len(probs)
    top_k = max(1, int(num_frames * 0.3))
    
    # Take the average of the most "fake" looking frames
    final_prob = float(np.mean(probs[:top_k]))
    label = "FAKE" if final_prob >= 0.5 else "REAL"
    confidence = final_prob if label == "FAKE" else (1 - final_prob)
    
    return final_prob, label, confidence * 100
