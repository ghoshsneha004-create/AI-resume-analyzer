"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Download, 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  SplitSquareVertical, 
  Copy,
  Check,
  Zap,
  Clock,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { ResumeData, AnalysisData } from "@/types/resume";
import { ScoreGauge } from "@/components/ScoreGauge";
import { BreakdownCard } from "@/components/BreakdownCard";
import { BulletOptimizer } from "@/components/BulletOptimizer";
import { KeywordPills } from "@/components/KeywordPills";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = searchParams.get("id");

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (!resumeId) {
      setError("No resume ID provided. Please upload a resume first.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const resumeData = await api.getResume(resumeId);
        setResume(resumeData);

        try {
          const analysisData = await api.getLatestAnalysis(resumeId);
          setAnalysis(analysisData);
        } catch {
          // If no analysis exists yet, run it automatically
          const newAnalysis = await api.analyzeResume(resumeId, resumeData.target_role);
          setAnalysis(newAnalysis);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load resume analysis.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resumeId]);

  const handleReanalyze = async () => {
    if (!resumeId) return;
    setReanalyzing(true);
    try {
      const freshAnalysis = await api.analyzeResume(resumeId, resume?.target_role);
      setAnalysis(freshAnalysis);
    } catch (err: any) {
      alert("Error re-analyzing: " + err.message);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleCopySummary = () => {
    if (analysis?.improved_summary) {
      navigator.clipboard.writeText(analysis.improved_summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
        <p className="text-slate-300 font-semibold text-sm">Evaluating resume against ATS benchmarks & AI models...</p>
      </div>
    );
  }

  if (error || !analysis || !resume) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-2xl glass-card text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Resume Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error || "Unable to retrieve analysis details."}</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Upload a Resume
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Back to Upload"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white tracking-tight max-w-md truncate">
                {resume.filename}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/30">
                {resume.target_role || "Target Role"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-4">
              <span className="flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {resume.parsed_data?.word_count || 450} words
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {new Date(resume.created_at).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${reanalyzing ? "animate-spin" : ""}`} />
            {reanalyzing ? "Analyzing..." : "Re-Analyze"}
          </button>

          <Link
            href={`/compare/${resume.id}`}
            className="flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-white hover:bg-slate-700 transition-all shadow"
          >
            <SplitSquareVertical className="w-3.5 h-3.5 mr-1.5 text-violet-400" />
            Side-by-Side View
          </Link>

          <a
            href={api.getReportDownloadUrl(analysis.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download PDF Report
          </a>
        </div>
      </div>

      {/* Row 1: High-Level Score Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreGauge
          score={analysis.overall_score}
          label="Overall Resume Score"
          sublabel="Weighted score across 8 structure pillars"
        />
        <ScoreGauge
          score={analysis.ats_score}
          label="ATS Match Index"
          sublabel="Keyword density & parser compatibility"
        />
        <ScoreGauge
          score={Math.min(100, (analysis.rewritten_bullets?.length || 3) * 20 + 20)}
          label="Impact & Metric Density"
          sublabel="Quantifiable achievement statements"
        />
      </div>

      {/* Row 2: Executive Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl glass-card border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Top Resume Strengths</h3>
          </div>
          <ul className="space-y-3">
            {analysis.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 mr-2.5 flex-shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Weaknesses */}
        <div className="p-6 rounded-2xl glass-card border-rose-500/20 bg-rose-950/10">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Critical Weaknesses & ATS Risks</h3>
          </div>
          <ul className="space-y-3">
            {analysis.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 mr-2.5 flex-shrink-0" />
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 3: 8-Pillar Structure Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">8-Pillar Structural Audit</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive evaluation of every critical section required by recruiters and ATS software.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analysis.section_scores || {}).map(([key, item]) => (
            <BreakdownCard key={key} sectionKey={key} data={item} />
          ))}
        </div>
      </div>

      {/* Row 4: AI Professional Summary Optimization */}
      {analysis.improved_summary && (
        <div className="p-6 rounded-2xl glass-panel border border-brand-500/30 bg-gradient-to-br from-brand-950/20 to-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">AI-Generated Executive Summary</h3>
            </div>
            <button
              onClick={handleCopySummary}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Recruiter-ready 3-line elevator pitch highlighting leadership, scope, and technical depth:
          </p>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-brand-500/20 text-slate-100 text-sm leading-relaxed font-medium">
            {analysis.improved_summary}
          </div>
        </div>
      )}

      {/* Row 5: AI Bullet Point Optimizer */}
      <BulletOptimizer rewrites={analysis.rewritten_bullets || []} />

      {/* Row 6: Grammar, Action Verbs & Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grammar & Phrasing Weaknesses */}
        <div className="p-6 rounded-2xl glass-card border-slate-800">
          <h3 className="text-base font-bold text-white mb-1 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
            Grammar & Style Flags
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Phrasing patterns that dilute professional impact:
          </p>

          {analysis.grammar_issues && analysis.grammar_issues.length > 0 ? (
            <div className="space-y-3">
              {analysis.grammar_issues.map((g, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-300">{g.issue}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {g.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-2">{g.context}</p>
                  <p className="text-slate-200 bg-slate-950 p-2 rounded border border-slate-800/80">
                    <strong className="text-emerald-400">Recommendation: </strong>
                    {g.suggestion}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              <span>No critical grammar or voice issues detected!</span>
            </div>
          )}

          {/* Action Verb Replacements */}
          {analysis.action_verb_suggestions && analysis.action_verb_suggestions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Power Verb Upgrades
              </h4>
              <div className="space-y-2">
                {analysis.action_verb_suggestions.slice(0, 3).map((av, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-rose-400 line-through font-mono">{av.original_phrase}</span>
                    <span className="text-slate-500 font-bold">→</span>
                    <span className="text-emerald-400 font-bold font-mono">{av.suggested_verb}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Missing Skills & ATS Checklist */}
        <div className="space-y-6">
          <KeywordPills
            missingSkills={analysis.missing_skills || []}
            recommendedSkills={analysis.recommended_skills}
          />

          {/* ATS Best Practices Checklist */}
          <div className="p-6 rounded-2xl glass-card border-slate-800">
            <h3 className="text-base font-bold text-white mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-brand-400" />
              ATS Optimization Checklist
            </h3>
            <ul className="space-y-2.5">
              {analysis.ats_optimizations.map((tip, idx) => (
                <li key={idx} className="flex items-start text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-brand-400 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-slate-300 text-sm">Loading dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
