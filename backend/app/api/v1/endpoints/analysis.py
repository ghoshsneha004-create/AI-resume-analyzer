from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.resume import Resume
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisResponse, AnalyzeRequest
from app.services.ats_scorer import ats_scorer
from app.services.ai_analyzer import ai_analyzer
from app.services.report_generator import report_generator

router = APIRouter()

@router.post("/{resume_id}/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    resume_id: str,
    payload: Optional[AnalyzeRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch Resume
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    target_role = (payload.target_role if payload and payload.target_role else resume.target_role) or "Software Engineer"
    parsed_data = resume.parsed_data or {}

    # 2. ATS & Heuristic Evaluation
    ats_results = ats_scorer.evaluate(parsed_data, target_role)

    # 3. AI Powered Rewrites & Section Comparison
    ai_results = await ai_analyzer.analyze_with_ai(parsed_data, target_role)

    # Merge AI suggestions with ATS results
    all_strengths = ats_results["strengths"] + [s for s in ai_results.get("ai_strengths", []) if s not in ats_results["strengths"]]
    all_weaknesses = ats_results["weaknesses"] + [w for w in ai_results.get("ai_weaknesses", []) if w not in ats_results["weaknesses"]]
    
    # Generate PDF executive report
    analysis_dict = {
        "overall_score": ats_results["overall_score"],
        "ats_score": ats_results["ats_score"],
        "section_scores": ats_results["section_scores"],
        "strengths": all_strengths,
        "weaknesses": all_weaknesses,
        "missing_sections": ats_results["missing_sections"],
        "missing_skills": ats_results["missing_skills"],
        "recommended_skills": ats_results["recommended_skills"],
        "rewritten_bullets": ai_results["rewritten_bullets"],
        "improved_summary": ai_results["improved_summary"],
        "ats_optimizations": ats_results["ats_optimizations"]
    }
    
    resume_meta = {
        "filename": resume.filename,
        "target_role": target_role,
        "word_count": parsed_data.get("word_count", 400)
    }

    try:
        pdf_path = report_generator.generate_pdf(resume_meta, analysis_dict)
    except Exception as e:
        pdf_path = None

    # 4. Persist Analysis Record
    analysis = Analysis(
        resume_id=resume.id,
        overall_score=ats_results["overall_score"],
        ats_score=ats_results["ats_score"],
        section_scores=ats_results["section_scores"],
        strengths=all_strengths,
        weaknesses=all_weaknesses,
        missing_sections=ats_results["missing_sections"],
        missing_skills=ats_results["missing_skills"],
        recommended_skills=ats_results["recommended_skills"],
        grammar_issues=ats_results["grammar_issues"],
        action_verb_suggestions=ats_results["action_verb_suggestions"] + ai_results.get("action_verb_suggestions", []),
        rewritten_bullets=ai_results["rewritten_bullets"],
        improved_summary=ai_results["improved_summary"],
        ats_optimizations=ats_results["ats_optimizations"],
        comparison_data=ai_results["comparison_data"],
        pdf_report_path=pdf_path
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    return analysis

@router.get("/{resume_id}", response_model=AnalysisResponse)
async def get_latest_analysis(
    resume_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Analysis).where(Analysis.resume_id == resume_id).order_by(Analysis.created_at.desc())
    )
    analysis = result.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found for this resume. Please analyze it first.")
    return analysis

@router.get("/id/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_by_id(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalars().first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis
