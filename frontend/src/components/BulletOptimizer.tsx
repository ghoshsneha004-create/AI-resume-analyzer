"use client";

import React, { useState } from "react";
import { BulletRewrite } from "@/types/resume";
import { Sparkles, Copy, Check, TrendingUp, HelpCircle } from "lucide-react";

interface BulletOptimizerProps {
  rewrites: BulletRewrite[];
}

export const BulletOptimizer: React.FC<BulletOptimizerProps> = ({ rewrites }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!rewrites || rewrites.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-brand-400" />
            AI Bullet Point Optimizer (Google XYZ Formula)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula: Accomplished <b className="text-slate-300">[X]</b> as measured by <b className="text-slate-300">[Y]</b>, by doing <b className="text-slate-300">[Z]</b>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rewrites.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl glass-card border border-slate-700/60 bg-slate-900/60 hover:border-brand-500/40 transition-all group"
          >
            {/* Original statement */}
            <div className="mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Original Bullet
              </span>
              <p className="text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 font-mono">
                {item.original}
              </p>
            </div>

            {/* AI Enhanced bullet */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  AI Enhanced Impact Bullet
                </span>
                {item.impact_metric && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {item.impact_metric}
                  </span>
                )}
              </div>
              <div className="relative">
                <p className="text-sm text-white bg-brand-950/30 p-3.5 rounded-lg border border-brand-500/30 font-medium leading-relaxed">
                  {item.improved}
                </p>
                <button
                  onClick={() => handleCopy(item.improved, idx)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-slate-800/80 hover:bg-brand-600 text-slate-300 hover:text-white transition-all shadow"
                  title="Copy improved bullet"
                >
                  {copiedIndex === idx ? (
                    <span className="flex items-center text-xs text-emerald-300 font-semibold px-1">
                      <Check className="w-3.5 h-3.5 mr-1" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Rationale */}
            <div className="flex items-start text-xs text-slate-400 mt-2 bg-slate-800/30 p-2.5 rounded-lg border border-slate-800">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-slate-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-slate-300">Why this works: </strong>
                {item.rationale}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
