"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Info, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { useCountdown } from '@/hooks/useCountdown';
import { Badge } from "@/components/ui/badge";
import ReviewFormDialog from '../courses/ReviewFormDialog';

interface CourseCardProps {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
  category: string;
  level?: string;
  instructor?: string;
  progress?: number;
  lessonsCompleted?: number;
  totalLessons?: number;
  price: number;
  isPurchased?: boolean;
  purchasedAt?: string;
  durationDays?: number;
  partsCount?: number;
  lessonsCount?: number;
  averageRating?: number;
  reviewCount?: number;
  discountPercentage?: number;
  onPurchaseSuccess?: () => void;
  onReviewSubmitted?: () => void;
  hasUserReviewed?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  imageSrc,
  title,
  description,
  category,
  progress = 0,
  lessonsCompleted = 0,
  totalLessons = 0,
  price,
  isPurchased = false,
  purchasedAt,
  durationDays = 30,
  averageRating = 0,
  reviewCount = 0,
  discountPercentage = 0,
  onReviewSubmitted,
  hasUserReviewed = false,
}) => {
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { isExpired } = useCountdown(purchasedAt, durationDays);

  const expirationDateFormatted = purchasedAt && durationDays
    ? format(addDays(new Date(purchasedAt), durationDays), 'dd.MM.yyyy')
    : null;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const discountedPrice = discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

  return (
    <Card className="relative group overflow-hidden rounded-xl shadow-md sm:shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 text-sm">
      <CardHeader className="p-0">
        <div className="relative h-28 sm:h-40">
          <img
            src={imageSrc || "https://placehold.co/400x160/FF2800/FFFFFF?text=Kurs+Rasmi"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300" />
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
            <span className="text-[10px] sm:text-xs font-medium text-white px-2 sm:px-3 py-0.5 sm:py-1 bg-ferrari-red rounded-full">
              {category}
            </span>
          </div>
          {discountPercentage > 0 && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-yellow-400 text-gray-900 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
              -{discountPercentage}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 leading-tight line-clamp-2">
          {title}
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
          {description}
        </p>

        {/* Rating and Review Count */}
        <div className="flex items-center mt-1.5 sm:mt-2">
          <div className="flex items-center">
            {renderStars(Math.round(averageRating))}
            <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-semibold text-gray-700">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-500">
            ({reviewCount} izoh)
          </span>
        </div>

        {!isPurchased && (
          <div className="mt-1.5 sm:mt-2">
            {discountPercentage > 0 && (
              <p className="text-xs sm:text-sm text-gray-500 line-through">
                {price.toLocaleString()} UZS
              </p>
            )}
            <p className="text-2xl sm:text-3xl font-extrabold text-ferrari-red leading-tight">
              {discountedPrice.toLocaleString()} UZS
            </p>
          </div>
        )}

        {isPurchased && (
          <div className="space-y-1.5 sm:space-y-2 mt-1.5 sm:mt-2">
            <div className="flex justify-between items-center text-[11px] sm:text-sm text-gray-600">
              <span>
                Darslar:{" "}
                <span className="font-semibold">
                  {lessonsCompleted}/{totalLessons}
                </span>
              </span>
              <span>
                Progress:{" "}
                <span className="font-semibold">{progress}%</span>
              </span>
            </div>
            <Progress
              value={progress}
              className="h-1.5 sm:h-2 bg-gray-200 [&::-webkit-progress-bar]:bg-ferrari-red [&::-webkit-progress-value]:bg-ferrari-red"
            />
            {expirationDateFormatted && (
              <p className="text-[11px] sm:text-xs text-gray-500">
                Muddati: <span className="font-medium">{expirationDateFormatted}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 sm:p-4 border-t flex flex-col space-y-2 sm:space-y-3">
        {isPurchased ? (
          <>
            <div className="flex justify-between w-full items-center">
              <Badge className="bg-green-500 text-white text-[11px] sm:text-sm px-2.5 sm:px-3 py-0.5 rounded-full">
                Sotib olingan!
              </Badge>
              <div className="flex space-x-1.5 sm:space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 border-ferrari-red text-ferrari-red hover:bg-ferrari-red hover:text-white"
                  onClick={() => setIsDescriptionDialogOpen(true)}
                >
                  <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 sm:h-9 sm:w-9 ${
                    hasUserReviewed
                      ? 'border-gray-400 text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
                  }`}
                  onClick={() => !hasUserReviewed && setIsReviewDialogOpen(true)}
                  disabled={hasUserReviewed}
                >
                  <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
            <Button
              className="w-full py-2 text-sm sm:py-2.5 sm:text-base text-white font-semibold rounded-lg bg-ferrari-red hover:bg-red-700 transition duration-200"
              onClick={() => navigate(`/courses/${id}`)}
              disabled={isExpired}
            >
              {progress > 0 ? "Davom Ettirish" : "Boshlash"}
            </Button>
          </>
        ) : (
          <Button
            className="w-full py-2 text-sm sm:py-2.5 sm:text-base text-white font-semibold rounded-lg bg-ferrari-red hover:bg-red-700 transition duration-200"
            onClick={() => navigate(`/courses/${id}`)}
          >
            Kursni ko'rish
          </Button>
        )}
      </CardFooter>

      {/* Review dialog */}
      <ReviewFormDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        courseId={id}
        courseTitle={title}
        onReviewSubmitted={() => {
          onReviewSubmitted?.();
        }}
      />

      {/* Description dialog */}
      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-ferrari-red text-base sm:text-lg">
              {title} haqida
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Kursning to'liq tavsifi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 sm:py-4">
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CourseCard;