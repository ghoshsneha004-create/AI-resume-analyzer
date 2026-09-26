import sys
from pathlib import Path

# Ensure backend directory is in sys.path so 'app.*' imports resolve when executed from root (Vercel)
_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables
    await init_db()
    yield
    # Shutdown: Clean up resources if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade AI Resume Analyzer API powered by FastAPI, Gemini AI, and ATS Scoring Engine.",
    lifespan=lifespan
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
