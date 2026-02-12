"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showError, showLoading, showSuccess, dismissToast } from "@/utils/toast";
import { Loader2, Upload } from "lucide-react";

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

const LandingAboutPanel: React.FC = () => {
  const [row, setRow] = useState<LandingAboutRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [form, setForm] = useState<Omit<LandingAboutRow, "id">>({
    heading: "BIZ HAQIMIZDA",
    video_path: null,
    branches_label: "Filiallar",
    branches_value: "12",
    staff_label: "Xodimlar",
    staff_value: "600+",
    activity_label: "Faoliyat davri",
    activity_value: "12 yil",
    activity_subtitle: "since 2013",
    students_label: "O'quvchilar",
    students_value: "20,000+",
    graduates_label: "Bitiruvchilar",
    graduates_value: "200,000+",
  });

  const videoUrl = useMemo(() => {
    if (!form.video_path) return null;
    return supabase.storage.from("landing_videos").getPublicUrl(form.video_path).data.publicUrl;
  }, [form.video_path]);

  const fetchRow = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("landing_about")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      showError(error.message);
      setRow(null);
      setIsLoading(false);
      return;
    }

    if (!data) {
      setRow(null);
      setIsLoading(false);
      return;
    }

    const typed = data as LandingAboutRow;
    setRow(typed);
    setForm({
      heading: typed.heading,
      video_path: typed.video_path,
      branches_label: typed.branches_label,
      branches_value: typed.branches_value,
      staff_label: typed.staff_label,
      staff_value: typed.staff_value,
      activity_label: typed.activity_label,
      activity_value: typed.activity_value,
      activity_subtitle: typed.activity_subtitle,
      students_label: typed.students_label,
      students_value: typed.students_value,
      graduates_label: typed.graduates_label,
      graduates_value: typed.graduates_value,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRow();
  }, [fetchRow]);

  const setField = (key: keyof typeof form, value: string | null) => {
    setForm((p) => ({ ...p, [key]: value as any }));
  };

  const handleUploadVideo = async () => {
    if (!videoFile) {
      showError("Iltimos, video fayl tanlang.");
      return;
    }

    setIsUploadingVideo(true);
    const toastId = showLoading("Video yuklanmoqda...");

    const ext = videoFile.name.split(".").pop() || "mp4";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `about/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("landing_videos").upload(filePath, videoFile, {
      upsert: false,
      cacheControl: "3600",
      contentType: videoFile.type || "video/mp4",
    });

    if (uploadError) {
      dismissToast(toastId);
      setIsUploadingVideo(false);
      showError(uploadError.message);
      return;
    }

    // old video cleanup (best-effort)
    if (form.video_path) {
      await supabase.storage.from("landing_videos").remove([form.video_path]);
    }

    setField("video_path", filePath);
    setVideoFile(null);
    const input = document.getElementById("landing-about-video") as HTMLInputElement | null;
    if (input) input.value = "";

    dismissToast(toastId);
    setIsUploadingVideo(false);
    showSuccess("Video yuklandi. Endi 'Saqlash' ni bosing.");
  };

  const handleSave = async () => {
    if (!row) {
      showError("Ma'lumot topilmadi. Sahifani yangilab ko'ring.");
      return;
    }

    setIsSaving(true);
    const toastId = showLoading("Saqlanmoqda...");

    const { error } = await supabase
      .from("landing_about")
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    dismissToast(toastId);
    setIsSaving(false);

    if (error) {
      showError(error.message);
      return;
    }

    showSuccess("Saqlandi!");
    fetchRow();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Biz haqimizda (Landing)</CardTitle>
          <CardDescription>Yuklanmoqda...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!row) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Biz haqimizda (Landing)</CardTitle>
          <CardDescription>Jadvalda ma'lumot topilmadi.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Biz haqimizda (Landing)</CardTitle>
        <CardDescription>Video yuklang va statistika matn/sonlarini tahrir qiling.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">Bo'lim sarlavhasi</div>
            <Input value={form.heading} onChange={(e) => setField("heading", e.target.value)} />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">Video</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="landing-about-video"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                disabled={isUploadingVideo}
              />
              <Button onClick={handleUploadVideo} disabled={!videoFile || isUploadingVideo} className="sm:w-44">
                {isUploadingVideo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yuklanmoqda
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Yuklash
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              {videoUrl ? (
                <video key={videoUrl} className="w-full rounded-lg" controls playsInline preload="metadata">
                  <source src={videoUrl} />
                </video>
              ) : (
                <div className="text-sm text-gray-500">Video yuklanmagan</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-900">Filiallar</div>
            <Input value={form.branches_label} onChange={(e) => setField("branches_label", e.target.value)} />
            <Input value={form.branches_value} onChange={(e) => setField("branches_value", e.target.value)} />
          </div>

          <div className="rounded-xl border border-gray-100 p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-900">Xodimlar</div>
            <Input value={form.staff_label} onChange={(e) => setField("staff_label", e.target.value)} />
            <Input value={form.staff_value} onChange={(e) => setField("staff_value", e.target.value)} />
          </div>

          <div className="rounded-xl border border-gray-100 p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-900">Faoliyat</div>
            <Input value={form.activity_label} onChange={(e) => setField("activity_label", e.target.value)} />
            <Input value={form.activity_value} onChange={(e) => setField("activity_value", e.target.value)} />
            <Input
              value={form.activity_subtitle ?? ""}
              onChange={(e) => setField("activity_subtitle", e.target.value || null)}
              placeholder="Masalan: since 2013"
            />
          </div>

          <div className="rounded-xl border border-gray-100 p-4 space-y-3 lg:col-span-2">
            <div className="text-sm font-semibold text-gray-900">O'quvchilar</div>
            <Input value={form.students_label} onChange={(e) => setField("students_label", e.target.value)} />
            <Input value={form.students_value} onChange={(e) => setField("students_value", e.target.value)} />
          </div>

          <div className="rounded-xl border border-gray-100 p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-900">Bitiruvchilar</div>
            <Input value={form.graduates_label} onChange={(e) => setField("graduates_label", e.target.value)} />
            <Input value={form.graduates_value} onChange={(e) => setField("graduates_value", e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Saqlash
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LandingAboutPanel;