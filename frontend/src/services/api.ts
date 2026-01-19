/**
 * API Service for Deepfake Detection System.
 * Connects the React frontend to the Flask backend.
 */

export interface FramePrediction {
    id: number;
    prob: number;
}

export interface AnalysisResult {
    input_type: "image" | "video";
    final_prediction: "FAKE" | "REAL";
    confidence: number;
    frame_predictions: FramePrediction[];
    heatmaps: string[];
}

export interface UploadResponse {
    message: string;
    filename: string;
    path: string;
}

export const apiService = {
    /**
     * Uploads a file to the backend.
     */
    async uploadFile(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", file.type.startsWith("video") ? "video" : "image");

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Upload failed");
        }

        return response.json();
    },

    /**
     * Triggers prediction on an uploaded file.
     */
    async runPredict(filename: string, fileType: string): Promise<AnalysisResult> {
        const response = await fetch("/api/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                filename: filename,
                type: fileType,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Prediction failed");
        }

        const data: AnalysisResult = await response.json();
        return data;
    },

    /**
     * Checks if the backend is online.
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch("/api/health", {
                method: "GET",
                // Set a short timeout for health check
                signal: AbortSignal.timeout(3000)
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    },
};
