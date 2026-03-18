"use client";

import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { supabase, SupabaseLikeSession, SupabaseLikeUser } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export interface Profile {
  id: string;
  created_at: string;
  username: string | null;
  role: string;
  balance: number;
  score: number;
  phone: string;
  bio: string;
  total_time_spent_seconds: number;
  streak: number;
  xp: number;
  level: number;
  last_checkin_date: string | null;
  last_test_date: string | null;
  last_seen_at: string | null;
}

interface SessionContextType {
  session: SupabaseLikeSession | null;
  user: SupabaseLikeUser | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const LAST_SEEN_UPDATE_INTERVAL = 30 * 1000; // 30 soniya

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SupabaseLikeSession | null>(null);
  const [user, setUser] = useState<SupabaseLikeUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastSeenIntervalRef = useRef<number | null>(null);

  const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';

  const fetchUserProfile = useCallback(async (currentUser: SupabaseLikeUser) => {
    let fetchedProfile: Profile | null = null;
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, created_at, username, role, balance, score, phone, bio, total_time_spent_seconds, streak, xp, level, last_checkin_date, last_test_date, last_seen_at')
      .eq('id', currentUser.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        const { data: newProfileData, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: currentUser.id,
              username: currentUser.email?.split('@')[0] || 'user',
              role: 'user',
              balance: 0,
              score: 0,
              phone: '',
              bio: '',
              total_time_spent_seconds: 0,
              streak: 0,
              xp: 0,
              level: 0,
              last_checkin_date: null,
              last_seen_at: new Date().toISOString(),
            },
          ])
          .select('id, created_at, username, role, balance, score, phone, bio, total_time_spent_seconds, streak, xp, level, last_checkin_date, last_test_date, last_seen_at')
          .single();

        if (insertError) {
          showError("Profil yaratishda xato yuz berdi.");
          fetchedProfile = null;
        } else if (newProfileData) {
          fetchedProfile = newProfileData as Profile;
        }
      } else {
        showError("Profil ma'lumotlarini yuklashda xato yuz berdi.");
        fetchedProfile = null;
      }
    } else if (data) {
      fetchedProfile = data as Profile;
    } else {
      fetchedProfile = null;
    }
    return fetchedProfile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchUserProfile(user);
      setProfile(updatedProfile);
    }
  }, [user, fetchUserProfile]);

  // Force logout helper
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignor Auth session missing va boshqa kichik xatolar
      console.error("Supabase signOut error (ignored):", e);
    }
    // Frontend holatini tozalash
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user && profile && profile.role !== 'developer') {
      const updateLastSeen = async () => {
        try {
          await supabase
            .from('profiles')
            .update({ last_seen_at: new Date().toISOString() })
            .eq('id', user.id);
        } catch (error) {
          console.error("[SessionContext] last_seen_at ni yangilashda xato:", error);
        }
      };

      updateLastSeen();
      lastSeenIntervalRef.current = setInterval(updateLastSeen, LAST_SEEN_UPDATE_INTERVAL) as unknown as number;
    }

    return () => {
      if (lastSeenIntervalRef.current) {
        clearInterval(lastSeenIntervalRef.current);
        lastSeenIntervalRef.current = null;
      }
    };
  }, [user, profile]);

  useEffect(() => {
    if (BYPASS_AUTH) {
      // Dev-only bypass to quickly test user/admin panels without logging in.
      // Role auto-switches based on current path.
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin');
      const devUser: SupabaseLikeUser = { id: 'dev-user', email: 'dev@edudars.uz' };
      const devSession: SupabaseLikeSession = { access_token: 'dev-token', user: devUser };
      const devProfile: Profile = {
        id: devUser.id,
        created_at: new Date().toISOString(),
        username: 'EduDars Dev',
        role: isAdminPath ? 'developer' : 'user',
        balance: 1_000_000,
        score: 0,
        phone: '',
        bio: '',
        total_time_spent_seconds: 0,
        streak: 0,
        xp: 0,
        level: 0,
        last_checkin_date: null,
        last_test_date: null,
        last_seen_at: new Date().toISOString(),
      };

      setSession(devSession);
      setUser(devUser);
      setProfile(devProfile);
      setIsLoading(false);
      return;
    }

    const handleAuthStateChange = async (event: string, currentSession: SupabaseLikeSession | null) => {
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);
      let userProfile: Profile | null = null;

      if (event === 'SIGNED_OUT') {
        // Sign out bo'lganda hamma narsani tozalab qo'yamiz
        setProfile(null);
        setIsLoading(false);
        return;
      }

      if (currentUser) {
        try {
          userProfile = await fetchUserProfile(currentUser);
        } catch (error) {
          console.error("[SessionContext] Error fetching user profile:", error);
          showError("Profil ma'lumotlarini yuklashda kutilmagan xato yuz berdi.");
          userProfile = null;
        }
      }
      setProfile(userProfile);
      setIsLoading(false);
    };

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      await handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    return () => {};
  }, [fetchUserProfile, BYPASS_AUTH]);

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading, refreshProfile, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};