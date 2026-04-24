"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, BookOpen, DollarSign, Mail, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
  description: string;
  trend?: string;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.max(0, Math.floor(n || 0)));
}

function StatCard({ title, value, icon, tone, description, trend }: StatCardProps) {
  return (
    <Card className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-5 pb-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <CardTitle className="mt-2 text-3xl font-black text-gray-950">{value}</CardTitle>
        </div>
        <div className={`rounded-2xl p-3 ${tone}`}>{icon}</div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p className="text-sm text-gray-600">{description}</p>
        {trend ? <p className="mt-3 text-sm font-medium text-emerald-600">{trend}</p> : null}
      </CardContent>
    </Card>
  );
}

type Stats = {
  totalRevenueUzs: number;
  totalUsers: number;
  activeCourses: number;
  pendingApplications: number;
};

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
      const totalRevenueUzs = 0;

      setStats({ totalRevenueUzs, totalUsers, activeCourses, pendingApplications });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const revenueText = useMemo(() => formatNumber(stats.totalRevenueUzs), [stats.totalRevenueUzs]);

  return (
    <div id="stats-summary" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Jami daromad"
        value={`${revenueText} UZS`}
        icon={<DollarSign className="h-6 w-6 text-primary" />}
        tone="bg-cyan-50"
        description="Platforma bo‘yicha umumiy tushum"
        trend="+0.0% o‘tgan oyga nisbatan"
      />
      <StatCard
        title="Foydalanuvchilar"
        value={formatNumber(stats.totalUsers)}
        icon={<Users className="h-6 w-6 text-emerald-600" />}
        tone="bg-emerald-50"
        description="Ro‘yxatdan o‘tgan foydalanuvchilar soni"
        trend="-0.0% o‘tgan oyga nisbatan"
      />
      <StatCard
        title="Kurslar"
        value={formatNumber(stats.activeCourses)}
        icon={<BookOpen className="h-6 w-6 text-amber-600" />}
        tone="bg-amber-50"
        description="Faol kurslar soni"
      />
      <StatCard
        title="Kutilayotgan arizalar"
        value={formatNumber(stats.pendingApplications)}
        icon={<Mail className="h-6 w-6 text-rose-600" />}
        tone="bg-rose-50"
        description="Ko‘rib chiqilishi kerak bo‘lgan so‘rovlar"
      />
    </div>
  );
};

export default StatsSummaryPanel;