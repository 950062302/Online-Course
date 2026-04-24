"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { formatDistanceToNowStrict, isWithinInterval, subMinutes } from 'date-fns';
import { CircleDot, CircleOff, BookOpen, Wallet } from 'lucide-react';
import UserPurchasedCoursesDialog from './UserPurchasedCoursesDialog';
import UserBalanceDialog from './UserBalanceDialog';
import UserDeleteDialog from './UserDeleteDialog';
import CustomEditButton from '@/components/ui/CustomEditButton';
import CustomDeleteButton from '@/components/ui/CustomDeleteButton';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  total_time_spent_seconds: number;
  last_seen_at: string | null;
  role: string;
  balance: number;
  total_spent: number;
  purchased_courses_count: number;
}

const UsersPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [selectedUserBalance, setSelectedUserBalance] = useState<number>(0);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [isUserDeleteDialogOpen, setIsUserDeleteDialogOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new Error("Foydalanuvchi sessiyasi topilmadi.");

      const { data, error } = await supabase.functions.invoke('list-users', {
        headers: { 'Authorization': `Bearer ${sessionData.session.access_token}` },
      });

      if (error) throw error;
      setUsers(data as UserProfile[]);
    } catch (error: any) {
      console.error("Foydalanuvchilarni yuklashda xato:", error);
      showError(`Foydalanuvchilarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    let formatted = '';
    if (hours > 0) formatted += `${hours} soat `;
    if (minutes > 0) formatted += `${minutes} daqiqa `;
    if (seconds > 0 || formatted === '') formatted += `${seconds} soniya`;
    return formatted.trim();
  };

  const isOnline = (lastSeenAt: string | null) => {
    if (!lastSeenAt) return false;
    const lastSeenDate = new Date(lastSeenAt);
    return isWithinInterval(lastSeenDate, { start: subMinutes(new Date(), 1), end: new Date() });
  };

  const handleUserRowClick = (userId: string, username: string) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setIsCoursesDialogOpen(true);
  };

  const handleManageBalanceClick = (e: React.MouseEvent<HTMLButtonElement>, user: UserProfile) => {
    e.stopPropagation();
    setSelectedUserId(user.id);
    setSelectedUsername(user.username || user.email.split('@')[0]);
    setSelectedUserBalance(user.balance);
    setIsBalanceDialogOpen(true);
  };

  const handleDeleteUserClick = (e: React.MouseEvent<HTMLButtonElement>, user: UserProfile) => {
    e.stopPropagation();
    setSelectedUserId(user.id);
    setSelectedUsername(user.username || user.email.split('@')[0]);
    setIsUserDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-950">Foydalanuvchilar</CardTitle>
          <CardDescription className="text-gray-600">Foydalanuvchi ma'lumotlari yuklanmoqda...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Foydalanuvchilar yuklanmoqda...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-950">Faol foydalanuvchilar ro'yxati</CardTitle>
        <CardDescription className="text-gray-600">Platformadagi foydalanuvchilar haqidagi ma'lumotlar.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-gray-700">Ism / Email</TableHead>
                <TableHead className="text-gray-700">Vaqt</TableHead>
                <TableHead className="text-gray-700">Balans</TableHead>
                <TableHead className="text-gray-700">Sarflangan</TableHead>
                <TableHead className="text-gray-700">Kurslar</TableHead>
                <TableHead className="text-gray-700">Holat</TableHead>
                <TableHead className="text-gray-700">Ro'yxatdan o'tgan</TableHead>
                <TableHead className="text-right text-gray-700">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-gray-500">Hozircha foydalanuvchilar mavjud emas.</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-cyan-50/50 transition duration-150">
                    <TableCell className="cursor-pointer font-medium text-gray-900" onClick={() => handleUserRowClick(user.id, user.username || user.email.split('@')[0])}>
                      <p>{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </TableCell>
                    <TableCell className="font-bold text-primary">{formatTime(user.total_time_spent_seconds)}</TableCell>
                    <TableCell className="font-bold text-emerald-600">{user.balance.toLocaleString()} UZS</TableCell>
                    <TableCell className="font-bold text-gray-900">{user.total_spent.toLocaleString()} UZS</TableCell>
                    <TableCell className="cursor-pointer font-bold text-blue-600" onClick={() => handleUserRowClick(user.id, user.username || user.email.split('@')[0])}>
                      {user.purchased_courses_count} ta
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isOnline(user.last_seen_at) ? (
                          <>
                            <CircleDot className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                            <span className="text-emerald-600">Onlayn</span>
                          </>
                        ) : (
                          <>
                            <CircleOff className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">{user.last_seen_at ? `${formatDistanceToNowStrict(new Date(user.last_seen_at), { addSuffix: true })} oflayn` : 'Noma\'lum'}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Noma\'lum'}</TableCell>
                    <TableCell className="flex items-center justify-end gap-2 text-right">
                      <CustomEditButton onClick={(e) => handleManageBalanceClick(e, user)} icon={<Wallet className="h-4 w-4" />} />
                      <CustomDeleteButton onClick={(e) => handleDeleteUserClick(e, user)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-gray-500">Jami foydalanuvchilar: {users.length}</span>
        </div>
      </CardContent>

      <UserPurchasedCoursesDialog isOpen={isCoursesDialogOpen} onClose={() => setIsCoursesDialogOpen(false)} userId={selectedUserId} username={selectedUsername} />
      <UserBalanceDialog isOpen={isBalanceDialogOpen} onClose={() => setIsBalanceDialogOpen(false)} userId={selectedUserId} username={selectedUsername} currentBalance={selectedUserBalance} onBalanceUpdated={fetchUsers} />
      <UserDeleteDialog isOpen={isUserDeleteDialogOpen} onClose={() => setIsUserDeleteDialogOpen(false)} userId={selectedUserId} username={selectedUsername} onUserDeleted={fetchUsers} />
    </Card>
  );
};

export default UsersPanel;