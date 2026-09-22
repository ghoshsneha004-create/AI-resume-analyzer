import re
from typing import Dict, Any, List, Tuple

# Industry keyword dictionaries based on roles
ROLE_KEYWORDS = {
    "software": [
        "python", "javascript", "typescript", "react", "node.js", "docker", "kubernetes",
        "aws", "ci/cd", "sql", "git", "rest api", "microservices", "unit testing",
        "agile", "system design", "data structures", "algorithms", "graphql", "linux"
    ],
    "data": [
        "python", "sql", "pandas", "numpy", "machine learning", "deep learning", "tableau",
        "power bi", "etl", "spark", "hadoop", "tensorflow", "pytorch", "scikit-learn",
        "statistics", "data modeling", "bigquery", "data visualization", "a/b testing"
    ],
    "product": [
        "product strategy", "roadmap", "user stories", "agile", "scrum", "okrs", "kpis",
        "market research", "a/b testing", "wireframing", "stakeholder management",
        "customer discovery", "user experience", "product lifecycle", "analytics", "sql"
    ],
    "general": [
        "leadership", "project management", "cross-functional collaboration", "strategic planning",
        "communication", "problem solving", "budgeting", "process improvement", "stakeholder alignment"
    ]
}

WEAK_VERBS_MAP = {
    "worked on": ["engineered", "developed", "architected", "spearheaded"],
    "responsible for": ["oversaw", "directed", "managed", "orchestrated"],
    "helped with": ["collaborated to deliver", "facilitated", "championed", "supported execution of"],
    "handled": ["resolved", "administered", "executed", "navigated"],
    "assisted": ["partnered with", "contributed to", "accelerated", "co-led"],
    "did": ["executed", "completed", "implemented", "delivered"],
    "made": ["designed", "established", "formulated", "constructed"],
    "looked after": ["supervised", "maintained", "guaranteed", "safeguarded"],
    "used": ["leveraged", "utilized", "implemented", "deployed"]
}

STRONG_ACTION_VERBS = [
    "accelerated", "accomplished", "achieved", "acquired", "administered", "advised", "analyzed",
    "architected", "automated", "built", "centralized", "championed", "coached", "collaborated",
    "consolidated", "constructed", "created", "decreased", "delivered", "deployed", "designed",
    "developed", "devised", "directed", "doubled", "drove", "engineered", "enhanced", "established",
    "exceeded", "executed", "expanded", "expedited", "formulated", "generated", "guided",
    "identified", "implemented", "improved", "increased", "initiated", "innovated", "installed",
    "instituted", "integrated", "launched", "lead", "led", "leveraged", "managed", "maximized",
    "mentored", "minimized", "modernized", "monitored", "negotiated", "optimized", "orchestrated",
    "outperformed", "overhauled", "oversaw", "pioneered", "planned", "produced", "programmed",
    "reduced", "refactored", "remodeled", "reorganized", "restructured", "revamped", "saved",
    "scaled", "simplified", "slashed", "spearheaded", "standardized", "streamlined", "strengthened",
    "surpassed", "transformed", "upgraded", "yielded"
]

