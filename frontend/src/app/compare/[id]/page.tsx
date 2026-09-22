"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, SplitSquareVertical, FileText, Download, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { ResumeData, AnalysisData } from "@/types/resume";
import { ComparisonView } from "@/components/ComparisonView";

export default function ComparePage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params?.id as string;

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const resumeData = await api.getResume(resumeId);
        setResume(resumeData);
        const analysisData = await api.getLatestAnalysis(resumeId);
        setAnalysis(analysisData);
      } catch (err: any) {
        setError(err.message || "Failed to load comparison data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        <p className="text-slate-300 font-semibold text-sm">Generating side-by-side comparison...</p>
      </div>
    );
  }

  if (error || !analysis || !resume) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-2xl glass-card text-center">
        <p className="text-rose-400 mb-4 font-semibold">{error || "Could not find resume data."}</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard?id=${resume.id}`}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <SplitSquareVertical className="w-6 h-6 mr-2 text-violet-400" />
              Side-by-Side Comparison
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspecting <strong>{resume.filename}</strong> for <strong>{resume.target_role || "Target Role"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/dashboard?id=${resume.id}`}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all"
          >
            Back to Dashboard
          </Link>
          <a
            href={api.getReportDownloadUrl(analysis.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            PDF Report
          </a>
        </div>
      </div>

      {/* Side-by-Side Comparison View */}
      <ComparisonView comparisonData={analysis.comparison_data || []} />
    </div>
  );
}
