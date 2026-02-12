"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { useSession } from "@/components/auth/SessionContextProvider";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { isToday, isYesterday, format } from 'date-fns';

const DailyCheckinCard: React.FC = () => {
  const { user, profile, isLoading: isSessionLoading, refreshProfile } = useSession();
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const checkCheckinStatus = useCallback(() => {
    if (profile?.last_checkin_date) {
      const lastCheckin = new Date(profile.last_checkin_date);
      setHasCheckedInToday(isToday(lastCheckin));
    } else {
      setHasCheckedInToday(false);
    }
  }, [profile?.last_checkin_date]);

  useEffect(() => {
    if (!isSessionLoading && profile) {
      checkCheckinStatus();
    }
  }, [isSessionLoading, profile, checkCheckinStatus]);

  const handleCheckin = async () => {
    if (!user || !profile || isCheckingIn) return;

    setIsCheckingIn(true);
    const toastId = showLoading("Kunlik kirish belgilanmoqda...");

    try {
      let newStreak = profile.streak || 0;
      let newXp = profile.xp || 0;
      let newLevel = profile.level || 0;
      const checkinDate = new Date();

      if (profile.last_checkin_date) {
        const lastCheckin = new Date(profile.last_checkin_date);
        if (isToday(lastCheckin)) {
          showError("Siz bugun allaqachon kirishni belgilagansiz!");
          dismissToast(toastId);
          setIsCheckingIn(false);
          return;
        } else if (isYesterday(lastCheckin)) {
          newStreak += 1;
          showSuccess(`Ajoyib! Sizning streakingiz ${newStreak} kunga yetdi!`);
        } else {
          newStreak = 1;
          showSuccess("Kunlik kirish belgilandi! Yangi streak boshlandi.");
        }
      } else {
        newStreak = 1;
        showSuccess("Kunlik kirish belgilandi! Yangi streak boshlandi.");
      }

      newXp += 10;
      if (newXp >= (newLevel + 1) * 100) {
        newLevel += 1;
        newXp = newXp % 100;
        showSuccess(`Tabriklaymiz! Siz ${newLevel}-levelga ko'tarildingiz!`);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          last_checkin_date: checkinDate.toISOString(),
          streak: newStreak,
          xp: newXp,
          level: newLevel,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setHasCheckedInToday(true);
      await refreshProfile();
    } catch (error: any) {
      console.error("Kunlik kirishni belgilashda xato:", error);
      showError(`Kirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsCheckingIn(false);
    }
  };

  return (
    <Card className="glass-card p-4 sm:p-5">
      <div className="flex justify-between items-start">
        <CardTitle className="text-primary font-semibold text-sm sm:text-base">
          Kunlik Kirish
        </CardTitle>
      </div>
      <CardContent className="space-y-3 p-0 mt-3">
        {hasCheckedInToday ? (
          <div className="text-center">
            <p className="font-semibold text-gray-800 text-sm sm:text-base">
              Bugun kirish tasdiqlandi ✔
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Oxirgi kirish:{" "}
              <span className="font-medium">
                {profile?.last_checkin_date
                  ? format(new Date(profile.last_checkin_date), 'dd.MM.yyyy')
                  : "Yo'q"}
              </span>
            </p>
          </div>
        ) : (
          <Button
            onClick={handleCheckin}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
            disabled={isCheckingIn || isSessionLoading}
          >
            {isCheckingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Belgilanmoqda...
              </>
            ) : (
              "Bugun kirishni belgilash"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyCheckinCard;