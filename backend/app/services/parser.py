import os
import re
from typing import Dict, Any, List, Optional
from pypdf import PdfReader
from docx import Document

class ResumeParser:
    SECTION_PATTERNS = {
        "contact": [r"contact", r"personal\s+info", r"contact\s+details"],
        "summary": [r"professional\s+summary", r"summary", r"executive\s+summary", r"profile", r"about\s+me", r"objective"],
        "experience": [r"work\s+experience", r"professional\s+experience", r"experience", r"employment\s+history", r"work\s+history"],
        "education": [r"education", r"academic\s+background", r"academic\s+qualifications", r"qualifications"],
        "skills": [r"skills", r"technical\s+skills", r"core\s+competencies", r"key\s+skills", r"technologies", r"tools\s+&\s+technologies"],
        "projects": [r"projects", r"personal\s+projects", r"key\s+projects", r"portfolio\s+projects", r"academic\s+projects"],
        "certifications": [r"certifications", r"licenses\s+&\s+certifications", r"certificates", r"professional\s+certifications"],
        "achievements": [r"achievements", r"honors\s+&\s+awards", r"awards", r"accomplishments", r"key\s+achievements"]
    }

    EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
    PHONE_PATTERN = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
    LINKEDIN_PATTERN = r'(linkedin\.com\/in\/[a-zA-Z0-9_-]+)'
    GITHUB_PATTERN = r'(github\.com\/[a-zA-Z0-9_-]+)'

    def extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            raise RuntimeError(f"Failed to extract text from PDF: {str(e)}")
        return text.strip()

    def extract_text_from_docx(self, file_path: str) -> str:
        text = ""
        try:
            doc = Document(file_path)
            for para in doc.paragraphs:
                if para.text:
                    text += para.text + "\n"
            for table in doc.tables:
                for row in table.rows:
                    row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_text:
                        text += " | ".join(row_text) + "\n"
        except Exception as e:
            raise RuntimeError(f"Failed to extract text from DOCX: {str(e)}")
        return text.strip()

    def extract_text(self, file_path: str, file_type: str) -> str:
        ext = file_type.lower()
        if ext == ".pdf":
            return self.extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return self.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file extension: {ext}")

    def parse_contact_info(self, text: str) -> Dict[str, Any]:
        emails = re.findall(self.EMAIL_PATTERN, text)
        phones = re.findall(self.PHONE_PATTERN, text)
        linkedin = re.findall(self.LINKEDIN_PATTERN, text, re.IGNORECASE)
        github = re.findall(self.GITHUB_PATTERN, text, re.IGNORECASE)

        # Basic location heuristics (City, State / Country)
        location_match = re.search(r'\b([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\b|\b[A-Z][a-zA-Z\s]+,\s*[A-Za-z]+)\b', text[:1000])

        return {
            "email": emails[0] if emails else None,
            "phone": phones[0] if phones else None,
            "linkedin": f"https://{linkedin[0]}" if linkedin else None,
            "github": f"https://{github[0]}" if github else None,
            "location": location_match.group(0).strip() if location_match else None
        }

    def split_into_sections(self, text: str) -> Dict[str, str]:
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        sections: Dict[str, List[str]] = {}
        current_section = "header"
        sections[current_section] = []

        for line in lines:
            normalized_line = line.lower()
            detected = None
            # Check if this line is likely a section heading
            if len(line) < 40 and not line.endswith("."):
                for sec_key, patterns in self.SECTION_PATTERNS.items():
                    for pat in patterns:
                        if re.fullmatch(pat, normalized_line.strip(":")):
                            detected = sec_key
                            break
                    if detected:
                        break

            if detected:
                current_section = detected
                if current_section not in sections:
                    sections[current_section] = []
            else:
                sections[current_section].append(line)

        return {k: "\n".join(v).strip() for k, v in sections.items() if "\n".join(v).strip()}

    def extract_bullets(self, text: str) -> List[str]:
        lines = text.split("\n")
        bullets = []
        for line in lines:
            clean = line.strip()
            # Recognize common bullet characters: •, -, *, –, ⁃, or numbered items
            if re.match(r'^[\u2022\u2023\u25E6\u2043\u2219\-\*]\s+', clean) or re.match(r'^\d+[\.\)]\s+', clean):
                stripped_bullet = re.sub(r'^[\u2022\u2023\u25E6\u2043\u2219\-\*]\s+', '', clean)
                stripped_bullet = re.sub(r'^\d+[\.\)]\s+', '', stripped_bullet).strip()
                if len(stripped_bullet) > 15:
                    bullets.append(stripped_bullet)
            elif len(clean) > 30 and (clean.endswith(".") or ";" in clean) and not clean.endswith(":"):
                # Potential bullet point without standard marker
                bullets.append(clean)
        return bullets

    def parse(self, file_path: str, file_type: str) -> Dict[str, Any]:
        raw_text = self.extract_text(file_path, file_type)
        contact_info = self.parse_contact_info(raw_text)
        sections = self.split_into_sections(raw_text)
        
        # Extract experience and project bullets
        exp_text = sections.get("experience", "")
        proj_text = sections.get("projects", "")
        bullets = self.extract_bullets(exp_text) + self.extract_bullets(proj_text)

        return {
            "raw_text": raw_text,
            "word_count": len(raw_text.split()),
            "contact_info": contact_info,
            "sections": sections,
            "extracted_bullets": bullets
        }

resume_parser = ResumeParser()
