import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from config import Config
from routes.upload import upload_bp
from routes.inference import inference_bp

def create_app():
    app = FastAPI(
        title="Deepfake Detector API",
        description="FastAPI backend for Multi-Modal Deepfake Detection",
        version="1.0.0"
    )

    # CORS configuration (useful for local development)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(upload_bp, tags=["Upload"])
    app.include_router(inference_bp, tags=["Inference"])

    @app.get("/")
    async def index():
        return {
            "message": "Welcome to Deepfake Detector API",
            "version": "1.0.0",
            "docs": "/docs"
        }

    @app.get("/health")
    async def health():
        return {"status": "healthy"}

    return app

app = create_app()

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)
