# **Technical Requirements Document (TRD)**

## **Project:** Multi-Modal Deepfake Detection System (Image & Video)

---

## **1. System Environment Requirements**

### **1.1 Hardware**

* CPU: x86_64 (Intel / AMD)
* GPU: **Not required / Not used**
* RAM: **Minimum 8 GB**
* Storage:

  * Dataset (trimmed): ~50–70 GB
  * Models + outputs: ~2 GB

---

### **1.2 Software**

* OS: Windows 10 / Ubuntu 20.04+
* Python: **3.10.x (strict)**
* Virtual environment: `venv` or `conda`

---

## **2. Backend Architecture (Flask)**

### **2.1 Flask App Structure (Locked)**

```
backend/
├── app.py                     # Flask entry
├── config.py                  # Paths, thresholds
├── routes/
│   ├── upload.py              # File upload endpoint
│   ├── inference.py           # Prediction endpoint
│   └── report.py              # PDF / JSON generation
├── services/
│   ├── face_detector.py
│   ├── frame_extractor.py
│   ├── inference_engine.py
│   ├── explainability.py
│   └── report_generator.py
├── models/
│   ├── cnn_baseline.pt
│   └── cnn_lstm.pt
├── utils/
│   ├── preprocess.py
│   ├── postprocess.py
│   └── validators.py
└── static/
```

---

## **3. API Specifications**

### **3.1 Upload API**

**Endpoint:** `/upload`
**Method:** `POST`
**Payload:** `multipart/form-data`

| Field | Type        | Constraint    |
| ----- | ----------- | ------------- |
| file  | image/video | ≤100 MB       |
| type  | string      | image | video |

**Failure Conditions**

* Unsupported format
* No face detected
* File size exceeded

---

### **3.2 Inference API**

**Endpoint:** `/predict`
**Method:** `POST`

**Returns**

```json
{
  "label": "FAKE",
  "confidence": 0.87,
  "frames": [
    {"id": 1, "prob": 0.82},
    {"id": 2, "prob": 0.91}
  ]
}
```

---

### **3.3 Report API**

**Endpoint:** `/generate-report`
**Formats:** `PDF`, `JSON`

---

## **4. Data Pipeline (Exact)**

### **4.1 Video Processing**

* Decoder: OpenCV `VideoCapture`
* Frame sampling: **1 frame/sec (configurable)**
* Max frames per video: **20**
* Storage: RAM only (no disk save)

---

### **4.2 Face Detection**

* Library: **MTCNN**
* Confidence threshold: `0.90`
* Output:

  * Cropped face
  * Bounding box coordinates

**Reject if:** zero faces detected across frames

---

### **4.3 Preprocessing**

* Resize: `224 × 224`
* Normalize: ImageNet mean/std
* Color space: RGB
* Batch size: **1 (CPU constraint)**

---

## **5. Model Architecture Details**

### **5.1 CNN Baseline (Phase 1)**

* Backbone: **EfficientNet-B0**
* Weights: ImageNet pretrained
* Head:

  * GlobalAvgPool
  * Dense(128) + ReLU
  * Dense(1) + Sigmoid
* Output: Fake probability

---

### **5.2 CNN + LSTM (Phase 2)**

* CNN: EfficientNet-B0 (feature extractor)
* Feature size: `1280`
* LSTM:

  * Hidden size: `256`
  * Layers: `1`
  * Bidirectional: `False`
* Output:

  * Video-level fake probability

---

## **6. Training Specifications**

### **6.1 Dataset Handling**

* Train: **DFDC**
* Validate/Test: **Celeb-DF**
* Label encoding:

  * REAL → `0`
  * FAKE → `1`

---

### **6.2 Training Parameters**

| Parameter      | Value                 |
| -------------- | --------------------- |
| Optimizer      | Adam                  |
| LR             | 1e-4                  |
| Loss           | Binary Cross Entropy  |
| Epochs         | 10–15                 |
| Augmentation   | Horizontal flip, blur |
| Early stopping | Enabled               |

---

## **7. Inference Logic**

### **Image**

```
Face → CNN → Fake probability → Label
```

### **Video**

```
Frames → CNN → Probabilities → Mean aggregation
(optional)
→ LSTM → Final probability
```

---

## **8. Explainability (Grad-CAM)**

* Layer target: Last CNN conv block
* Output:

  * Heatmap (224×224)
  * Overlay on original face
* Stored per key frame only (top-k fake frames)

---

## **9. Report Generation**

### **PDF Sections (Fixed Order)**

1. Input metadata
2. Model version
3. Final decision
4. Confidence score
5. Frame-wise table
6. Heatmap images
7. Dataset disclaimer

### **JSON**

* Raw inference output
* No formatting

---

## **10. Performance Constraints**

| Metric          | Requirement |
| --------------- | ----------- |
| Image inference | < 2 sec     |
| Video inference | < 30 sec    |
| CPU usage       | ≤ 90%       |
| RAM usage       | ≤ 4 GB      |

---

## **11. Logging & Errors**

* Log level: INFO
* Log events:

  * Upload
  * Face detection failure
  * Inference start/end
  * Report generation

---

## **12. Security & Safety**

* File type validation
* Max upload size enforcement
* No file persistence post-session

---

## **13. Build & Deployment**

* Single command startup:

```bash
python app.py
```

* Access: `http://localhost:5000`

---

## **14. Validation Checklist (Final Evaluation)**

* ✔ Image detection works
* ✔ Video detection works
* ✔ Heatmap visible
* ✔ PDF & JSON downloadable
* ✔ Runs fully offline on CPU

---