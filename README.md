# CareerCraft AI — Production AI Resume Analyzer & ATS Optimizer

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini_1.5_Flash-8E75B2.svg?style=flat&logo=google)](https://ai.google.dev)
[![ReportLab](https://img.shields.io/badge/PDF_Engine-ReportLab-red.svg?style=flat)](https://www.reportlab.com)

CareerCraft AI is an end-to-end, production-ready AI Resume Analyzer and ATS Optimization web application. It empowers job candidates to upload resumes in **PDF** and **DOCX** formats, receive deterministic structural scoring across 8 core resume pillars, detect grammar and passive voice weaknesses, optimize action verbs, transform weak bullet points into **Google XYZ formula** statements, and download executive PDF audit reports.

---

## Key Features

1. **Multi-Format Resume Upload & Parsing**:
   - Seamless drag-and-drop file upload with format (`.pdf`, `.docx`) and size validation (up to 10MB).
   - High-fidelity text, contact link (`email`, `phone`, `linkedin`, `github`), section, and bullet extraction powered by `pypdf` and `python-docx`.

2. **8-Pillar Structural Audit**:
   - Comprehensive quantitative evaluation across:
     - Contact Information (15%)
     - Professional Summary (10%)
     - Work Experience (25%)
     - Education (10%)
     - Skills & Competencies (15%)
     - Featured Projects (10%)
     - Certifications (8%)
     - Key Achievements & Honors (7%)
   - Normalized overall score (0–100) and ATS Match Index (0–100).

3. **Google XYZ Formula Bullet Optimizer**:
   - Detects weak, passive statements (e.g., *"Worked on web application development"*).
   - Automatically reconstructs them into high-impact accomplishment statements:
     $$\text{Accomplished } [X] \text{ as measured by } [Y], \text{ by doing } [Z]$$
   - Highlights quantifiable metrics and rationales with one-click clipboard copying.

4. **Side-by-Side Resume Transformation View**:
   - Split-screen comparison displaying original raw resume text alongside AI-enhanced counterparts.
   - Highlights key taxonomy improvements and allows one-click copying of individual improved sections.

5. **ATS Keyword Gap & Weak Verb Detector**:
   - Identifies high-demand keywords missing from the resume based on the candidate's target job role.
   - Replaces passive verbs (*handled*, *assisted*, *responsible for*) with authoritative action verbs (*architected*, *orchestrated*, *spearheaded*).

6. **Executive PDF Audit Report Generation**:
   - Server-side generation of multi-page, branded PDF reports using ReportLab.
   - Includes score meters, section status breakdown, key strengths, critical weaknesses, AI-rewritten bullets, and ATS checklists.

7. **Authentication & History**:
   - Secure JWT bearer authentication with bcrypt password hashing.
   - Resume analysis history allowing users to track progress and re-download reports anytime.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.10+ / 3.14, FastAPI, Uvicorn, Pydantic v2 |
| **AI Engine** | Google Gemini API (`gemini-1.5-flash`) + Intelligent NLP Fallback Engine |
| **Database** | PostgreSQL / SQLite (via SQLAlchemy 2.0 Async + `aiosqlite`) |
| **PDF & Parsing** | ReportLab 5.0, PyPDF 6.0, Python-Docx 1.2 |
| **Authentication** | OAuth2 Password Bearer + JWT (`python-jose`) + Passlib (`bcrypt`) |

---

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                     # Auth and DB dependencies
│   │   │   └── v1/
│   │   │       ├── api.py                  # Aggregated router
│   │   │       └── endpoints/
│   │   │           ├── auth.py             # Register, Login, Me
│   │   │           ├── resumes.py          # Upload, List, Get
│   │   │           ├── analysis.py         # Analyze, Latest, Get by ID
│   │   │           └── reports.py          # PDF Download & Preview
│   │   ├── core/
│   │   │   ├── config.py                   # Pydantic Settings
│   │   │   ├── database.py                 # Async SQLAlchemy engine & session
│   │   │   └── security.py                 # JWT token creation & bcrypt hashing
│   │   ├── models/
│   │   │   ├── user.py                     # User SQLAlchemy model
│   │   │   ├── resume.py                   # Resume SQLAlchemy model
│   │   │   └── analysis.py                 # Analysis SQLAlchemy model
│   │   ├── schemas/
│   │   │   ├── user.py                     # User Pydantic schemas
│   │   │   ├── resume.py                   # Resume Pydantic schemas
│   │   │   └── analysis.py                 # Analysis Pydantic schemas
│   │   ├── services/
│   │   │   ├── parser.py                   # PDF & DOCX parser
│   │   │   ├── ai_analyzer.py              # Gemini AI & NLP fallback engine
│   │   │   ├── ats_scorer.py               # ATS scoring & keyword analyzer
│   │   │   ├── report_generator.py         # ReportLab PDF generator
│   │   │   └── storage.py                  # File upload validator & storage
│   │   └── main.py                         # FastAPI application entry point
│   ├── requirements.txt                    # Backend dependencies
│   ├── run.py                              # Backend dev runner
│   └── .env                                # Backend configuration
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                  # Root layout with dark theme
│   │   │   ├── page.tsx                    # Landing page with live upload & demo
│   │   │   ├── dashboard/page.tsx          # Full analysis dashboard
│   │   │   ├── compare/[id]/page.tsx       # Dedicated side-by-side comparison
│   │   │   ├── history/page.tsx            # Saved resume audit history
│   │   │   ├── login/page.tsx              # Sign In page
│   │   │   └── register/page.tsx           # Sign Up page
│   │   ├── components/
│   │   │   ├── Navbar.tsx                  # Navigation header
│   │   │   ├── FileUpload.tsx              # Drag-and-drop upload zone
│   │   │   ├── ScoreGauge.tsx              # SVG radial score gauge
│   │   │   ├── BreakdownCard.tsx           # Pillar score progress card
│   │   │   ├── BulletOptimizer.tsx         # Google XYZ bullet transformation card
│   │   │   ├── ComparisonView.tsx          # Side-by-side section split screen
│   │   │   └── KeywordPills.tsx            # Missing and recommended skills pills
│   │   ├── lib/
│   │   │   ├── api.ts                      # Frontend API client
│   │   │   └── auth.ts                     # Local storage auth helpers
│   │   └── types/
│   │       └── resume.ts                   # TypeScript interfaces
│   ├── tailwind.config.js                  # Tailwind configuration
│   ├── tsconfig.json                       # TypeScript configuration
│   └── package.json                        # Frontend dependencies
├── sample_resumes/
│   ├── sample_software_engineer.docx       # Sample DOCX resume for testing
│   └── sample_product_manager.pdf          # Sample PDF resume for testing
├── generate_samples.py                     # Script to generate sample resumes
├── test_backend.py                         # Automated backend test suite
├── start_dev.bat                           # Single-click launcher for Windows
└── README.md                               # Complete documentation
```

---

## Getting Started Locally

### Prerequisites
- **Python 3.10+** (Python 3.14 supported)
- **Node.js 18+** & **npm**

---

### Step 1: Backend Setup

1. Open a terminal in the project root:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `backend/.env`:
   ```env
   PROJECT_NAME="AI Resume Analyzer"
   SECRET_KEY="YOUR_SUPER_SECRET_PRODUCTION_KEY"
   DATABASE_URL="sqlite+aiosqlite:///./resume_analyzer.db"
   
   # Optional: Add your Google Gemini API key from https://aistudio.google.com/
   GEMINI_API_KEY=""
   GEMINI_MODEL="gemini-1.5-flash"
   ```
   > **Note**: If `GEMINI_API_KEY` is not provided, CareerCraft AI's built-in NLP fallback engine runs automatically to generate XYZ bullets, ATS scoring, and recommendations without failure!

5. Run the backend server:
   ```bash
   python run.py
   ```
   The FastAPI server will start at `http://127.0.0.1:8000`.
   Interactive Swagger docs are accessible at `http://127.0.0.1:8000/docs`.

---

### Step 2: Frontend Setup

1. Open a new terminal in the project root:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

---

### Step 3: One-Click Launcher (Windows)

Double-click `start_dev.bat` in the project root to automatically start both the FastAPI backend and Next.js frontend in separate console windows!

---

## API Endpoints Reference

### Authentication
- `POST /api/v1/auth/register` — Create a new user account.
- `POST /api/v1/auth/login` — Authenticate and receive a JWT access token.
- `GET /api/v1/auth/me` — Retrieve the currently authenticated user profile.

### Resumes
- `POST /api/v1/resumes/upload` — Upload a PDF/DOCX file and extract structured sections and bullets.
- `GET /api/v1/resumes/` — List all uploaded resumes (authenticated or demo).
- `GET /api/v1/resumes/{id}` — Retrieve resume details and parsed text.

### Analysis & Recommendations
- `POST /api/v1/analysis/{resume_id}/analyze` — Run ATS scoring, Gemini AI bullet rewrites, and comparison diffing.
- `GET /api/v1/analysis/{resume_id}` — Get the latest analysis report for a resume.
- `GET /api/v1/analysis/id/{analysis_id}` — Fetch specific analysis report by ID.

### Executive Reports
- `GET /api/v1/reports/{analysis_id}/download` — Download the branded executive audit PDF.
- `GET /api/v1/reports/{analysis_id}/preview` — Stream PDF directly for in-browser review.

---

## Testing & Verification

Run the automated backend test suite covering database operations, PDF/DOCX extraction, ATS scoring, Gemini AI integration, and ReportLab PDF generation:

```bash
python test_backend.py
```

Expected result:
```
==========================================
ALL 7 BACKEND TEST PHASES PASSED 100%!
==========================================
```
