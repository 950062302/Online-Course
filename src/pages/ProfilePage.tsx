"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { DollarSign, Clock, Award, TrendingUp, BellRing, BellOff, Loader2, UserRound } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatTime } from '@/utils/formatters';
import { Switch } from "@/components/ui/switch";
import { usePushNotifications } from '@/hooks/usePushNotifications';

const ProfilePage: React.FC = () => {
  const { user, isLoading: isSessionLoading, profile, refreshProfile } = useSession();
  const [topUpAmount, setTopUpAmount] = useState<number | ''>(50000);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const { isPushEnabled, isLoading: isPushLoading, togglePushNotifications } = usePushNotifications(user?.id);

  useEffect(() => {
    if (profile?.username) setNewUsername(profile.username);
  }, [profile]);

  const handleUpdateUsername = async () => {
    if (!user || !newUsername.trim()) return;
    if (newUsername === profile?.username) {
      showSuccess("O'zgarishlar yo'q.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);

      if (error) throw error;

      showSuccess("Foydalanuvchi nomi yangilandi!");
      refreshProfile();
    } catch (error: any) {
      console.error("Error updating username:", error);
      showError("Xatolik: " + error.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleTopUp = async () => {
    if (!user || !profile) {
      showError("Balansni to'ldirish uchun avval tizimga kiring.");
      return;
    }
    if (typeof topUpAmount !== 'number' || topUpAmount <= 0) {
      showError("Iltimos, to'g'ri miqdorni kiriting.");
      return;
    }

    setIsToppingUp(true);
    const toastId = showLoading("Balans to'ldirilmoqda...");

    try {
      const newBalance = (profile.balance || 0) + topUpAmount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      showSuccess(`Balans ${topUpAmount.toLocaleString()} UZS ga to'ldirildi!`);
      await refreshProfile();
      setTopUpAmount(50000);
    } catch (error: any) {
      console.error("Balansni to'ldirishda xato:", error);
      showError(`Balansni to'ldirishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsToppingUp(false);
    }
  };

  if (isSessionLoading || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm bg-white p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(26,255,255,0.10)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary p-3 text-white shadow-md shadow-cyan-200">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">Profil sozlamalari</h1>
            <p className="text-gray-600">Shaxsiy ma'lumotlar, balans va bildirishnomalarni boshqaring.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg border-cyan-100 rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Shaxsiy profil</CardTitle>
            <CardDescription className="text-gray-600">Bu yerda siz o'z profilingiz ma'lumotlarini boshqarishingiz mumkin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Foydalanuvchi nomi</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input id="username" type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Foydalanuvchi nomi" className="rounded-xl" />
                <Button onClick={handleUpdateUsername} disabled={isUpdatingProfile} className="rounded-xl bg-primary text-white">
                  {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Saqlash"}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || "Noma'lum"} readOnly className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="balance">Balans</Label>
              <Input id="balance" type="text" value={`${profile.balance.toLocaleString()} UZS`} readOnly className="rounded-xl font-bold text-green-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time-spent">Umumiy sarflangan vaqt</Label>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <Input id="time-spent" type="text" value={formatTime(profile.total_time_spent_seconds || 0)} readOnly className="rounded-xl font-medium text-gray-700" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="streak">Streak</Label>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-gray-500" />
                <Input id="streak" type="text" value={`${profile.streak} kun`} readOnly className="rounded-xl font-medium text-gray-700" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="xp">Tajriba ballari (XP)</Label>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-gray-500" />
                <Input id="xp" type="text" value={`${profile.xp} XP`} readOnly className="rounded-xl font-medium text-gray-700" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="level">Daraja (Level)</Label>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-gray-500" />
                <Input id="level" type="text" value={`${profile.level}-level`} readOnly className="rounded-xl font-medium text-gray-700" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Foydalanuvchi ID: {profile.id}</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg border-cyan-100 rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                {isPushEnabled ? <BellRing className="w-6 h-6 mr-2 text-blue-500" /> : <BellOff className="w-6 h-6 mr-2 text-gray-500" />}
                Push Bildirishnomalar
              </CardTitle>
              <CardDescription>Muhim yangiliklar va eslatmalarni brauzeringizda qabul qiling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="push-notifications-switch" className="text-gray-700">Bildirishnomalarni yoqish/o'chirish</Label>
                <Switch id="push-notifications-switch" checked={isPushEnabled} onCheckedChange={togglePushNotifications} disabled={isPushLoading} />
              </div>
              {isPushLoading && <div className="flex items-center text-sm text-gray-600"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Holat yuklanmoqda...</div>}
              {!isPushLoading && !isPushEnabled && <p className="text-sm text-gray-500">Bildirishnomalarni yoqish uchun tugmani bosing.</p>}
              {!isPushLoading && isPushEnabled && <p className="text-sm text-green-600">Push bildirishnomalari yoqilgan.</p>}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-cyan-100 rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-green-500" />
                Balansni To'ldirish
              </CardTitle>
              <CardDescription>Balansingizni tez va oson to'ldiring.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full">
                <Label htmlFor="topUpAmount" className="block text-sm font-medium text-gray-700 mb-1">Miqdorni kiriting (UZS)</Label>
                <Input type="number" id="topUpAmount" value={topUpAmount} onChange={(e) => setTopUpAmount(parseFloat(e.target.value) || '')} min={1000} className="rounded-xl" />
              </div>
              <Button onClick={handleTopUp} disabled={isToppingUp} className="w-full rounded-xl bg-primary text-white">
                {isToppingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Balansni To'ldirish"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;