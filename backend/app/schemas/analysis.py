from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class BulletRewrite(BaseModel):
    original: str
    improved: str
    rationale: str
    impact_metric: Optional[str] = None

class ActionVerbSuggestion(BaseModel):
    original_phrase: str
    suggested_verb: str
    example: str

class GrammarIssue(BaseModel):
    issue: str
    context: str
    suggestion: str
    severity: str = "medium"  # low, medium, high

class SectionScore(BaseModel):
    name: str
    score: int
    max_score: int = 100
    status: str  # excellent, good, needs_improvement, missing
    feedback: str

class ComparisonSection(BaseModel):
    section_name: str
    original: str
    improved: str
    highlights: List[str] = []

class AnalysisResponse(BaseModel):
    id: str
    resume_id: str
    overall_score: int
    ats_score: int
    section_scores: Dict[str, SectionScore]
    strengths: List[str]
    weaknesses: List[str]
    missing_sections: List[str]
    missing_skills: List[str]
    recommended_skills: Dict[str, List[str]]
    grammar_issues: List[GrammarIssue]
    action_verb_suggestions: List[ActionVerbSuggestion]
    rewritten_bullets: List[BulletRewrite]
    improved_summary: Optional[str] = None
    ats_optimizations: List[str]
    comparison_data: List[ComparisonSection]
    pdf_report_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AnalyzeRequest(BaseModel):
    target_role: Optional[str] = None
    target_job_description: Optional[str] = None
