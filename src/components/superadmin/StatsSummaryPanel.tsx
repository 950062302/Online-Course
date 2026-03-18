"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, BookOpen, DollarSign, Mail, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  totalRevenueUzs: number;
  totalUsers: number;
  activeCourses: number;
  pendingApplications: number;
};

function formatNumber(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.max(0, Math.floor(n || 0)));
}

const StatsSummaryPanel: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalRevenueUzs: 0,
    totalUsers: 0,
    activeCourses: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [usersRes, coursesRes, appsRes] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("courses").select("id"),
        supabase.from("applications").select("id,status"),
      ]);

      if (cancelled) return;

      const totalUsers = (usersRes.data as any[])?.length ?? 0;
      const activeCourses = (coursesRes.data as any[])?.length ?? 0;
      const pendingApplications = ((appsRes.data as any[]) ?? []).filter((a) => a?.status === "pending").length;

      // PocketBase adapter currently doesn't support a payments table aggregation.
      // Keep revenue as 0 until a dedicated collection is added.
      const totalRevenueUzs = 0;

      setStats({ totalRevenueUzs, totalUsers, activeCourses, pendingApplications });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const revenueText = useMemo(() => `${formatNumber(stats.totalRevenueUzs)} `, [stats.totalRevenueUzs]);

  return (
    <div id="stats-summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Jami Daromad Kartochkasi */}
      <Card className="bg-gray-800 p-5 rounded-xl shadow-xl transition duration-300 hover:shadow-2xl border-l-4 border-ferrari-red text-white">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex justify-between items-center">
            Jami Daromad <DollarSign className="h-5 w-5 text-ferrari-red" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-3xl font-bold text-white mt-2">
            {revenueText}
            <span className="text-lg font-medium text-gray-300">UZS</span>
          </p>
          <p className="text-sm text-green-500 mt-1 flex items-center">
            <ArrowUp className="w-4 h-4 mr-1" />
            +0.0% (o'tgan oyga nisbatan)
          </p>
        </CardContent>
      </Card>

      {/* Yangi Foydalanuvchilar Kartochkasi */}
      <Card className="bg-gray-800 p-5 rounded-xl shadow-xl transition duration-300 hover:shadow-2xl border-l-4 border-emerald-500 text-white">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex justify-between items-center">
            Foydalanuvchilar <Users className="h-5 w-5 text-emerald-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-3xl font-bold text-white mt-2">{formatNumber(stats.totalUsers)}</p>
          <p className="text-sm text-primary mt-1 flex items-center">
            <ArrowDown className="w-4 h-4 mr-1" />
            -0.0% (o'tgan oyga nisbatan)
          </p>
        </CardContent>
      </Card>

      {/* Faol Kurslar Kartochkasi */}
      <Card className="bg-gray-800 p-5 rounded-xl shadow-xl transition duration-300 hover:shadow-2xl border-l-4 border-amber-500 text-white">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex justify-between items-center">
            Kurslar <BookOpen className="h-5 w-5 text-amber-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-3xl font-bold text-white mt-2">{formatNumber(stats.activeCourses)}</p>
          <p className="text-sm text-gray-300 mt-1">Jami kurslar soni</p>
        </CardContent>
      </Card>

      {/* Kutilayotgan Arizalar Kartochkasi */}
      <Card className="bg-gray-800 p-5 rounded-xl shadow-xl transition duration-300 hover:shadow-2xl border-l-4 border-rose-500 text-white">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex justify-between items-center">
            Kutilayotgan Arizalar <Mail className="h-5 w-5 text-rose-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-3xl font-bold text-white mt-2">{formatNumber(stats.pendingApplications)}</p>
          <p className="text-sm text-gray-300 mt-1">Hozirda ko'rib chiqilmoqda</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummaryPanel;
