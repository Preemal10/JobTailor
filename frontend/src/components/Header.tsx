/**
 * Header component with logo and tagline
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link to="/" className="flex flex-col items-center sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
            JobTailor
          </h1>
          <span className="text-sm sm:text-base text-gray-500">
            Resume ATS Analyzer
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
