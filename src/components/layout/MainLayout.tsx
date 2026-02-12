"use client";

import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useNavigate } from "react-router-dom";
import { showError } from "@/utils/toast";
import { useTimeTracker } from '@/hooks/useTimeTracker';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { session, isLoading, user, profile } = useSession();
  const navigate = useNavigate();

  useTimeTracker(user?.id);

  React.useEffect(() => {
    if (!isLoading) {
      if (!session) {
        console.log("[MainLayout] No session found, redirecting to /login.");
        showError("Bu sahifaga kirish uchun avval tizimga kiring.");
        navigate("/login");
      } else if (!profile) {
        console.error("[MainLayout] User logged in but profile data missing. Session exists, but profile is null. Redirecting to /login.");
        showError("Profil ma'lumotlaringiz yuklanmadi. Iltimos, qayta kiring.");
        navigate("/login");
      }
    }
  }, [session, isLoading, navigate, profile]);

  if (isLoading || !session || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="antialiased relative min-h-screen">
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] content-layer">
        <Sidebar />
        <div className="flex flex-col bg-gray-100">
          <Header />
          {/* bottom nav height uchun pastdan joy qoldiramiz (faqat mobil) */}
          <main className="flex flex-1 flex-col gap-4 p-4 pb-16 sm:pb-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      {/* Mobil uchun pastki navigatsiya */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;