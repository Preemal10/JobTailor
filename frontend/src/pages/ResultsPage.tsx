/**
 * Results page - Display ATS analysis results
 */

import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import ScoreGauge from '../components/ScoreGauge';
import KeywordList from '../components/KeywordList';
import Suggestions from '../components/Suggestions';
import { JobDescription } from '../types';

interface ResultsState {
  atsScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  jobDescription: JobDescription;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;

  // Redirect to home if no results data
  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { atsScore, matchingKeywords, missingKeywords, suggestions, jobDescription } = state;

  const handleAnalyzeAnother = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Job info header */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
            ATS Analysis Results
          </h2>
          <p className="text-gray-600">
            for <span className="font-medium text-primary-600">{jobDescription.roleTitle}</span>
            {jobDescription.company && jobDescription.company !== 'Not specified' && (
              <> at <span className="font-medium">{jobDescription.company}</span></>
            )}
          </p>
        </div>

        {/* Score gauge */}
        <div className="mb-6">
          <ScoreGauge score={atsScore} />
        </div>

        {/* Keywords */}
        <div className="mb-6">
          <KeywordList
            matchingKeywords={matchingKeywords}
            missingKeywords={missingKeywords}
          />
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <Suggestions suggestions={suggestions} />
        </div>

        {/* Analyze another button */}
        <div className="max-w-md mx-auto">
          <button
            onClick={handleAnalyzeAnother}
            className="w-full py-3 px-6 rounded-lg font-medium text-primary-600 
                       bg-white/80 backdrop-blur-sm border-2 border-primary-600 
                       hover:bg-primary-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            ← Analyze Another Resume
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p>JobTailor - Resume ATS Analyzer</p>
      </footer>
    </div>
  );
};

export default ResultsPage;
