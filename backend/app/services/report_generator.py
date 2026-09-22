import os
import uuid
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.core.config import settings

class ReportGenerator:
    def __init__(self, output_dir: str = settings.REPORTS_DIR):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_pdf(self, resume_data: Dict[str, Any], analysis_data: Dict[str, Any]) -> str:
        report_id = f"report_{uuid.uuid4().hex[:12]}.pdf"
        file_path = os.path.join(self.output_dir, report_id)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            leftMargin=0.5 * inch,
            rightMargin=0.5 * inch,
            topMargin=0.5 * inch,
            bottomMargin=0.5 * inch
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0f172a'),
            fontName='Helvetica-Bold'
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#475569')
        )
        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1e293b'),
            fontName='Helvetica-Bold',
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#334155')
        )
        body_bold = ParagraphStyle(
            'ReportBodyBold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        metric_title = ParagraphStyle(
            'MetricTitle',
            parent=styles['Normal'],
            fontSize=10,
            leading=12,
            textColor=colors.HexColor('#64748b'),
            alignment=1
        )
        metric_score = ParagraphStyle(
            'MetricScore',
            parent=styles['Heading1'],
            fontSize=26,
            leading=30,
            textColor=colors.HexColor('#2563eb'),
            fontName='Helvetica-Bold',
            alignment=1
        )

        story = []

        # Header Title
        story.append(Paragraph("AI Resume Audit & ATS Optimization Report", title_style))
        filename = resume_data.get("filename", "Resume")
        target_role = resume_data.get("target_role") or "General Position"
        story.append(Paragraph(f"Target Role: <b>{target_role}</b> | Source File: <b>{filename}</b>", subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#e2e8f0'), spaceAfter=15))

        # Overall Score Cards Table
        overall_score = analysis_data.get("overall_score", 0)
        ats_score = analysis_data.get("ats_score", 0)
        
        score_data = [
            [
                Paragraph("OVERALL RESUME SCORE", metric_title),
                Paragraph("ATS COMPATIBILITY SCORE", metric_title),
                Paragraph("WORD COUNT & DENSITY", metric_title)
            ],
            [
                Paragraph(f"<b>{overall_score}</b> / 100", metric_score),
                Paragraph(f"<b>{ats_score}</b> / 100", ParagraphStyle('ScoreGreen', parent=metric_score, textColor=colors.HexColor('#059669'))),
                Paragraph(f"<b>{resume_data.get('word_count', 450)}</b> words", ParagraphStyle('ScoreSlate', parent=metric_score, textColor=colors.HexColor('#475569'), fontSize=20))
            ]
        ]
        score_table = Table(score_data, colWidths=[2.5 * inch, 2.5 * inch, 2.5 * inch])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ]))
        story.append(score_table)
        story.append(Spacer(1, 15))

        # Section Breakdown Table
        story.append(Paragraph("1. Resume Structure & Pillar Breakdown", h2_style))
        section_scores = analysis_data.get("section_scores", {})
        
        breakdown_rows = [
            [Paragraph("<b>Section Pillar</b>", body_bold), Paragraph("<b>Score</b>", body_bold), Paragraph("<b>Status</b>", body_bold), Paragraph("<b>Analysis & Recommendations</b>", body_bold)]
        ]
        
        for key, s in section_scores.items():
            status_text = s.get("status", "good").replace("_", " ").upper()
            status_color = "#059669" if "EXCELLENT" in status_text else "#d97706" if "GOOD" in status_text else "#dc2626"
            status_para = Paragraph(f"<font color='{status_color}'><b>{status_text}</b></font>", body_style)
            breakdown_rows.append([
                Paragraph(f"<b>{s.get('name', key.title())}</b>", body_style),
                Paragraph(f"{s.get('score', 0)}/100", body_style),
                status_para,
                Paragraph(s.get("feedback", ""), body_style)
            ])
            
        b_table = Table(breakdown_rows, colWidths=[1.8 * inch, 0.8 * inch, 1.4 * inch, 3.5 * inch])
        b_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(b_table)
        story.append(Spacer(1, 15))

        # Strengths & Weaknesses
        story.append(Paragraph("2. Executive Strengths & Weaknesses", h2_style))
        strengths = analysis_data.get("strengths", [])
        weaknesses = analysis_data.get("weaknesses", [])
        
        sw_data = [
            [Paragraph("<font color='#059669'><b>Key Strengths</b></font>", body_bold), Paragraph("<font color='#dc2626'><b>Critical Areas for Improvement</b></font>", body_bold)]
        ]
        
        s_bullets = "".join([f"• {s}<br/><br/>" for s in strengths]) if strengths else "• Balanced baseline structure."
        w_bullets = "".join([f"• {w}<br/><br/>" for w in weaknesses]) if weaknesses else "• No high-severity weaknesses detected."
        
        sw_data.append([Paragraph(s_bullets, body_style), Paragraph(w_bullets, body_style)])
        
        sw_table = Table(sw_data, colWidths=[3.75 * inch, 3.75 * inch])
        sw_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#f0fdf4')),
            ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#fef2f2')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(sw_table)
        story.append(Spacer(1, 15))

        # AI Rewritten Bullet Points
        rewrites = analysis_data.get("rewritten_bullets", [])
        if rewrites:
            story.append(Paragraph("3. AI Action-Impact Bullet Transformations (Google XYZ Formula)", h2_style))
            for i, r in enumerate(rewrites[:3], 1):
                bullet_data = [
                    [Paragraph(f"<b>Bullet #{i} Original:</b> {r.get('original', '')}", body_style)],
                    [Paragraph(f"<b><font color='#2563eb'>AI Enhanced:</font></b> {r.get('improved', '')}", body_style)],
                    [Paragraph(f"<b>Impact Metric:</b> {r.get('impact_metric', 'N/A')} | <i>{r.get('rationale', '')}</i>", ParagraphStyle('Ital', parent=body_style, textColor=colors.HexColor('#64748b')))]
                ]
                bt = Table(bullet_data, colWidths=[7.5 * inch])
                bt.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f8fafc')),
                    ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#eff6ff')),
                    ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ]))
                story.append(bt)
                story.append(Spacer(1, 6))

        # Improved Executive Summary
        improved_summary = analysis_data.get("improved_summary")
        if improved_summary:
            story.append(Spacer(1, 8))
            story.append(Paragraph("4. Recommended AI Professional Summary", h2_style))
            summary_table = Table([[Paragraph(improved_summary, body_style)]], colWidths=[7.5 * inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f9ff')),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#0284c7')),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(summary_table)

        # ATS Action Checklist
        story.append(Spacer(1, 8))
        story.append(Paragraph("5. ATS Quick Win Recommendations", h2_style))
        ats_opts = analysis_data.get("ats_optimizations", [])
        for opt in ats_opts:
            story.append(Paragraph(f"✓ {opt}", body_style))
            story.append(Spacer(1, 3))

        doc.build(story)
        return file_path

report_generator = ReportGenerator()
