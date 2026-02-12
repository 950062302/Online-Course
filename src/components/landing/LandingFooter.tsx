"use client";

import React from 'react';

const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <span>&copy; 2013-2025 Barcha huquqlar himoyalangan</span>
          <a href="#" className="hover:text-gray-700">Ommaviy offerta</a>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;