class ATSScorer:
    def evaluate(self, parsed_data: Dict[str, Any], target_role: str = "") -> Dict[str, Any]:
        raw_text = parsed_data.get("raw_text", "").lower()
        sections = parsed_data.get("sections", {})
        contact = parsed_data.get("contact_info", {})
        bullets = parsed_data.get("extracted_bullets", [])
        
        # 1. Evaluate Section Completeness & Pillar Scores
        section_scores = {}
        missing_sections = []

        # Contact Info (15% weight)
        contact_score = 40
        contact_feedback = []
        if contact.get("email"):
            contact_score += 20
        else:
            contact_feedback.append("Missing professional email address.")
        if contact.get("phone"):
            contact_score += 20
        else:
            contact_feedback.append("Missing contact phone number.")
        if contact.get("linkedin"):
            contact_score += 10
        else:
            contact_feedback.append("Missing LinkedIn profile URL.")
        if contact.get("github") or contact.get("location"):
            contact_score += 10
        
        section_scores["contact"] = {
            "name": "Contact Information",
            "score": min(100, contact_score),
            "status": "excellent" if contact_score >= 90 else "good" if contact_score >= 70 else "needs_improvement",
            "feedback": "Complete contact details with professional links." if not contact_feedback else " ".join(contact_feedback)
        }

        # Professional Summary (10% weight)
        has_summary = "summary" in sections
        summary_text = sections.get("summary", "")
        summary_words = len(summary_text.split())
        if has_summary and summary_words >= 25:
            summary_score = 90 if summary_words <= 80 else 75
            summary_feedback = "Strong summary highlighting core value proposition." if summary_words <= 80 else "Summary is slightly verbose; keep within 3-4 concise lines."
            summary_status = "excellent" if summary_score >= 85 else "good"
        elif has_summary:
            summary_score = 55
            summary_feedback = "Professional summary is too brief. Expand with years of experience, core domains, and key impact."
            summary_status = "needs_improvement"
        else:
            summary_score = 20
            summary_feedback = "No professional summary detected. Adding one gives recruiters an instant elevator pitch."
            summary_status = "missing"
            missing_sections.append("Professional Summary")

        section_scores["summary"] = {
            "name": "Professional Summary",
            "score": summary_score,
            "status": summary_status,
            "feedback": summary_feedback
        }

        # Work Experience (25% weight)
        has_exp = "experience" in sections
        if has_exp:
            exp_text = sections.get("experience", "")
            exp_words = len(exp_text.split())
            exp_score = 85 if exp_words >= 100 else 65
            exp_feedback = "Rich professional work experience provided."
            exp_status = "excellent" if exp_score >= 80 else "good"
        else:
            exp_score = 25
            exp_feedback = "No dedicated Work Experience section found."
            exp_status = "missing"
            missing_sections.append("Work Experience")

        section_scores["experience"] = {
            "name": "Work Experience",
            "score": exp_score,
            "status": exp_status,
            "feedback": exp_feedback
        }

        # Education (10% weight)
        has_edu = "education" in sections
        if has_edu:
            edu_score = 90
            edu_feedback = "Academic credentials present with clear degree information."
            edu_status = "excellent"
        else:
            edu_score = 30
            edu_feedback = "Education credentials are missing or could not be cleanly identified."
            edu_status = "missing"
            missing_sections.append("Education")

        section_scores["education"] = {
            "name": "Education",
            "score": edu_score,
            "status": edu_status,
            "feedback": edu_feedback
        }

        # Skills (15% weight)
        has_skills = "skills" in sections
        if has_skills:
            skills_text = sections.get("skills", "")
            skills_score = 90 if len(skills_text.split()) >= 15 else 65
            skills_feedback = "Dedicated skills section with technical taxonomy."
            skills_status = "excellent" if skills_score >= 80 else "good"
        else:
            skills_score = 25
            skills_feedback = "No designated Skills section detected. ATS scanners heavily depend on clean skill lists."
            skills_status = "missing"
            missing_sections.append("Skills")

        section_scores["skills"] = {
            "name": "Skills",
            "score": skills_score,
            "status": skills_status,
            "feedback": skills_feedback
        }

        # Projects (10% weight)
        has_proj = "projects" in sections
        if has_proj:
            proj_score = 85
            proj_feedback = "Portfolio projects demonstrate hands-on applied ability."
            proj_status = "excellent"
        else:
            proj_score = 50
            proj_feedback = "Consider adding featured projects or case studies to substantiate your impact."
            proj_status = "needs_improvement"

        section_scores["projects"] = {
            "name": "Projects",
            "score": proj_score,
            "status": proj_status,
            "feedback": proj_feedback
        }

        # Certifications (8% weight)
        has_cert = "certifications" in sections
        if has_cert:
            cert_score = 95
            cert_feedback = "Industry certifications verified and highlighted."
            cert_status = "excellent"
        else:
            cert_score = 60
            cert_feedback = "Adding relevant credentials or cloud certifications will boost ranking."
            cert_status = "needs_improvement"

        section_scores["certifications"] = {
            "name": "Certifications",
            "score": cert_score,
            "status": cert_status,
            "feedback": cert_feedback
        }

        # Achievements (7% weight)
        has_achieve = "achievements" in sections
        if has_achieve:
            achieve_score = 90
            achieve_feedback = "Documented awards, recognitions, or honors."
            achieve_status = "excellent"
        else:
            achieve_score = 55
            achieve_feedback = "Highlight awards, patents, open-source contributions, or promotions."
            achieve_status = "needs_improvement"

        section_scores["achievements"] = {
            "name": "Achievements",
            "score": achieve_score,
            "status": achieve_status,
            "feedback": achieve_feedback
        }

        # 2. Measurable Metrics & Bullet Point Analysis
        metric_pattern = r'(\d+[\d,]*%|\$\d+[\d,]*[KkMmBb]?|\d+\s*(?:x|times|users|clients|engineers|people|team members|projects|days|weeks|months|years)|\b\d{2,}\b)'
        metrics_found = 0
        weak_verbs_found = []
        action_verb_suggestions = []

        for bullet in bullets:
            b_lower = bullet.lower()
            if re.search(metric_pattern, bullet):
                metrics_found += 1
            
            # Check weak verbs
            for weak, suggested in WEAK_VERBS_MAP.items():
                if weak in b_lower:
                    weak_verbs_found.append(weak)
                    if len(action_verb_suggestions) < 6:
                        action_verb_suggestions.append({
                            "original_phrase": weak,
                            "suggested_verb": suggested[0].capitalize(),
                            "example": f"Instead of '{weak}...', use '{suggested[0].capitalize()} [project] resulting in [quantifiable outcome]'."
                        })

        # 3. Keyword Matcher
        target_role_lower = target_role.lower()
        active_domain = "software"
        if "data" in target_role_lower or "analyst" in target_role_lower or "ai" in target_role_lower:
            active_domain = "data"
        elif "product" in target_role_lower or "manager" in target_role_lower or "scrum" in target_role_lower:
            active_domain = "product"
        
        target_keywords = ROLE_KEYWORDS.get(active_domain, ROLE_KEYWORDS["software"])
        matched_keywords = [kw for kw in target_keywords if kw in raw_text]
        missing_skills = [kw for kw in target_keywords if kw not in raw_text][:8]

        keyword_match_rate = len(matched_keywords) / max(1, len(target_keywords))
        
        # 4. Grammar & Style Checks
        grammar_issues = []
        # Check for first-person pronouns (I, me, my) which are discouraged in modern ATS resumes
        first_person_matches = re.findall(r'\b(I|my|mine|myself)\b', parsed_data.get("raw_text", ""))
        if first_person_matches:
            grammar_issues.append({
                "issue": "First-Person Pronouns Detected",
                "context": f"Found {len(first_person_matches)} instances of first-person pronouns ('I', 'my').",
                "suggestion": "Convert sentences into third-person implied action statements (e.g. 'Engineered distributed pipeline' instead of 'I engineered...').",
                "severity": "medium"
            })

        # Check for passive constructions
        passive_matches = re.findall(r'\b(was|were|been|being)\s+([a-z]+ed)\b', raw_text)
        if passive_matches:
            grammar_issues.append({
                "issue": "Passive Voice Usage",
                "context": f"Found passive expressions like '{passive_matches[0][0]} {passive_matches[0][1]}'.",
                "suggestion": "Lead bullet points directly with active past-tense impact verbs (e.g., 'Spearheaded', 'Optimized', 'Delivered').",
                "severity": "low"
            })

        # Check bullet length
        overly_long_bullets = [b for b in bullets if len(b.split()) > 45]
        if overly_long_bullets:
            grammar_issues.append({
                "issue": "Run-on Bullet Points",
                "context": f"{len(overly_long_bullets)} bullet points exceed 45 words.",
                "suggestion": "Split dense multi-line bullets into concise 1-2 line statements focusing on Result -> Action -> Context.",
                "severity": "medium"
            })

        # 5. Calculate Overall Score & ATS Score
        # Weights:
        # Contact: 15, Summary: 10, Experience: 25, Education: 10, Skills: 15, Projects: 10, Certs: 8, Achievements: 7 = 100
        overall_score = int(
            (section_scores["contact"]["score"] * 0.15) +
            (section_scores["summary"]["score"] * 0.10) +
            (section_scores["experience"]["score"] * 0.25) +
            (section_scores["education"]["score"] * 0.10) +
            (section_scores["skills"]["score"] * 0.15) +
            (section_scores["projects"]["score"] * 0.10) +
            (section_scores["certifications"]["score"] * 0.08) +
            (section_scores["achievements"]["score"] * 0.07)
        )

        # ATS Score calculation based on parseability, keyword match, and metric presence
        metric_score = min(100, int((metrics_found / max(1, len(bullets) * 0.5)) * 100)) if bullets else 50
        keyword_score = int(keyword_match_rate * 100)
        ats_score = int((overall_score * 0.45) + (keyword_score * 0.35) + (metric_score * 0.20))
        ats_score = max(35, min(98, ats_score))
        overall_score = max(40, min(99, overall_score))

        # Strengths & Weaknesses
        strengths = []
        weaknesses = []

        if contact_score >= 80:
            strengths.append("High-visibility contact details with direct professional portfolio links.")
        if metrics_found >= 3:
            strengths.append(f"Contains {metrics_found} quantifiable metric-driven accomplishments ($, %, scale).")
        else:
            weaknesses.append("Lacks quantifiable metrics. Add specific KPIs, percentages, and revenue/latency numbers.")

        if keyword_match_rate >= 0.5:
            strengths.append(f"Demonstrates strong alignment with core '{active_domain}' market terminology.")
        else:
            weaknesses.append(f"Keyword match for target field is low. Include missing skills like {', '.join(missing_skills[:3])}.")

        if not missing_sections:
            strengths.append("Comprehensive structural completeness across all 8 standard ATS resume pillars.")
        else:
            weaknesses.append(f"Missing essential resume sections: {', '.join(missing_sections)}.")

        if weak_verbs_found:
            weaknesses.append(f"Contains repetitive or passive phrasing ('{weak_verbs_found[0]}'). Replace with assertive impact verbs.")

        ats_optimizations = [
            "Use standard ATS section headings ('Work Experience', 'Skills', 'Education') rather than creative titles.",
            "Avoid multi-column tables, graphics, text boxes, or headers/footers which can garble ATS parsers.",
            f"Infuse high-frequency target keywords ({', '.join(missing_skills[:4])}) naturally into your bullet points.",
            "Ensure dates are formatted consistently in Month Year or YYYY format (e.g. 'Jan 2022 - Present').",
            "Follow the XYZ Formula: Accomplished [X] as measured by [Y], by doing [Z]."
        ]

        recommended_skills = {
            "technical": missing_skills[:5],
            "soft": ["Cross-functional Leadership", "Strategic Problem Solving", "Stakeholder Communication", "Agile Execution"]
        }

        return {
            "overall_score": overall_score,
            "ats_score": ats_score,
            "section_scores": section_scores,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missing_sections": missing_sections,
            "missing_skills": missing_skills,
            "recommended_skills": recommended_skills,
            "grammar_issues": grammar_issues,
            "action_verb_suggestions": action_verb_suggestions,
            "ats_optimizations": ats_optimizations,
            "metrics_count": metrics_found,
            "matched_keywords": matched_keywords
        }

ats_scorer = ATSScorer()
