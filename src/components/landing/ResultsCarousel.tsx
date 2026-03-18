"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ScrollFloat from '@/components/ScrollFloat';
import { Link } from 'react-router-dom';
import MagnifyingGlass from '@/components/ui/MagnifyingGlass';
import './ResultsCarousel.css'; // Import custom CSS

interface ResultImage {
  id: string;
  image_url: string;
}

const ResultsCarousel: React.FC = () => {
  const [images, setImages] = useState<ResultImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredImageSrc, setHoveredImageSrc] = useState<string | null>(null);
  const [hoveredImageRect, setHoveredImageRect] = useState<DOMRect | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('results_images')
      .select('id, image_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Natija rasmlarini yuklashda xato:", error);
      showError("Natija rasmlarini yuklashda xato yuz berdi.");
      setImages([]);
    } else {
      setImages(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, imageUrl: string) => {
    setHoveredImageRect(e.currentTarget.getBoundingClientRect());
    setHoveredImageSrc(imageUrl);
    setShowMagnifier(true);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    setHoveredImageRect(e.currentTarget.getBoundingClientRect());
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
    setMousePosition(null);
    setHoveredImageSrc(null);
    setHoveredImageRect(null);
  };

  if (isLoading) {
    return (
      <div className="results-carousel-wrapper">
        <section id="natijalar" className="py-16 sm:py-24 bg-white content-layer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollFloat tag="h2" containerClassName="text-base text-primary font-semibold tracking-wide uppercase">Bizning natijalarimiz</ScrollFloat>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              O‘quvchilarimiz doimiy ravishda yuqori natijalarga erishib, o‘z yutuqlarini namoyish qilishadi.
            </p>
            <div className="mt-10 flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="results-carousel-wrapper">
      <section id="natijalar" className="py-16 sm:py-24 bg-white content-layer">
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollFloat tag="h2" containerClassName="text-base text-primary font-semibold tracking-wide uppercase">Bizning natijalarimiz!</ScrollFloat>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              O‘quvchilarimiz doimiy ravishda yuqori natijalarga erishib, o‘z yutuqlarini namoyish qilishadi.
            </p>

            <div className="mt-10 carousel-container">
              <div className="carousel-track">
                {images.map((image) => (
                  <div key={image.id} className="carousel-slide">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                      <CardContent
                        className="flex items-center justify-center p-0 relative"
                        onMouseEnter={(e) => handleMouseEnter(e, image.image_url)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      >
                        <img
                          src={image.image_url}
                          alt="Natija rasmi"
                          className="max-w-full max-h-full rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                ))}
                {/* Karuselning uzluksiz aylanishi uchun rasmlarni takrorlash */}
                {images.map((image) => (
                  <div key={`${image.id}-duplicate`} className="carousel-slide">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                      <CardContent
                        className="flex items-center justify-center p-0 relative"
                        onMouseEnter={(e) => handleMouseEnter(e, image.image_url)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      >
                        <img
                          src={image.image_url}
                          alt="Natija rasmi"
                          className="max-w-full max-h-full rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link to="/courses" className="my_button css-1pubwu8">
                <span className="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.684 2.184a.283.283 0 01.531 0l.914 2.468c.028.078.09.14.167.168l2.468.913a.283.283 0 010 .531l-2.468.914a.283.283 0 00-.167.167l-.914 2.468a.283.283 0 01-.531 0l-.913-2.468a.283.283 0 00-.168-.167l-2.468-.914a.283.283 0 010-.53l2.468-.914a.283.283 0 00.168-.168l.913-2.468zM9.306 6.71a.554.554 0 011.04 0l1.787 4.83a.555.555 0 00.328.327l4.83 1.787a.554.554 0 010 1.04l-4.83 1.787a.554.554 0 00-.328.327l-1.787 4.83a.554.554 0 01-1.04 0l-1.787-4.83a.554.554 0 00-.327-.327l-4.83-1.787a.554.554 0 010-1.04l4.83-1.787a.555.555 0 00.327-.328l1.787-4.83z" fill="#fff"></path>
                  </svg>
                </span>
                Kurslarni ko‘rish
              </Link>
            </div>
          </div>
        </>
      </section>
      {showMagnifier && hoveredImageSrc && (
        <MagnifyingGlass
          imageSrc={hoveredImageSrc}
          mousePosition={mousePosition}
          imageRect={hoveredImageRect}
        />
      )}
    </div>
  );
};

export default ResultsCarousel;