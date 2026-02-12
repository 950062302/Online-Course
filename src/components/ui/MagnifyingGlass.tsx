"use client";

import React from 'react';
import './MagnifyingGlass.css'; // Import custom CSS

interface MagnifyingGlassProps {
  imageSrc: string;
  mousePosition: { x: number; y: number } | null;
  imageRect: DOMRect | null;
  magnifierSize?: number;
  zoomLevel?: number;
}

const MagnifyingGlass: React.FC<MagnifyingGlassProps> = ({
  imageSrc,
  mousePosition,
  imageRect,
  magnifierSize = 200,
  zoomLevel = 2,
}) => {
  if (!mousePosition || !imageRect) return null;

  const magnifierStyle: React.CSSProperties = {
    position: 'fixed',
    left: mousePosition.x - magnifierSize / 2,
    top: mousePosition.y - magnifierSize / 2,
    width: magnifierSize,
    height: magnifierSize,
    borderRadius: '50%',
    border: '4px solid #FF2800', // Ferrari Red border
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 1000,
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    animation: 'magnifier-appear 0.3s ease-out forwards',
    background: `url(${imageSrc}) no-repeat`,
    backgroundSize: `${imageRect.width * zoomLevel}px ${imageRect.height * zoomLevel}px`,
    backgroundPosition: `${-((mousePosition.x - imageRect.left) * zoomLevel - magnifierSize / 2)}px ${-((mousePosition.y - imageRect.top) * zoomLevel - magnifierSize / 2)}px`,
  };

  return <div style={magnifierStyle} />;
};

export default MagnifyingGlass;