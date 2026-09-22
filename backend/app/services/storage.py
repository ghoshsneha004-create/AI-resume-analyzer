import os
import shutil
import uuid
from typing import Tuple
from fastapi import UploadFile, HTTPException
from app.core.config import settings

class StorageService:
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def validate_file(self, file: UploadFile) -> Tuple[str, str]:
        filename = file.filename or "unknown"
        ext = os.path.splitext(filename)[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format '{ext}'. Only PDF (.pdf) and Word documents (.docx) are supported."
            )
        return filename, ext

    async def save_file(self, file: UploadFile) -> Tuple[str, str, int]:
        filename, ext = self.validate_file(file)
        unique_name = f"{uuid.uuid4()}{ext}"
        destination = os.path.join(self.upload_dir, unique_name)
        
        size = 0
        with open(destination, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                size += len(chunk)
                if size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                    # Clean up
                    buffer.close()
                    if os.path.exists(destination):
                        os.remove(destination)
                    raise HTTPException(
                        status_code=400, 
                        detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
                    )
                buffer.write(chunk)
        
        return filename, destination, size

storage_service = StorageService()
