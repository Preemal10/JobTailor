/**
 * Home page - Upload resume and job description
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ResumeUpload from '../components/ResumeUpload';
import JDInput from '../components/JDInput';
import AnalyzeButton from '../components/AnalyzeButton';
import { uploadResume, parseJDText, uploadJDFile, checkATSKeywords } from '../services/api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we can analyze
  const canAnalyze = resumeFile && (jdText.length >= 50 || jdFile);

  // Handle analyze button click
  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError('Please upload your resume');
      return;
    }

    if (!jdText && !jdFile) {
      setError('Please provide a job description');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Upload resume
      const resumeResponse = await uploadResume(resumeFile);
      if (!resumeResponse.success) {
        throw new Error(resumeResponse.error || 'Failed to upload resume');
      }

      // Step 2: Parse JD (either from text or file)
      let jdResponse;
      if (jdFile) {
        jdResponse = await uploadJDFile(jdFile);
      } else {
        jdResponse = await parseJDText(jdText);
      }

      if (!jdResponse.success) {
        throw new Error(jdResponse.error || 'Failed to parse job description');
      }

      // Step 3: Use the raw resume text for ATS keyword checking
      const resumeText = (resumeResponse as any).resumeText || '';

      // Step 4: Check ATS keywords using simple text comparison
      const atsResponse = await checkATSKeywords(
        resumeText,
        jdResponse.data as any
      );

      if (!atsResponse.success) {
        throw new Error(atsResponse.error || 'Failed to analyze ATS score');
      }

      // Navigate to results page with data
      navigate('/results', {
        state: {
          atsScore: atsResponse.data.atsScore,
          matchingKeywords: atsResponse.data.matchingKeywords || [],
          missingKeywords: atsResponse.data.missingKeywords || [],
          suggestions: atsResponse.data.suggestions || [],
          jobDescription: jdResponse.data,
        },
      });

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Intro text */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
            Check Your Resume's ATS Score
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your resume and paste a job description to see how well your resume 
            matches the job requirements.
          </p>
        </div>

        {/* Upload sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Resume upload */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md card-hover border border-gray-100">
            <ResumeUpload
              onFileSelect={setResumeFile}
              selectedFile={resumeFile}
              isLoading={isLoading}
            />
          </div>

          {/* JD input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md card-hover border border-gray-100">
            <JDInput
              onTextChange={setJdText}
              onFileSelect={setJdFile}
              text={jdText}
              selectedFile={jdFile}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Analyze button */}
        <div className="max-w-md mx-auto">
          <AnalyzeButton
            onClick={handleAnalyze}
            isLoading={isLoading}
            disabled={!canAnalyze}
          />

          {!canAnalyze && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Upload resume and provide job description (min 50 characters) to analyze
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p>JobTailor - Resume ATS Analyzer</p>
      </footer>
    </div>
  );
};

export default HomePage;
