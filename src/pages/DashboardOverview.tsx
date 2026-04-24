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
import { BookOpen, MessageCircle, History, Sparkles, ArrowRight } from "lucide-react";

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
    if (user) fetchCourseCounts();
  }, [user]);

  if (isSessionLoading || !session || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-lg text-gray-700">Yuklanmoqda...</p>
      </div>
    );
  }

  const displayName = profile.username || user?.email?.split("@")[0] || "Foydalanuvchi";
  const quickActions = [
    { label: "Faol kurslar", icon: BookOpen, href: "/dashboard/active-courses" },
    { label: "Barcha kurslar", icon: BookOpen, href: "/courses" },
    { label: "Tarix", icon: History, href: "/dashboard/history" },
    { label: "Chat", icon: MessageCircle, href: "/dashboard/chat" },
  ];

  return (
    <div className="ui-root">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-8 space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-white p-5 sm:p-8 shadow-[0_20px_60px_rgba(26,255,255,0.10)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm border border-cyan-100">
                <Sparkles className="h-4 w-4 text-primary" />
                EduDars.uz shaxsiy kabineti
              </div>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-gray-950">
                Salom, {displayName}!
              </h2>
              <p className="mt-3 max-w-2xl text-gray-600 text-base sm:text-lg">
                O‘qishni davom ettirish uchun tezkor kirishlar, statistikalar va profil boshqaruvi bir joyda.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md">
              <button onClick={() => navigate("/dashboard/active-courses")} className="rounded-2xl bg-primary px-4 py-3 text-left text-white shadow-md shadow-cyan-200 transition-transform hover:-translate-y-0.5">
                <span className="block text-sm opacity-90">Faol kurslar</span>
                <span className="mt-1 flex items-center gap-2 text-lg font-semibold"><ArrowRight className="h-4 w-4" /> Ochish</span>
              </button>
              <button onClick={() => navigate("/courses")} className="rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-left text-gray-900 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-cyan-50">
                <span className="block text-sm text-gray-500">Yangi kurslar</span>
                <span className="mt-1 text-lg font-semibold">Ko‘rish</span>
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item) => (
            <button key={item.href} type="button" onClick={() => navigate(item.href)} className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="rounded-2xl bg-cyan-50 p-3 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="font-semibold text-gray-800">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="w-full max-w-xl">
          <Input
            placeholder="Kurs, mavzu yoki bo'lim qidiring..."
            className="h-11 rounded-2xl bg-white border-cyan-100 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileInfoCard
                username={profile.username}
                email={user?.email || null}
                balance={profile.balance}
              />
              <TotalTimeSpentCard totalTimeSpentSeconds={profile.total_time_spent_seconds || 0} />
              <DailyCheckinCard />
              <UserStreakCard streak={profile.streak || 0} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <AchievementsCard level={profile.level || 0} xp={profile.xp || 0} />
              <CourseStatsCard purchasedCoursesCount={purchasedCoursesCount} />
            </div>
          </div>

          <div className="space-y-4">
            <ContactCards />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;