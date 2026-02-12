"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type LandingAboutRow = {
  id: string;
  heading: string;
  video_path: string | null;

  branches_label: string;
  branches_value: string;

  staff_label: string;
  staff_value: string;

  activity_label: string;
  activity_value: string;
  activity_subtitle: string | null;

  students_label: string;
  students_value: string;

  graduates_label: string;
  graduates_value: string;
};

function StatCard({
  label,
  value,
  subtitle,
  colSpanClass,
}: {
  label: string;
  value: string;
  subtitle?: string | null;
  colSpanClass?: string;
}) {
  return (
    <Card
      className={[
        "relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm",
        colSpanClass ?? "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-orange-100" />
      <div className="pointer-events-none absolute -bottom-8 -right-6 h-20 w-20 rotate-12 rounded-2xl bg-orange-50" />

      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}
    </Card>
  );
}

const AboutSection: React.FC = () => {
  const [data, setData] = useState<LandingAboutRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const { data: row, error } = await supabase
      .from("landing_about")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setData((row as LandingAboutRow) ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 bg-white content-layer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-10">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (!data) return null;

  const videoUrl = data.video_path
    ? supabase.storage.from("landing_videos").getPublicUrl(data.video_path).data.publicUrl
    : null;

  return (
    <section id="biz-haqimizda" className="py-12 sm:py-16 bg-white content-layer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
          {data.heading}
        </h2>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-sm">
            <AspectRatio ratio={16 / 9}>
              {videoUrl ? (
                <video
                  key={videoUrl}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                >
                  <source src={videoUrl} />
                </video>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                  Video yuklanmagan
                </div>
              )}
            </AspectRatio>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard
              label={data.branches_label}
              value={data.branches_value}
              colSpanClass="lg:col-span-2"
            />
            <StatCard
              label={data.staff_label}
              value={data.staff_value}
              colSpanClass="lg:col-span-2"
            />
            <StatCard
              label={data.activity_label}
              value={data.activity_value}
              subtitle={data.activity_subtitle}
              colSpanClass="lg:col-span-2"
            />
            <StatCard
              label={data.students_label}
              value={data.students_value}
              colSpanClass="lg:col-span-3"
            />
            <StatCard
              label={data.graduates_label}
              value={data.graduates_value}
              colSpanClass="lg:col-span-3"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;