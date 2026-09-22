import React from "react";
import { Tag, Plus, Check } from "lucide-react";

interface KeywordPillsProps {
  missingSkills: string[];
  recommendedSkills?: {
    technical?: string[];
    soft?: string[];
  };
  matchedSkills?: string[];
}

export const KeywordPills: React.FC<KeywordPillsProps> = ({
  missingSkills,
  recommendedSkills,
  matchedSkills = []
}) => {
  return (
    <div className="space-y-4">
      {/* Missing high-priority skills */}
      {missingSkills && missingSkills.length > 0 && (
        <div className="p-4 rounded-xl glass-card border-rose-500/20 bg-rose-950/10">
          <div className="flex items-center space-x-2 mb-2.5">
            <Tag className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-bold text-white">Missing Target Keywords for Role</h4>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            ATS search algorithms scan for these terms. Incorporate them naturally into your bullet points and skills summary:
          </p>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30"
              >
                <Plus className="w-3 h-3 mr-1 text-rose-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Soft & Leadership Skills */}
      {recommendedSkills?.soft && recommendedSkills.soft.length > 0 && (
        <div className="p-4 rounded-xl glass-card border-slate-700/50">
          <h4 className="text-sm font-bold text-white mb-2">Recommended Leadership & Soft Competencies</h4>
          <div className="flex flex-wrap gap-2">
            {recommendedSkills.soft.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
