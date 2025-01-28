/**
 * Analyze button component
 */

import React from 'react';

interface AnalyzeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  onClick,
  isLoading,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full py-3 px-6 rounded-lg font-medium text-white
        transition-all duration-200
        ${disabled || isLoading
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 shadow-md hover:shadow-lg'
        }
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Analyzing...
        </span>
      ) : (
        'Analyze ATS Score'
      )}
    </button>
  );
};

export default AnalyzeButton;
