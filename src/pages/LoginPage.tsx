"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { showSuccess, showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/auth/SessionContextProvider";
import '@/components/auth/AuthForms.css';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email("Noto'g'ri email formati").min(1, "Email majburiy"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, isLoading, user, profile } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isLoading && session && user && profile) {
      navigate(profile.role === 'developer' ? "/superadmin" : "/dashboard");
    }
  }, [session, isLoading, navigate, user, profile]);

  const onSubmit = async (data: LoginFormInputs) => {
    const { email, password } = data;
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showError(`Kirishda xato: ${error.message}`);
      } else {
        showSuccess("Muvaffaqiyatli kirish!");
      }
    } catch (error: any) {
      console.error("[LoginPage] Unexpected login error:", error);
      showError(`Kutilmagan xato: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 content-layer bg-gradient-to-br from-white via-cyan-50/40 to-white">
        <p className="text-lg text-gray-700">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="ui-root">
      <div className="relative z-10 min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50/40">
        <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between p-10">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-primary">
                <Sparkles className="h-6 w-6" /> EduDars.uz
              </Link>
              <h1 className="mt-10 max-w-xl text-5xl font-black leading-tight text-gray-950">
                Bilim olishni premium tajribaga aylantiring.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-gray-600">
                Tez kirish, qulay boshqaruv va kuchli o‘quv ekotizimi — hammasi bir joyda.
              </p>
            </div>
            <div className="rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_rgba(26,255,255,0.10)]">
              <div className="flex items-center gap-3 text-gray-900">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Xavfsiz va tezkor autentifikatsiya</span>
              </div>
              <p className="mt-3 text-gray-600">User yoki admin bo‘lishingizdan qat’i nazar, panel avtomatik yo‘naltiriladi.</p>
            </div>
          </div>

          <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
            <div className="w-full max-w-md">
              <div className="text-center mb-8 lg:hidden">
                <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-primary">
                  <Sparkles className="h-6 w-6" /> EduDars.uz
                </Link>
                <h1 className="mt-4 text-3xl font-bold text-gray-950">Xush kelibsiz</h1>
                <p className="text-gray-600">Hisobingizga kiring</p>
              </div>

              <form className="rounded-[2rem] border border-cyan-100 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(26,255,255,0.10)]" onSubmit={handleSubmit(onSubmit)}>
                <div className="hidden lg:block text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-950">Hisobingizga kiring</h2>
                  <p className="mt-2 text-gray-600">EduDars kabinetiga kirish</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email manzil</label>
                    <input {...register("email")} type="email" className={`block w-full rounded-2xl border px-4 py-3 ${errors.email ? 'border-primary' : 'border-gray-200'} bg-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`} placeholder="name@example.com" />
                    {errors.email && <p className="mt-1 text-sm text-primary">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parol</label>
                    <div className="relative">
                      <input {...register("password")} type={showPassword ? "text" : "password"} className={`block w-full rounded-2xl border px-4 py-3 pr-12 ${errors.password ? 'border-primary' : 'border-gray-200'} bg-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`} placeholder="•••••••" />
                      <button type="button" className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-800" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-primary">{errors.password.message}</p>}
                  </div>
                </div>

                <button type="submit" className="mt-6 w-full rounded-2xl bg-primary px-4 py-3.5 font-semibold text-white shadow-lg shadow-cyan-200 transition-transform hover:-translate-y-0.5 hover:bg-primary-dark">
                  Kirish
                </button>

                <div className="mt-6 space-y-3 text-center text-sm text-gray-600">
                  <Link to="/register" className="block hover:text-primary">
                    Hisobingiz yo'qmi? <span className="font-semibold">Ro'yxatdan o'tish</span>
                  </Link>
                  <Link to="/" className="block hover:text-primary">
                    Bosh sahifaga qaytish
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;