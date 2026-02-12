"use client";

import React from 'react';
import { Card, CardTitle } from "@/components/ui/card";

interface UserStreakCardProps {
  streak: number;
}

const UserStreakCard: React.FC<UserStreakCardProps> = ({ streak }) => {
  return (
    <Card className="glass-card p-4 sm:p-6">
      <CardTitle className="text-primary font-semibold text-sm sm:text-base">
        Sizning Streakingiz
      </CardTitle>
      <p className="text-3xl sm:text-4xl font-extrabold mt-3 text-gray-900">
        {streak || 0} kun
      </p>
      <p className="text-xs sm:text-sm text-gray-600 mt-2">
        Ketma-ket kirish kunlaringiz.
      </p>
    </Card>
  );
};

export default UserStreakCard;