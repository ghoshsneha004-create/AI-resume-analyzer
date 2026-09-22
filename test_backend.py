import asyncio
import os
import sys

# Ensure backend root is on sys.path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.core.database import init_db, AsyncSessionLocal
from app.services.parser import resume_parser
from app.services.ats_scorer import ats_scorer
from app.services.ai_analyzer import ai_analyzer
from app.services.report_generator import report_generator
from app.core.security import get_password_hash, verify_password, create_access_token

async def main():
    print("--- 1. Testing Database Initialization ---")
    await init_db()
    print("Database tables initialized successfully!")

    print("\n--- 2. Testing DOCX Resume Parsing ---")
    docx_file = "sample_resumes/sample_software_engineer.docx"
    parsed_docx = resume_parser.parse(docx_file, ".docx")
    print(f"Extracted {parsed_docx['word_count']} words from DOCX.")
    print("Contact Info:", parsed_docx["contact_info"])
    print("Detected Sections:", list(parsed_docx["sections"].keys()))
    print(f"Extracted {len(parsed_docx['extracted_bullets'])} bullet points.")
    assert "skills" in parsed_docx["sections"], "Skills section should be detected"
    assert "experience" in parsed_docx["sections"], "Experience section should be detected"

    print("\n--- 3. Testing PDF Resume Parsing ---")
    pdf_file = "sample_resumes/sample_product_manager.pdf"
    parsed_pdf = resume_parser.parse(pdf_file, ".pdf")
    print(f"Extracted {parsed_pdf['word_count']} words from PDF.")
    print("Contact Info:", parsed_pdf["contact_info"])
    print("Detected Sections:", list(parsed_pdf["sections"].keys()))
    assert parsed_pdf["word_count"] > 50, "PDF word count should be greater than 50"

    print("\n--- 4. Testing ATS Scoring Engine ---")
    ats_res = ats_scorer.evaluate(parsed_docx, "Senior Software Engineer")
    print(f"Overall Score: {ats_res['overall_score']}/100")
    print(f"ATS Score: {ats_res['ats_score']}/100")
    print(f"Missing Skills: {ats_res['missing_skills']}")
    print(f"Weak verbs / suggestions: {len(ats_res['action_verb_suggestions'])}")
    assert ats_res["overall_score"] >= 40, "Score should be >= 40"
    assert "contact" in ats_res["section_scores"], "Section scores must include contact"

    print("\n--- 5. Testing AI Analyzer (Rewrites & Comparison) ---")
    ai_res = await ai_analyzer.analyze_with_ai(parsed_docx, "Senior Software Engineer")
    print(f"AI Rewrote {len(ai_res['rewritten_bullets'])} bullets.")
    print("Sample XYZ Bullet:", ai_res["rewritten_bullets"][0]["improved"])
    print("Sample Metric:", ai_res["rewritten_bullets"][0].get("impact_metric"))
    print("AI Summary:", ai_res["improved_summary"][:120] + "...")
    assert len(ai_res["rewritten_bullets"]) > 0, "Should produce rewritten bullets"
    assert len(ai_res["comparison_data"]) > 0, "Should produce side-by-side comparison data"

    print("\n--- 6. Testing ReportLab PDF Report Generation ---")
    resume_meta = {
        "filename": "sample_software_engineer.docx",
        "target_role": "Senior Software Engineer",
        "word_count": parsed_docx["word_count"]
    }
    analysis_dict = {
        "overall_score": ats_res["overall_score"],
        "ats_score": ats_res["ats_score"],
        "section_scores": ats_res["section_scores"],
        "strengths": ats_res["strengths"],
        "weaknesses": ats_res["weaknesses"],
        "missing_sections": ats_res["missing_sections"],
        "missing_skills": ats_res["missing_skills"],
        "recommended_skills": ats_res["recommended_skills"],
        "rewritten_bullets": ai_res["rewritten_bullets"],
        "improved_summary": ai_res["improved_summary"],
        "ats_optimizations": ats_res["ats_optimizations"]
    }
    pdf_report_path = report_generator.generate_pdf(resume_meta, analysis_dict)
    print(f"Executive PDF generated at: {pdf_report_path}")
    assert os.path.exists(pdf_report_path), "PDF report file must exist on disk"
    assert os.path.getsize(pdf_report_path) > 1000, "PDF size must be > 1KB"

    print("\n--- 7. Testing Security & Password Hashing ---")
    raw_pw = "SuperSecretPassword123!"
    hashed = get_password_hash(raw_pw)
    assert verify_password(raw_pw, hashed), "Password verification should succeed"
    assert not verify_password("WrongPassword", hashed), "Wrong password must fail"
    token = create_access_token(subject="user_test_123")
    assert token and len(token) > 20, "Access token must be generated"
    print("Password hashing and JWT generation passed successfully!")

    print("\n==========================================")
    print("ALL 7 BACKEND TEST PHASES PASSED 100%!")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(main())
