/**
 * Suggestions component - displays improvement tips
 */

import React from 'react';

interface SuggestionsProps {
  suggestions: string[];
}

const Suggestions: React.FC<SuggestionsProps> = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💡</span>
        <h3 className="font-semibold text-gray-700">
          Suggestions to Improve
        </h3>
      </div>

      <ul className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-sm text-gray-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100"
          >
            <span className="text-amber-500 mt-0.5">→</span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Suggestions;
