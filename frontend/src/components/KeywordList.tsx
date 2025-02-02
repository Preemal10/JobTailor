/**
 * Keyword list component - displays matching and missing keywords
 */

import React from 'react';

interface KeywordListProps {
  matchingKeywords: string[];
  missingKeywords: string[];
}

const KeywordList: React.FC<KeywordListProps> = ({
  matchingKeywords,
  missingKeywords,
}) => {
  return (
    <div className="space-y-4">
      {/* Matching Keywords */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✅</span>
          <h3 className="font-semibold text-gray-700">
            Matching Keywords
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({matchingKeywords.length})
            </span>
          </h3>
        </div>

        {matchingKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matchingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100/80 text-green-700 text-sm rounded-full border border-green-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No matching keywords found</p>
        )}
      </div>

      {/* Missing Keywords */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">❌</span>
          <h3 className="font-semibold text-gray-700">
            Missing Keywords
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({missingKeywords.length})
            </span>
          </h3>
        </div>

        {missingKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100/80 text-red-700 text-sm rounded-full border border-red-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">All keywords matched!</p>
        )}
      </div>
    </div>
  );
};

export default KeywordList;
