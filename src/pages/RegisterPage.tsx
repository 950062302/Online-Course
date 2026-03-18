"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { showSuccess, showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/auth/SessionContextProvider";
import EmailConfirmationDialog from "@/components/auth/EmailConfirmationDialog"; // Import the new dialog
import '@/components/auth/AuthForms.css'; // Import custom CSS for forms

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
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false); // State for confirmation dialog
  const [registeredEmail, setRegisteredEmail] = useState(""); // To pass email to dialog

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues, // To get email for dialog
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!isLoading && session && profile) {
      navigate("/dashboard");
    }
  }, [session, isLoading, navigate, profile]);

  const onSubmit = async (data: RegisterFormInputs) => {
    const { username, email, password } = data;
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        showError(`Ro'yxatdan o'tishda xato: ${error.message}`);
      } else {
        setRegisteredEmail(email);
        setIsConfirmationDialogOpen(true); // Open the dialog instead of toast
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      showError(`Kutilmagan xato: ${error.message}`);
    }
  };

  const handleConfirmationDialogClose = () => {
    setIsConfirmationDialogOpen(false);
    navigate("/login"); // Redirect to login after closing dialog
  };

  if (isLoading || (session && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 content-layer">
        <p className="text-lg text-gray-700">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="ui-root">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md">
           {/* Logo va sarlavha */}
           <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4 shadow-lg border border-[rgba(0,0,0,0.08)]">
              <span className="text-base font-extrabold text-primary-foreground">EduDars.uz</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ro'yxatdan o'tish</h1>
            <p className="text-gray-600">Yangi hisob yarating</p>
          </div>

          <form className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foydalanuvchi nomi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="8" r="4" strokeWidth="2" />
                        <path strokeLinecap="round" strokeWidth="2" d="M5 20c0-3 3-5 7-5s7 2 7 5" />
                     </svg>
                  </div>
                  <input
                    required
                    placeholder="Foydalanuvchi nomi"
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.username ? 'border-primary' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    type="text"
                    {...register("username")}
                  />
                </div>
                {errors.username && <p className="mt-1 text-sm text-primary">{errors.username.message}</p>}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email manzil
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    required
                    placeholder="name@example.com"
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-primary' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    type="email"
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-primary">{errors.email.message}</p>}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parol
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    required
                    placeholder="•••••••"
                    className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-primary' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-primary">{errors.password.message}</p>}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parolni tasdiqlash
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    required
                    placeholder="•••••••"
                    className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-primary' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors`}
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-primary">{errors.confirmPassword.message}</p>}
              </div>

            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] shadow-lg mt-8"
            >
              Hisob yaratish
            </button>

            <div className="mt-6 text-center space-y-2">
              <Link to="/login" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Hisobingiz bormi? <span className="font-medium">Kirish</span>
              </Link>
              <div>
                <Link to="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Bosh sahifaga qaytish
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      <EmailConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleConfirmationDialogClose}
        email={registeredEmail}
      />
    </div>
  );
};

export default RegisterPage;