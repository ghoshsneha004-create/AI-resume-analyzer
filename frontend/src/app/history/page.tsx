"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { History, FileText, ArrowRight, ArrowLeft, Clock, Award, ShieldCheck, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { ResumeData } from "@/types/resume";

export default function HistoryPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await api.getResumes();
        setResumes(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <History className="w-6 h-6 mr-2.5 text-brand-400" />
            Resume Analysis History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access past resume audits, track score improvements, and export audit reports.
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow"
        >
          Analyze New Resume
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading analysis history...</p>
        </div>
      ) : resumes.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-2xl border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No resumes analyzed yet</h3>
          <p className="text-xs text-slate-400 mb-6">
            Upload your first resume to inspect ATS compatibility, grammar, and bullet optimizations.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
          >
            Upload Resume Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-xl glass-card border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white max-w-xs truncate">{res.filename}</h3>
                      <span className="text-[11px] font-semibold text-brand-300">
                        {res.target_role || "General Position"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {new Date(res.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{res.file_type.toUpperCase()}</span>
                  <span>•</span>
                  <span>{(res.file_size / 1024).toFixed(0)} KB</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800/80">
                <Link
                  href={`/compare/${res.id}`}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Side-by-Side
                </Link>
                <Link
                  href={`/dashboard?id=${res.id}`}
                  className="flex items-center text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  View Full Audit
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
