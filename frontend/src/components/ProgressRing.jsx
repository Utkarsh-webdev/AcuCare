// frontend/src/components/ProgressRing.jsx

import React from "react";

const ProgressRing = ({ progress = 0, size = 76 }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
      }}
      role="progressbar"
      aria-valuenow={Math.round(safeProgress)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`${Math.round(safeProgress)}% complete`}
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 76 76" fill="none">
        {/* Track */}

        <circle
          cx="38"
          cy="38"
          r={radius}
          stroke="#D8CFBF"
          strokeWidth="6"
          fill="transparent"
        />

        {/* Progress */}

        <circle
          cx="38"
          cy="38"
          r={radius}
          stroke="#EF5937"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center */}

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[11px] font-semibold text-[#0B2623]">
          {Math.round(safeProgress)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressRing;
