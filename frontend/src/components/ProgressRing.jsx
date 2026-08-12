import React from 'react';

const ProgressRing = ({ progress }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg className="transform -rotate-90 w-full h-full">
      <circle
        className="text-gray-200"
        strokeWidth="6"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="50%"
        cy="50%"
      />
      <circle
        className="text-primary-600 transition-all duration-500"
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="50%"
        cy="50%"
      />
    </svg>
  );
};

export default ProgressRing;