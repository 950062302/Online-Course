"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/auth/SessionContextProvider";
import EmailConfirmationDialog from "@/components/auth/EmailConfirmationDialog";
import '@/components/auth/AuthForms.css';
import { Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(1, "Foydalanuvchi nomi majburiy"),
  email: z.string().email("Noto'g'ri email formati").min(1, "Email majburiy"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  confirmPassword: z.string().min(6, "Parolni tasdiqlash majburiy"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parollar mos kelmadi",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, isLoading, profile } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!isLoading && session && profile) {
      navigate(profile.role === 'developer' ? "/superadmin" : "/dashboard");
    }
  }, [session, isLoading, navigate, profile]);

  const onSubmit = async (data: RegisterFormInputs) => {
    const { email, password } = data;
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        showError(`Ro'yxatdan o'tishda xato: ${error.message}`);
      } else {
        setRegisteredEmail(email);
        setIsConfirmationDialogOpen(true);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      showError(`Kutilmagan xato: ${error.message}`);
    }
  };

  const handleConfirmationDialogClose = () => {
    setIsConfirmationDialogOpen(false);
    navigate("/login");
  };

  if (isLoading || (session && !profile)) {
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
                Ta'lim sayohatingizni bugunoq boshlang.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-gray-600">
                Hisob yarating, kurslarga qo‘shiling va natijani kuzatib boring.
              </p>
            </div>
            <div className="rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_rgba(26,255,255,0.10)]">
              <div className="flex items-center gap-3 text-gray-900">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Tez, qulay va xavfsiz ro'yxatdan o'tish</span>
              </div>
              <p className="mt-3 text-gray-600">Hisob yaratgach, tizim sizni avtomatik ravishda kerakli panelga yo‘naltiradi.</p>
            </div>
          </div>

          <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
            <div className="w-full max-w-md">
              <div className="text-center mb-8 lg:hidden">
                <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-primary">
                  <Sparkles className="h-6 w-6" /> EduDars.uz
                </Link>
                <h1 className="mt-4 text-3xl font-bold text-gray-950">Ro'yxatdan o'tish</h1>
                <p className="text-gray-600">Yangi hisob yarating</p>
              </div>

              <form className="rounded-[2rem] border border-cyan-100 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(26,255,255,0.10)]" onSubmit={handleSubmit(onSubmit)}>
                <div className="hidden lg:block text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-950">Hisob yarating</h2>
                  <p className="mt-2 text-gray-600">EduDars platformasiga qo‘shiling</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foydalanuvchi nomi</label>
                    <input {...register("username")} type="text" className={`block w-full rounded-2xl border px-4 py-3 ${errors.username ? 'border-primary' : 'border-gray-200'} bg-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`} placeholder="Foydalanuvchi nomi" />
                    {errors.username && <p className="mt-1 text-sm text-primary">{errors.username.message}</p>}
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parolni tasdiqlash</label>
                    <div className="relative">
                      <input {...register("confirmPassword")} type={showConfirmPassword ? "text" : "password"} className={`block w-full rounded-2xl border px-4 py-3 pr-12 ${errors.confirmPassword ? 'border-primary' : 'border-gray-200'} bg-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`} placeholder="•••••••" />
                      <button type="button" className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-800" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-primary">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <button type="submit" className="mt-6 w-full rounded-2xl bg-primary px-4 py-3.5 font-semibold text-white shadow-lg shadow-cyan-200 transition-transform hover:-translate-y-0.5 hover:bg-primary-dark">
                  Hisob yaratish
                </button>

                <div className="mt-6 space-y-3 text-center text-sm text-gray-600">
                  <Link to="/login" className="block hover:text-primary">
                    Hisobingiz bormi? <span className="font-semibold">Kirish</span>
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
      <EmailConfirmationDialog isOpen={isConfirmationDialogOpen} onClose={handleConfirmationDialogClose} email={registeredEmail} />
    </div>
  );
};

export default RegisterPage;