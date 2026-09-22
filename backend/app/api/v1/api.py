from fastapi import APIRouter
from app.api.v1.endpoints import auth, resumes, analysis, reports

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
