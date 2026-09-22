import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.services.report_generator import report_generator

router = APIRouter()

@router.get("/{analysis_id}/download")
async def download_report(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis report not found")

    file_path = analysis.pdf_report_path
    
    # If the file was deleted or not yet generated, recreate it on the fly
    if not file_path or not os.path.exists(file_path):
        resume_res = await db.execute(select(Resume).where(Resume.id == analysis.resume_id))
        resume = resume_res.scalars().first()
        resume_meta = {
            "filename": resume.filename if resume else "Resume",
            "target_role": resume.target_role if resume else "Candidate",
            "word_count": resume.parsed_data.get("word_count", 400) if resume and resume.parsed_data else 400
        }
        analysis_dict = {
            "overall_score": analysis.overall_score,
            "ats_score": analysis.ats_score,
            "section_scores": analysis.section_scores,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
            "missing_sections": analysis.missing_sections,
            "missing_skills": analysis.missing_skills,
            "recommended_skills": analysis.recommended_skills,
            "rewritten_bullets": analysis.rewritten_bullets,
            "improved_summary": analysis.improved_summary,
            "ats_optimizations": analysis.ats_optimizations
        }
        file_path = report_generator.generate_pdf(resume_meta, analysis_dict)
        analysis.pdf_report_path = file_path
        await db.commit()

    return FileResponse(
        path=file_path,
        filename=f"Resume_Audit_Report_{analysis_id[:8]}.pdf",
        media_type="application/pdf"
    )

@router.get("/{analysis_id}/preview")
async def preview_report(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalars().first()
    if not analysis or not analysis.pdf_report_path or not os.path.exists(analysis.pdf_report_path):
        raise HTTPException(status_code=404, detail="Report PDF not available for preview")

    return FileResponse(
        path=analysis.pdf_report_path,
        media_type="application/pdf"
    )
