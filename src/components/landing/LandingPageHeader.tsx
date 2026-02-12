"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogIn, UserPlus } from 'lucide-react';
import './LandingPageHeader.css'; // Import custom CSS

const LandingPageHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Bosh sahifa", href: "#" },
    { label: "Kurslar", href: "#kurslar" },
    { label: "Biz haqimizda", href: "#afzalliklar" },
    { label: "Aloqa", href: "#aloqa" },
  ];

  const handleNavItemClick = (href: string) => {
    if (href.startsWith('#') && href.length > 1) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50 content-layer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          {/* Logotip */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link to="/" className="text-3xl font-extrabold tracking-tight">
              <span className="text-primary">CEFR LC</span>
            </Link>
          </div>

          {/* Navigatsiya (Katta ekranlar uchun) */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => handleNavItemClick(item.href)}
                className="text-base font-medium text-gray-700 hover:text-primary transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Kirish tugmalari (Katta ekranlar uchun) */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
            <Link to="/login" className="text-base font-medium text-gray-700 hover:text-primary transition-colors duration-150">
              Kirish
            </Link>
            <Link to="/register" className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-primary hover:bg-primary-dark transition duration-150">
              Ro'yxatdan o'tish
            </Link>
          </div>

          {/* Mobil menyu tugmasi (Kichik ekranlar uchun) */}
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-white p-4 flex flex-col">
                <div className="flex items-center justify-between px-2 py-4 border-b border-gray-200">
                  <Link
                    to="/"
                    className="text-2xl font-extrabold tracking-tight text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    CEFR LC
                  </Link>
                </div>

                {/* Navigatsiya menyusi */}
                <nav className="flex-grow mt-4">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                        onClick={() => handleNavItemClick(item.href)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>

                {/* Mobil Kirish/Ro'yxatdan o'tish tugmalari pastki qismda */}
                <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-3 py-1.5 border border-primary rounded-lg text-sm font-medium text-primary bg-white hover:bg-red-50 transition duration-150"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-2" /> Kirish
                  </Link>
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center px-3 py-1.5 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary hover:bg-primary-dark transition duration-150"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" /> Ro'yxatdan o'tish
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