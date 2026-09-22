"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  TrendingUp, 
  Layers, 
  Download, 
  CheckCircle2, 
  Zap,
  ArrowRight,
  FileText
} from "lucide-react";
import { FileUpload } from "@/components/FileUpload";

export default function HomePage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoUpload = async () => {
    setDemoLoading(true);
    try {
      // Create a mock demo resume file
      const demoResumeContent = `
John Doe
San Francisco, CA | (555) 123-4567 | john.doe@email.com | linkedin.com/in/johndoe | github.com/johndoe

PROFESSIONAL SUMMARY
Experienced Software Engineer with a passion for web application development and cloud computing. Worked on frontend and backend systems to support company initiatives.

WORK EXPERIENCE
Software Engineer | Acme Tech Solutions | 2021 - Present
- Worked on web application development using React and Node.
- Responsible for backend API maintenance and database queries.
- Helped with team code reviews and unit testing.
- Handled bug fixes and performance troubleshooting.

Junior Developer | CloudSystems Inc | 2019 - 2021
- Assisted senior engineers in migrating microservices to AWS.
- Built dashboard widgets and customer reports using SQL and JavaScript.
- Did deployment scripts and fixed production tickets.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2015 - 2019

TECHNICAL SKILLS
Languages & Frameworks: JavaScript, TypeScript, React, Python, Node.js, Express, HTML, CSS
Databases & Cloud: PostgreSQL, MongoDB, AWS, Git, Docker

PROJECTS
E-Commerce Platform | Personal Project
- Developed a full-stack shopping cart application with payment integration.
- Used MongoDB for product catalog storage.

CERTIFICATIONS
AWS Certified Cloud Practitioner
`;
      const blob = new Blob([demoResumeContent], { type: "text/plain" });
      const file = new File([blob], "John_Doe_Software_Engineer_Resume.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_role", "Senior Full Stack Engineer");

      const res = await fetch("http://127.0.0.1:8000/api/v1/resumes/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const resume = await res.json();
        // Analyze immediately
        const analyzeRes = await fetch(`http://127.0.0.1:8000/api/v1/analysis/${resume.id}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_role: "Senior Full Stack Engineer" }),
        });
        if (analyzeRes.ok) {
          router.push(`/dashboard?id=${resume.id}`);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-brand-600/20 via-violet-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 text-center max-w-5xl mx-auto px-4">
        {/* Top Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Next-Generation Resume Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          Turn Your Resume Into An{" "}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            Interview Magnet
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Powered by Gemini AI and ATS scoring algorithms. Audit 8 core resume pillars, detect grammar weaknesses, optimize action verbs, and convert weak bullets into high-impact Google XYZ statements.
        </p>

        {/* Quick Demo Button */}
        <div className="mt-5 flex items-center justify-center space-x-3">
          <button
            onClick={handleDemoUpload}
            disabled={demoLoading}
            className="inline-flex items-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 px-3.5 py-2 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 mr-2 text-brand-400" />
            {demoLoading ? "Analyzing Sample Resume..." : "⚡ Try With Instant Sample Resume"}
          </button>
        </div>

        {/* Upload Zone */}
        <div className="mt-10">
          <FileUpload />
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
            Why CareerCraft AI
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            Built to Outperform Modern Applicant Tracking Systems
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl glass-card border-slate-800 hover:border-brand-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Deterministic ATS Scoring</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Scan for section completeness, formatting traps, contact URL parseability, and keyword density before your resume reaches a recruiter.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl glass-card border-slate-800 hover:border-violet-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Google XYZ Bullet Rewriter</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transform passive statements like "responsible for coding" into executive achievement formulas: Accomplished X, measured by Y, by doing Z.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl glass-card border-slate-800 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Executive PDF Audit Reports</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Export downloadable, beautifully formatted audit reports with score breakdowns, weakness checklists, and recruiter recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
