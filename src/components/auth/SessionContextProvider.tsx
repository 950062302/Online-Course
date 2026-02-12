"use client";

import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const LAST_SEEN_UPDATE_INTERVAL = 30 * 1000; // 30 soniya

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastSeenIntervalRef = useRef<number | null>(null);

  const fetchUserProfile = useCallback(async (currentUser: User) => {
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
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
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

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      await handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

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