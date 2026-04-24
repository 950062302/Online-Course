"use client";

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  History,
  Award,
  User,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Boshqaruv Paneli", href: "/dashboard", icon: LayoutDashboard },
    { label: "Mening Kurslarim", href: "/dashboard/active-courses", icon: BookOpen },
    { label: "Barcha Kurslar", href: "/courses", icon: ShoppingBag },
    { label: "Kurslar Tarixi", href: "/dashboard/history", icon: History },
    { label: "Sertifikatlar", href: "/dashboard/certificates", icon: Award },
    { label: "Chat", href: "/dashboard/chat", icon: MessageCircle },
    { label: "Profil Sozlamalari", href: "/dashboard/profile", icon: User },
  ];

  return (
    <aside className="hidden border-r border-cyan-100 bg-white/95 backdrop-blur-xl lg:flex w-72 flex-shrink-0 flex-col p-5 shadow-[0_20px_60px_rgba(26,255,255,0.08)]">
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-cyan-50 to-white p-4 border border-cyan-100">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary" relative="path">
          EduDars.uz
        </Link>
        <p className="mt-1 text-sm text-gray-500">Profil menyusi</p>
      </div>

      <nav className="flex-grow">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              relative="path"
              className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${location.pathname === item.href ? "bg-primary text-white shadow-md shadow-cyan-200" : "text-gray-700 hover:bg-cyan-50 hover:text-primary"}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="mt-auto rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} EduDars.uz. Barcha huquqlar himoyalangan.
      </div>
    </aside>
  );
};

export default Sidebar;