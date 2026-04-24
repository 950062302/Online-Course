"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogIn, UserPlus } from 'lucide-react';
import './LandingPageHeader.css';

const LandingPageHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Bosh sahifa", href: "#top" },
    { label: "Kurslar", href: "#kurslar" },
    { label: "Biz haqimizda", href: "#afzalliklar" },
    { label: "Aloqa", href: "#aloqa" },
  ];

  const handleNavItemClick = (href: string) => {
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-100 bg-white/80 backdrop-blur-xl content-layer">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">EduDars.uz</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => handleNavItemClick(item.href)}
                className="text-sm font-semibold text-gray-700 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
              Kirish
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-200 transition-transform hover:-translate-y-0.5 hover:bg-primary-dark">
              Ro'yxatdan o'tish
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full border border-cyan-100 bg-white/80 text-gray-800 hover:bg-cyan-50">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-cyan-100 bg-white p-5">
                <div className="flex items-center justify-between pb-4 border-b border-cyan-100">
                  <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    EduDars.uz
                  </Link>
                </div>

                <nav className="mt-6 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => handleNavItemClick(item.href)}
                      className="block rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-cyan-50 hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 space-y-3 border-t border-cyan-100 pt-5">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-primary hover:bg-cyan-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" /> Kirish
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-200 hover:bg-primary-dark"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserPlus className="h-4 w-4" /> Ro'yxatdan o'tish
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingPageHeader;