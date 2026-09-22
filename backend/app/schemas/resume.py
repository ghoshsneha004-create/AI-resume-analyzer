from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class ResumeBase(BaseModel):
    filename: str
    target_role: Optional[str] = None

class ResumeCreate(ResumeBase):
    file_path: str
    file_size: int
    file_type: str
    raw_text: Optional[str] = None
    parsed_data: Optional[Dict[str, Any]] = None

class ResumeResponse(ResumeBase):
    id: str
    user_id: Optional[str] = None
    file_size: int
    file_type: str
    created_at: datetime
    raw_text: Optional[str] = None
    parsed_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
