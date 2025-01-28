/**
 * Job Description input component
 * Supports file upload (TXT) or direct text paste
 */

import React, { useState, useCallback } from 'react';

interface JDInputProps {
  onTextChange: (text: string) => void;
  onFileSelect: (file: File) => void;
  text: string;
  selectedFile: File | null;
  isLoading?: boolean;
}

const JDInput: React.FC<JDInputProps> = ({
  onTextChange,
  onFileSelect,
  text,
  selectedFile,
  isLoading = false,
}) => {
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      setError('Please upload a TXT file');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
      setInputMode('upload');
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
      setInputMode('upload');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
    setInputMode('paste');
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Job Description
      </label>

      {/* Tab buttons */}
      <div className="flex mb-3 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setInputMode('paste')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            inputMode === 'paste'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Paste Text
        </button>
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            inputMode === 'upload'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload File
        </button>
      </div>

      {/* Paste text mode */}
      {inputMode === 'paste' && (
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Paste the job description here..."
          disabled={isLoading}
          className={`
            w-full h-48 px-4 py-3 border border-gray-300 rounded-lg
            resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            placeholder-gray-400 text-sm
            ${isLoading ? 'opacity-50' : ''}
          `}
        />
      )}

      {/* Upload file mode */}
      {inputMode === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-all duration-200 h-48 flex items-center justify-center
            ${isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />

          <div className="space-y-2">
            <div className="text-4xl">
              {selectedFile ? '✅' : '📝'}
            </div>

            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-primary-600">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  Drag & drop TXT file here
                </p>
                <p className="text-xs text-gray-400">
                  or click to browse
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {/* Character count for text mode */}
      {inputMode === 'paste' && text && (
        <p className="mt-1 text-xs text-gray-400 text-right">
          {text.length} characters
        </p>
      )}
    </div>
  );
};

export default JDInput;
