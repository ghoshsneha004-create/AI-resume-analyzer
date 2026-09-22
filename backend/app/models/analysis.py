import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False)
    
    # Quantitative Scores
    overall_score = Column(Integer, nullable=False, default=0)
    ats_score = Column(Integer, nullable=False, default=0)
    
    # Detailed Pillar Scores (Contact, Summary, Education, Skills, Projects, Experience, Certifications, Achievements)
    section_scores = Column(JSON, nullable=True)
    
    # Qualitative Feedback
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    missing_sections = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    recommended_skills = Column(JSON, nullable=True)
    grammar_issues = Column(JSON, nullable=True)
    action_verb_suggestions = Column(JSON, nullable=True)
    
    # Enhancements & Rewrites
    rewritten_bullets = Column(JSON, nullable=True)
    improved_summary = Column(Text, nullable=True)
    ats_optimizations = Column(JSON, nullable=True)
    
    # Side-by-Side Comparison Mapping
    comparison_data = Column(JSON, nullable=True)
    
    # Generated PDF Report
    pdf_report_path = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")
