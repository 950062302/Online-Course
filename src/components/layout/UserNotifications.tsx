"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MailOpen, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import { showError } from '@/utils/toast';
import { formatDistanceToNow } from 'date-fns';
import './UserNotifications.css';

interface Notification {
  id: string;
  created_at: string;
  message: string;
  is_read: boolean;
  user_id: string | null;
  sent_by: string | null;
  profiles?: { username: string | null } | null;
  recipient_profile?: { username: string | null } | null;
}

const notificationSound = new Audio('/sounds/notification.mp3');

const UserNotifications: React.FC = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const lastNotificationIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoadingNotifications(false);
      return;
    }

    setIsLoadingNotifications(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles!fk_notifications_sent_by(username),
          recipient_profile:profiles!fk_notifications_user_id(username)
        `)
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const fetchedNotifications: Notification[] = data || [];
      const currentUnreadNotifications = fetchedNotifications.filter(n => !n.is_read);
      setNotifications(fetchedNotifications);
      setUnreadCount(currentUnreadNotifications.length);

      if (fetchedNotifications.length > 0 && lastNotificationIdRef.current !== fetchedNotifications[0].id) {
        if (currentUnreadNotifications.length > 0) {
          notificationSound.play().catch(e => console.error("Ovozni ijro etishda xato:", e));
        }
        lastNotificationIdRef.current = fetchedNotifications[0].id;
      }

    } catch (error: any) {
      console.error("Bildirishnomalarni yuklashda xato:", error);
      showError(`Bildirishnomalarni yuklashda xato: ${error.message || "Noma'lum xato"}`);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isSessionLoading, user, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }
      fetchNotifications();
    } catch (error: any) {
      console.error("Bildirishnomani o'qilgan deb belgilashda xato:", error);
      showError(`Bildirishnomani o'qilgan deb belgilashda xato: ${error.message || "Noma'lum xato"}`);
    }
  }, [user, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw error;
      }
      fetchNotifications();
    } catch (error: any) {
      console.error("Barcha bildirishnomalarni o'qilgan deb belgilashda xato:", error);
      showError(`Barcha bildirishnomalarni o'qilgan deb belgilashda xato: ${error.message || "Noma'lum xato"}`);
    }
  }, [user, unreadCount, fetchNotifications]);

  if (isSessionLoading || !user) {
    return null;
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full border border-gray-200 bg-white hover:bg-gray-100"
        >
          <svg className="w-5 h-5 text-primary" viewBox="0 0 448 512">
            <path
              d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"
            ></path>
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 sm:w-80 max-w-[90vw]"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal flex justify-between items-center">
          <span className="text-base sm:text-lg font-semibold text-gray-900">
            Bildirishnomalar
          </span>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={markAllAsRead}
              className="text-primary hover:text-primary-dark text-xs sm:text-sm"
            >
              Hammasini o'qilgan deb belgilash
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[260px] sm:h-[300px]">
          {isLoadingNotifications ? (
            <div className="flex flex-col items-center justify-center h-full py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="mt-2 text-sm text-gray-600">Yuklanmoqda...</span>
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Hozircha bildirishnomalar yo'q.
            </p>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.is_read
                    ? "bg-[rgba(26,255,255,0.10)] hover:bg-[rgba(26,255,255,0.18)]"
                    : "hover:bg-gray-50"
                }`}
                onClick={() =>
                  !notification.is_read && markAsRead(notification.id)
                }
              >
                <div className="flex justify-between w-full">
                  <p
                    className={`text-sm font-medium ${
                      !notification.is_read ? "text-primary" : "text-gray-800"
                    }`}
                  >
                    {notification.message}
                  </p>
                  {!notification.is_read && (
                    <MailOpen className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: {
                      formatDistance: (token, count) => {
                        if (token === "xSeconds") return `${count} soniya oldin`;
                        if (token === "xMinutes") return `${count} daqiqa oldin`;
                        if (token === "xHours") return `${count} soat oldin`;
                        if (token === "xDays") return `${count} kun oldin`;
                        if (token === "xMonths") return `${count} oy oldin`;
                        if (token === "xYears") return `${count} yil oldin`;
                        return `${count} ${token} oldin`;
                      },
                    },
                  })}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNotifications;