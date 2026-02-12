"use client";

import React from 'react';

interface ProfileInfoCardProps {
  username: string | null;
  email: string | null;
  balance: number;
}

// This card is no longer needed, so we return null
const ProfileInfoCard: React.FC<ProfileInfoCardProps> = () => {
  return null;
};

export default ProfileInfoCard;