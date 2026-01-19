import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException
from utils.validators import validate_upload

upload_bp = APIRouter()

# Global in-memory store for files
in_memory_store = {}

@upload_bp.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    is_valid, error = validate_upload(file.filename)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)
        
    try:
        file_content = await file.read()
        file_id = str(uuid.uuid4())
        
        in_memory_store[file_id] = {
            "filename": file.filename,
            "content": file_content,
            "type": file.content_type
        }
        
        # Simple memory management: Clear if too many files
        if len(in_memory_store) > 50:
            in_memory_store.clear()
            
        return {
            "message": "File uploaded successfully to memory",
            "filename": file_id, # Return the memory ID as the filename
            "original_name": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
