"use client";

import React from 'react';
import { Card, CardTitle } from "@/components/ui/card";

interface AchievementsCardProps {
  level: number;
  xp: number;
}

const AchievementsCard: React.FC<AchievementsCardProps> = ({ level, xp }) => {
  return (
    <Card className="glass-card p-4 sm:p-6">
      <CardTitle className="text-primary font-semibold text-sm sm:text-base">
        Sizning Yutuqlaringiz
      </CardTitle>
      <div className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4">
        <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {level}
        </div>
        <div className="flex-1">
          <div className="w-full bg-red-100 rounded-full h-2.5 sm:h-3">
            <div
              className="bg-primary h-2.5 sm:h-3 rounded-full"
              style={{ width: `${xp % 100}%` }}
            ></div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Keyingi levelgacha:{" "}
            <span className="font-medium text-primary">
              {100 - (xp % 100)} XP
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default AchievementsCard;