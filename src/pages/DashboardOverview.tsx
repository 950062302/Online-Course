"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/components/auth/SessionContextProvider";
import { showError } from "@/utils/toast";
import ContactCards from "@/components/dashboard/ContactCards";
import DailyCheckinCard from "@/components/dashboard/DailyCheckinCard";
import ProfileInfoCard from "@/components/dashboard/ProfileInfoCard";
import TotalTimeSpentCard from "@/components/dashboard/TotalTimeSpentCard";
import AchievementsCard from "@/components/dashboard/AchievementsCard";
import CourseStatsCard from "@/components/dashboard/CourseStatsCard";
import UserStreakCard from "@/components/dashboard/UserStreakCard";
import { supabase } from '@/integrations/supabase/client';
import { Input } from "@/components/ui/input";
import { BookOpen, MessageCircle, History, User as UserIcon } from "lucide-react";

const DashboardOverview: React.FC = () => {
  const { session, isLoading: isSessionLoading, user, profile } = useSession();
  const navigate = useNavigate();
  const [purchasedCoursesCount, setPurchasedCoursesCount] = useState(0);

  useEffect(() => {
    if (!isSessionLoading && !session) {
      showError("Bu sahifaga kirish uchun avval tizimga kiring.");
      navigate("/login");
    }
  }, [session, isSessionLoading, navigate]);

  // Fetch purchased courses count
  useEffect(() => {
    const fetchCourseCounts = async () => {
      if (!user) return;
      const { count, error } = await supabase
        .from('user_courses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching purchased courses count:", error);
        setPurchasedCoursesCount(0);
      } else {
        setPurchasedCoursesCount(count || 0);
      }
    };
    if (user) {
      fetchCourseCounts();
    }
  }, [user]);

  if (isSessionLoading || !session || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-lg text-gray-700">Yuklanmoqda...</p>
      </div>
    );
  }

  const displayName = profile.username || user?.email?.split("@")[0] || "Foydalanuvchi";

  return (
    <div className="ui-root">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-8">
        {/* MOBILE HOME (only for < md) */}
        <div className="md:hidden space-y-4">
          {/* Top hero - red & white gradient */}
          <div className="rounded-2xl bg-gradient-to-br from-ferrari-red to-red-500 text-white p-4 shadow-md">
            <p className="text-[11px] font-semibold opacity-90">CEFR LC</p>
            <h2 className="mt-1 text-xl font-extrabold leading-snug">
              Salom, {displayName}!
            </h2>
            <p className="mt-1 text-[11px] opacity-90">
              CEFR darajangizni tez va qulay oshirib boring.
            </p>
            <p className="mt-2 text-xs font-medium">
              Sizning balansingiz:{" "}
              <span className="font-bold">
                {profile.balance.toLocaleString()} UZS
              </span>
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full">
            <Input
              placeholder="Kurs, mavzu yoki bo'lim qidiring..."
              className="h-9 text-xs bg-white border border-gray-200 rounded-xl shadow-sm"
            />
          </div>

          {/* Quick actions 4x4 style */}
          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/active-courses")}
              className="flex flex-col items-center justify-center bg-white border border-red-100 rounded-xl py-2 shadow-sm active:scale-[0.98] transition"
            >
              <BookOpen className="h-5 w-5 text-ferrari-red mb-1" />
              <span className="text-[10px] font-medium text-gray-800 text-center">
                Faol kurslar
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="flex flex-col items-center justify-center bg-white border border-red-100 rounded-xl py-2 shadow-sm active:scale-[0.98] transition"
            >
              <BookOpen className="h-5 w-5 text-ferrari-red mb-1" />
              <span className="text-[10px] font-medium text-gray-800 text-center">
                Barcha kurslar
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/history")}
              className="flex flex-col items-center justify-center bg-white border border-red-100 rounded-xl py-2 shadow-sm active:scale-[0.98] transition"
            >
              <History className="h-5 w-5 text-ferrari-red mb-1" />
              <span className="text-[10px] font-medium text-gray-800 text-center">
                Tarix
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/chat")}
              className="flex flex-col items-center justify-center bg-white border border-red-100 rounded-xl py-2 shadow-sm active:scale-[0.98] transition"
            >
              <MessageCircle className="h-5 w-5 text-ferrari-red mb-1" />
              <span className="text-[10px] font-medium text-gray-800 text-center">
                Chat
              </span>
            </button>
          </div>

          {/* Mobile compact cards below quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <ProfileInfoCard
              username={profile.username}
              email={user?.email || null}
              balance={profile.balance}
            />
            <TotalTimeSpentCard
              totalTimeSpentSeconds={profile.total_time_spent_seconds || 0}
            />
            <DailyCheckinCard />
            <UserStreakCard streak={profile.streak || 0} />
          </div>

          <div className="space-y-3">
            <AchievementsCard level={profile.level || 0} xp={profile.xp || 0} />
            <CourseStatsCard purchasedCoursesCount={purchasedCoursesCount} />
            <ContactCards />
          </div>
        </div>

        {/* DESKTOP/TABLET DASHBOARD (>= md) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profil ma'lumotlari kartasi */}
          <ProfileInfoCard
            username={profile.username}
            email={user?.email || null}
            balance={profile.balance}
          />

          {/* Umumiy sarflangan vaqt kartasi */}
          <TotalTimeSpentCard
            totalTimeSpentSeconds={profile.total_time_spent_seconds || 0}
          />

          {/* Daily Check-in kartasi */}
          <DailyCheckinCard />

          {/* Sizning Yutuqlaringiz kartasi */}
          <AchievementsCard
            level={profile.level || 0}
            xp={profile.xp || 0}
          />

          {/* Kurslar Statistikasi kartasi */}
          <CourseStatsCard
            purchasedCoursesCount={purchasedCoursesCount}
          />

          {/* Streak kartasi */}
          <UserStreakCard
            streak={profile.streak || 0}
          />

          {/* ContactCards komponenti */}
          <div className="col-span-full">
            <ContactCards />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;