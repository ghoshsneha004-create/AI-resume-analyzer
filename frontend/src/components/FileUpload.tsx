"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

interface FileUploadProps {
  onSuccess?: (resumeId: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onSuccess }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Senior Full Stack Engineer");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validExtensions = [".pdf", ".docx"];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setError("Please select a valid PDF (.pdf) or Word document (.docx).");
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB maximum size limit.");
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select or drop a resume file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setLoadingStep("Extracting text and parsing structure...");
      const resume = await api.uploadResume(file, targetRole);

      setLoadingStep("AI analyzing content, ATS scoring & generating rewrites...");
      const analysis = await api.analyzeResume(resume.id, targetRole);

      setLoadingStep("Analysis ready! Loading dashboard...");

      if (onSuccess) {
        onSuccess(resume.id);
      } else {
        router.push(`/dashboard?id=${resume.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-panel p-8 rounded-3xl border border-slate-700/60 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Analyze Your Resume with AI
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Get your instant ATS score, weakness audit, and Google XYZ rewritten bullet points.
          </p>
        </div>

        {/* Target Job Title Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 text-left">
            Target Job Role / Title
          </label>
          <div className="relative">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer, Product Manager, Data Analyst"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
          <span className="text-[11px] text-slate-400 block text-left mt-1">
            Used to benchmark keyword density and industry-specific competencies.
          </span>
        </div>

        {/* Dropzone Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-brand-400 bg-brand-950/30 scale-[1.01]"
              : file
              ? "border-emerald-500/50 bg-emerald-950/10"
              : "border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-white max-w-sm truncate">{file.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
              </p>
              <span className="mt-3 text-xs text-brand-400 hover:underline">
                Click or drag another file to replace
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 mb-3 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-white">
                Drag and drop your resume here, or <span className="text-brand-400">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF and DOCX documents (up to 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload & Analyze Action Button */}
        <div className="mt-6">
          <button
            onClick={handleAnalyze}
            disabled={loading || !file}
            className={`w-full flex items-center justify-center py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-xl transition-all ${
              loading || !file
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{loadingStep || "Processing Resume..."}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Analyze Resume Now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
