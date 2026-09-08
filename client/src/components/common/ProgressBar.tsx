import React from 'react';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const clamped = Math.min(Math.max(progress || 0, 0), 100);

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
  };

  const getGradient = (pct: number) => {
    if (pct >= 100) return 'from-emerald-500 to-teal-400';
    if (pct >= 60) return 'from-brand-500 to-indigo-400';
    if (pct >= 25) return 'from-amber-500 to-yellow-400';
    return 'from-slate-500 to-slate-400';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-medium">
          <span>Progress</span>
          <span className="text-slate-200 font-semibold">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${getGradient(clamped)} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
