"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

// VAPID keysni .env faylidan olish kerak
// VITE_VAPID_PUBLIC_KEY = "YOUR_VAPID_PUBLIC_KEY_HERE"
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushNotifications = (userId: string | undefined | null) => {
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn("Service Workers bu brauzerda qo'llab-quvvatlanmaydi.");
      return null;
    }
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker ro\'yxatdan o\'tkazildi:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker ro\'yxatdan o\'tkazishda xato:', error);
      showError("Bildirishnomalar uchun service worker ro'yxatdan o'tkazilmadi.");
      return null;
    }
  }, []);

  const subscribeUser = useCallback(async (registration: ServiceWorkerRegistration) => {
    console.log("VAPID Public Key:", VAPID_PUBLIC_KEY); // Log VAPID Public Key
    if (!VAPID_PUBLIC_KEY) {
      showError("VAPID Public Key topilmadi. Iltimos, .env faylingizni tekshiring.");
      return null;
    }
    if (!userId) {
      showError("Foydalanuvchi ID topilmadi. Obuna bo'lish uchun tizimga kiring.");
      return null;
    }

    // Check Notification permission status
    if (Notification.permission === 'denied') {
      showError("Bildirishnomalar ruxsati rad etilgan. Iltimos, brauzer sozlamalaridan ruxsat bering.");
      return null;
    }
    if (Notification.permission === 'default') {
      console.log("Bildirishnomalar ruxsati so'ralmoqda...");
      // The browser will prompt the user for permission here
    }

    try {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log('Push obunasi:', subscription);

      // Obuna ma'lumotlarini Supabase'ga saqlash
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: userId,
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!) as any)),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!) as any)),
          },
          { onConflict: 'endpoint' }
        );

      if (error) {
        throw error;
      }
      showSuccess("Push bildirishnomalariga muvaffaqiyatli obuna bo'ldingiz!");
      return subscription;
    } catch (error: any) {
      console.error('Push obunasida xato:', error);
      showError(`Push bildirishnomalariga obuna bo'lishda xato: ${error.message}`);
      return null;
    }
  }, [userId]);

  const unsubscribeUser = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !userId) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push obunasi bekor qilindi.');

        // Obuna ma'lumotlarini Supabase'dan o'chirish
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', userId);

        if (error) {
          throw error;
        }
        showSuccess("Push bildirishnomalari bekor qilindi.");
      }
    } catch (error: any) {
      console.error('Push obunasini bekor qilishda xato:', error);
      showError(`Push bildirishnomalarini bekor qilishda xato: ${error.message}`);
    }
  }, [userId]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !userId) {
      setIsPushEnabled(false);
      setIsLoading(false);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsPushEnabled(!!subscription);
    } catch (error) {
      console.error('Obuna holatini tekshirishda xato:', error);
      setIsPushEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      registerServiceWorker().then(() => {
        checkSubscriptionStatus();
      });
    } else {
      setIsPushEnabled(false);
      setIsLoading(false);
    }
  }, [userId, registerServiceWorker, checkSubscriptionStatus]);

  const togglePushNotifications = useCallback(async () => {
    if (!userId) {
      showError("Push bildirishnomalarini boshqarish uchun tizimga kiring.");
      return;
    }

    setIsLoading(true);
    try {
      if (isPushEnabled) {
        await unsubscribeUser();
      } else {
        // Request permission before subscribing
        const permissionResult = await Notification.requestPermission();
        if (permissionResult === 'granted') {
          const registration = await registerServiceWorker();
          if (registration) {
            await subscribeUser(registration);
          }
        } else {
          showError("Bildirishnomalar ruxsati berilmadi.");
        }
      }
      await checkSubscriptionStatus(); // Holatni yangilash
    } catch (error) {
      console.error("Push bildirishnomalarini almashtirishda xato:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isPushEnabled, userId, registerServiceWorker, subscribeUser, unsubscribeUser, checkSubscriptionStatus]);

  return { isPushEnabled, isLoading, togglePushNotifications };
};