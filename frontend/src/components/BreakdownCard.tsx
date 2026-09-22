import React from "react";
import { SectionScore } from "@/types/resume";
import { 
  UserCheck, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Award, 
  Trophy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle
} from "lucide-react";

interface BreakdownCardProps {
  sectionKey: string;
  data: SectionScore;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  contact: <UserCheck className="w-5 h-5 text-sky-400" />,
  summary: <FileText className="w-5 h-5 text-indigo-400" />,
  experience: <Briefcase className="w-5 h-5 text-emerald-400" />,
  education: <GraduationCap className="w-5 h-5 text-amber-400" />,
  skills: <Code className="w-5 h-5 text-violet-400" />,
  projects: <FolderGit2 className="w-5 h-5 text-pink-400" />,
  certifications: <Award className="w-5 h-5 text-cyan-400" />,
  achievements: <Trophy className="w-5 h-5 text-yellow-400" />
};

export const BreakdownCard: React.FC<BreakdownCardProps> = ({ sectionKey, data }) => {
  const icon = SECTION_ICONS[sectionKey] || <FileText className="w-5 h-5 text-brand-400" />;

  let statusBadge = (
    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <CheckCircle2 className="w-3 h-3 mr-1" />
      Excellent
    </span>
  );
  let barColor = "bg-emerald-500";

  if (data.status === "needs_improvement") {
    statusBadge = (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertCircle className="w-3 h-3 mr-1" />
        Needs Work
      </span>
    );
    barColor = "bg-amber-500";
  } else if (data.status === "missing") {
    statusBadge = (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="w-3 h-3 mr-1" />
        Missing
      </span>
    );
    barColor = "bg-rose-500";
  } else if (data.status === "good") {
    statusBadge = (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Good
      </span>
    );
    barColor = "bg-blue-500";
  }

  return (
    <div className="p-5 rounded-xl glass-card transition-all hover:bg-slate-800/40 hover:border-slate-700/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
            {icon}
          </div>
          <h4 className="font-semibold text-slate-100 text-sm">{data.name}</h4>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold text-white">{data.score}/100</span>
          {statusBadge}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${Math.max(5, data.score)}%` }}
        />
      </div>

      {/* Feedback text */}
      <p className="text-xs text-slate-400 leading-relaxed">{data.feedback}</p>
    </div>
  );
};
