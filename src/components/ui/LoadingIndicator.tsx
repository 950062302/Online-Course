"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingIndicator.css'; // Import custom CSS

interface LoadingIndicatorProps {
  messages: Map<string | number, string>;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ messages }) => {
  if (messages.size === 0) {
    return null;
  }

  return (
    <div className="loading-indicator-container">
      {Array.from(messages.entries()).map(([id, message]) => (
        <div key={id} className="loading-message-item animate-bounce-in">
          <Loader2 className="loading-spinner-small" />
          <span>{message}</span>
        </div>
      ))}
    </div>
  );
};

export default LoadingIndicator;