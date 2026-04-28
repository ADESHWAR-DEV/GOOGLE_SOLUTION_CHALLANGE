"""
AthletiChain AI Engine
Standalone FastAPI service for fraud detection.
Also importable by the main backend as a module.
"""

import uvicorn
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from detection.detector import AIDetectionService

app = FastAPI(title="AthletiChain AI Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

detector = AIDetectionService()

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-engine"}

@app.post("/detect")
async def detect(file: UploadFile = File(...), media_type: str = Form("image")):
    """Run fraud detection on an uploaded file."""
    file_bytes = await file.read()
    result = detector.detect_fraud(file_bytes, media_type)
    return result

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=5001, reload=True)
