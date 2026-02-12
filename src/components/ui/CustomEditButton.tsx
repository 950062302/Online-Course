"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import './CustomButton.css'; // Import custom CSS

interface CustomEditButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: React.ReactNode; // Optional custom icon
}

const CustomEditButton: React.FC<CustomEditButtonProps> = ({ onClick, disabled = false, icon }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="custom-edit-button"
    >
      <span className="custom-button-svg-icon">
        {icon || <Edit className="h-5 w-5" />}
      </span>
    </button>
  );
};

export default CustomEditButton;