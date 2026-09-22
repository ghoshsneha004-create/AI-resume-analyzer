import React from "react";

interface ScoreGaugeProps {
  score: number;
  label: string;
  sublabel?: string;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label,
  sublabel,
  size = 180,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "#10b981"; // Emerald
  let bgGlow = "rgba(16, 185, 129, 0.15)";
  let badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  let statusText = "High Match";

  if (score < 60) {
    color = "#f43f5e"; // Rose
    bgGlow = "rgba(244, 63, 94, 0.15)";
    badgeColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    statusText = "Needs Work";
  } else if (score < 80) {
    color = "#f59e0b"; // Amber
    bgGlow = "rgba(245, 158, 11, 0.15)";
    badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    statusText = "Moderate";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass-card relative overflow-hidden group">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${bgGlow} 0%, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Value Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Value */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-white tracking-tight">
            {score}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h4 className="text-base font-bold text-white">{label}</h4>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
        <div className="mt-2.5">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
};
