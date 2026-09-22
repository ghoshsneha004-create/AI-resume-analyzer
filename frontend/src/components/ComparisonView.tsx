"use client";

import React, { useState } from "react";
import { ComparisonSection } from "@/types/resume";
import { Sparkles, Copy, Check, ArrowRight, CheckCircle2 } from "lucide-react";

interface ComparisonViewProps {
  comparisonData: ComparisonSection[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ comparisonData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!comparisonData || comparisonData.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <p className="text-slate-400 text-sm">No comparison data available.</p>
      </div>
    );
  }

  const currentSection = comparisonData[activeTab] || comparisonData[0];

  const handleCopyImproved = () => {
    if (currentSection?.improved) {
      navigator.clipboard.writeText(currentSection.improved);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800/80 shadow-2xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-violet-400" />
            Side-by-Side Resume Transformation
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Compare original parsed text against AI-optimized content with enhanced phrasing and ATS taxonomy.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          {comparisonData.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveTab(idx);
                setCopied(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === idx
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
              }`}
            >
              {sec.section_name}
            </button>
          ))}
        </div>
      </div>

      {/* Key Improvements Badge Bar */}
      {currentSection.highlights && currentSection.highlights.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-slate-850/60 border border-slate-700/50 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
            Key Changes:
          </span>
          {currentSection.highlights.map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60"
            >
              <CheckCircle2 className="w-3 h-3 mr-1.5 text-emerald-400" />
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Side-by-Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column: Original */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              Original Content
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
              Raw Input
            </span>
          </div>
          <div className="flex-1 overflow-auto max-h-[360px] pr-2">
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {currentSection.original || "No original content recorded."}
            </pre>
          </div>
        </div>

        {/* Right Column: AI Enhanced */}
        <div className="flex flex-col rounded-xl border border-brand-500/30 bg-brand-950/20 p-5 relative group">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-500/20">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
              AI Optimized Version
            </span>
            <button
              onClick={handleCopyImproved}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-all shadow"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Section</span>
                </>
              )}
            </button>
          </div>
          <div className="flex-1 overflow-auto max-h-[360px] pr-2">
            <pre className="text-xs font-sans text-slate-100 whitespace-pre-wrap leading-relaxed font-medium">
              {currentSection.improved || "No AI improved content generated."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
