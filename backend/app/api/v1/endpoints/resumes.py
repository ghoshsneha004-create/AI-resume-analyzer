from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse
from app.api.deps import get_current_user
from app.services.storage import storage_service
from app.services.parser import resume_parser

router = APIRouter()

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # 1. Validate & store file
    filename, file_path, file_size = await storage_service.save_file(file)
    _, ext = storage_service.validate_file(file)

    # 2. Extract structured content
    try:
        parsed_data = resume_parser.parse(file_path, ext)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse resume file: {str(e)}"
        )

    # 3. Create database entry
    resume = Resume(
        user_id=current_user.id if current_user else None,
        filename=filename,
        file_path=file_path,
        file_size=file_size,
        file_type=ext,
        target_role=target_role or "Software Engineer",
        raw_text=parsed_data.get("raw_text", ""),
        parsed_data=parsed_data
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)

    return resume

@router.get("/", response_model=List[ResumeResponse])
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    query = select(Resume).order_by(Resume.created_at.desc())
    if current_user:
        query = query.where(Resume.user_id == current_user.id)
    else:
        # Show recent public/demo uploads if not authenticated
        query = query.limit(10)
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume
