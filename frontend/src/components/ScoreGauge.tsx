/**
 * Score gauge component - displays ATS score visually
 */

import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMessage = () => {
    if (score >= 80) return 'Excellent Match!';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        ATS Score
      </h2>

      {/* Score display */}
      <div className="text-center mb-4">
        <span className={`text-6xl font-bold ${getTextColor()}`}>
          {score}
        </span>
        <span className="text-2xl text-gray-400">/100</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-4 bg-gray-200/70 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Message */}
      <p className={`text-center font-medium ${getTextColor()}`}>
        {getMessage()}
      </p>
    </div>
  );
};

export default ScoreGauge;
