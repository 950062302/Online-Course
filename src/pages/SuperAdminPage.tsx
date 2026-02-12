"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from "@/utils/toast";
import { useSession } from "@/components/auth/SessionContextProvider";
import AdminLayout from '@/components/superadmin/AdminLayout';
import LoadingSpinner from "@/components/ui/LoadingSpinner"; // Import LoadingSpinner

// No need to import supabase here, as profile is from context

const SuperAdminPage: React.FC = () => {
  const { session, isLoading, user, profile } = useSession(); // Get profile from context
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      // Session or profile is still loading, do nothing yet
      return;
    }

    if (!session) {
      // No session, redirect to login
      showError("Super admin paneliga kirish uchun avval tizimga kiring.");
      navigate("/login");
      return;
    }

    // At this point, session exists and is not loading. Profile should also be loaded (or fallback set).
    if (profile?.role === 'developer') {
      showSuccess("Super admin paneliga xush kelibsiz!");
      // No navigation needed here, as the component will render AdminLayout
    } else {
      console.error("[SuperAdminPage] User logged in but not a developer or profile is null. Session exists, but profile role is not 'developer'. Redirecting to /dashboard.");
      // User is authenticated but not a developer, redirect to dashboard
      showError("Sizda Super Admin paneliga kirish huquqi yo'q.");
      navigate("/dashboard");
    }
  }, [session, isLoading, navigate, profile]); // user is implicitly covered by session and profile

  if (isLoading || !session || !profile) { // Show loading if session exists but profile is not yet loaded
    if (!isLoading && session && !profile) {
      console.warn("[SuperAdminPage] Session loaded, but profile is null. This might indicate a profile creation/fetch issue.");
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (profile?.role === 'developer') { // Check profile role directly
    return <AdminLayout />;
  }

  // If we reach here, it means userRole is not 'developer' and they should have been redirected by the useEffect.
  // This return is a fallback, though ideally, it should not be reached.
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <p className="text-lg text-gray-700">Kirish huquqi yo'q. Yo'naltirilmoqda...</p>
    </div>
  );
};

export default SuperAdminPage;