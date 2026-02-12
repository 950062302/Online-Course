"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import './CustomButton.css'; // Import custom CSS

interface CustomDeleteButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const CustomDeleteButton: React.FC<CustomDeleteButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="custom-delete-button"
    >
      <span className="custom-button-svg-icon">
        <Trash2 className="h-5 w-5" />
      </span>
    </button>
  );
};

export default CustomDeleteButton;