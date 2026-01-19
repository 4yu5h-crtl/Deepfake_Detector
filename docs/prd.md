# **Product Requirements Document (PRD)**

## **Project Title**

**Multi-Modal Deepfake Detection System (Image & Video)**

---

## **1. Objective**

Develop a **final-year major project** that detects deepfake content from **images and videos**, running on a **CPU-only local laptop**, providing:

* Binary classification (Real / Fake)
* Confidence score
* Frame-wise fake probability (videos)
* Visual localization of manipulation (heatmap / bounding box)
* Downloadable analysis report (PDF & JSON)
* Modular architecture that supports scaling from **CNN-only** to **CNN + LSTM**

---

## **2. In-Scope / Out-of-Scope**

### **In-Scope**

* Offline inference (no cloud dependency)
* Image and video uploads
* Face-centric analysis only
* Flask backend with web UI
* DFDC dataset for training
* Celeb-DF for validation/testing
* Explainable AI visualization (Grad-CAM)

### **Out-of-Scope**

* Audio-based deepfake detection
* Real-time webcam inference
* Mobile deployment
* Transformer-based architectures (future only)

---

## **3. User Flow (Exact)**

1. User opens web UI (localhost)
2. Uploads **image or video**
3. System detects faces
4. Model performs inference
5. UI displays:

   * Real/Fake label
   * Confidence %
   * Frame-wise graph (video)
   * Manipulation heatmap overlay
6. User downloads:

   * PDF report
   * JSON raw output

---

## **4. Functional Requirements**

### **4.1 Input Handling**

* Supported formats:

  * Images: `.jpg`, `.jpeg`, `.png`
  * Videos: `.mp4`, `.avi`
* Max file size: **100 MB**
* Single upload per request

---

### **4.2 Face Processing Module**

* Face detector: **MTCNN**
* Operations:

  * Frame extraction (video: 1 FPS configurable)
  * Face cropping (aligned)
  * Resize to `224 × 224`
* Reject input if **no face detected**

---

### **4.3 ML Pipeline (Phased)**

#### **Phase 1 – CNN-Only (Baseline)**

* Model: **EfficientNet-B0 (pretrained on ImageNet)**
* Input: Single face frame
* Output:

  * Fake probability ∈ [0,1]
* Aggregation (video):

  * Mean probability across frames

#### **Phase 2 – CNN + LSTM**

* CNN: EfficientNet-B0 (frozen initially)
* LSTM:

  * Input: Feature vectors per frame
  * Output: Temporal fake probability
* Improves:

  * Temporal consistency detection
  * Flickering artifacts

---

### **4.4 Explainability Module**

* Technique: **Grad-CAM**
* Output:

  * Heatmap overlay on face
  * Highlight manipulated regions
* Available for:

  * Images
  * Selected video frames

---

### **4.5 Output Specification**

#### **UI Output**

* Label: `REAL` or `FAKE`
* Confidence: `XX%`
* Video:

  * Frame-wise fake probability chart
  * Key manipulated frames preview

#### **JSON Output**

```json
{
  "input_type": "video",
  "final_prediction": "FAKE",
  "confidence": 0.87,
  "frame_predictions": [
    {"frame": 1, "fake_prob": 0.82},
    {"frame": 2, "fake_prob": 0.90}
  ]
}
```

#### **PDF Report**

* Metadata
* Model version
* Final decision
* Confidence
* Frame-wise stats
* Heatmap images
* Dataset disclaimer

---

## **5. Non-Functional Requirements**

| Parameter          | Requirement            |
| ------------------ | ---------------------- |
| Runtime            | CPU-only               |
| Avg inference time | < 30 seconds per video |
| Memory usage       | < 4 GB RAM             |
| Model size         | < 100 MB               |
| Offline capability | Mandatory              |

---

## **6. Dataset Strategy**

### **Training**

* Dataset: **DFDC (Kaggle)**
* Sampling:

  * Balanced real/fake
  * Max 20 frames per video

### **Validation & Testing**

* Dataset: **Celeb-DF**
* No overlap with training data

---

## **7. Backend Architecture**

```
Flask App
 ├── Upload Handler
 ├── Face Detection Service
 ├── Frame Extractor
 ├── Inference Engine
 │    ├── CNN Model
 │    └── LSTM (Phase 2)
 ├── Explainability Engine
 ├── Report Generator
 └── API Response Layer
```

---

## **8. Tech Stack (Locked)**

* Language: **Python 3.10**
* ML: **PyTorch**
* CV: **OpenCV**
* Face Detection: **MTCNN**
* Explainability: **Grad-CAM**
* Backend: **Flask**
* UI: **HTML + CSS + JS**
* Reporting: **ReportLab / WeasyPrint**

---

## **9. Acceptance Criteria**

A submission is **accepted** if:

* Image and video uploads work
* Binary prediction is correct for test samples
* Confidence score is displayed
* Frame-wise probabilities exist for videos
* Heatmap visualization works
* PDF & JSON export works
* Runs fully on CPU without crashing

---

## **10. Risks & Mitigation**

| Risk                   | Mitigation               |
| ---------------------- | ------------------------ |
| CPU inference slow     | Frame sampling           |
| Overfitting            | Cross-dataset validation |
| Dataset bias           | Celeb-DF testing         |
| Face detection failure | Input rejection handling |

---

## **11. Future Scope (Not Implemented)**

* Transformer-based video models
* Audio-visual fusion
* Real-time webcam detection
* Browser-based inference (WebAssembly)
