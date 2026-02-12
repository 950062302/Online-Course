"use client";

import React from 'react';
import './LoadingSpinner.css'; // Import custom CSS

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="blob-loader"></div>
    </div>
  );
};

export default LoadingSpinner;