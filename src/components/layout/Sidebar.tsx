"use client";

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  History,
  Award,
  User,
  LogOut,
  MessageCircle,
  ShoppingBag, // New Icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import './Sidebar.css'; // Import custom CSS

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Boshqaruv Paneli", href: "/dashboard", icon: LayoutDashboard },
    { label: "Mening Kurslarim", href: "/dashboard/active-courses", icon: BookOpen },
    { label: "Barcha Kurslar", href: "/courses", icon: ShoppingBag }, // New Item
    { label: "Kurslar Tarixi", href: "/dashboard/history", icon: History },
    { label: "Sertifikatlar", href: "/dashboard/certificates", icon: Award },
    { label: "Chat", href: "/dashboard/chat", icon: MessageCircle },
    { label: "Profil Sozlamalari", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="hidden border-r bg-white lg:block text-gray-800 w-64 flex-shrink-0 flex-col p-4 shadow-2xl"> {/* Changed bg-[#1a232f] to bg-white, text-white to text-gray-800 */}
      <div className="mb-8 p-2">
        <Link to="/" className="text-xl font-bold tracking-wider text-primary" relative="path">
          EduDars.uz
        </Link>
        <p className="text-sm text-gray-500 mt-1 ml-2">Profil menyusi</p> {/* Adjusted styling */}
      </div>
      
      <nav className="flex-grow">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              relative="path" // Added relative="path"
              className={`nav-button-effect ${location.pathname === item.href ? "active" : ""}`}
            >
              <item.icon className="w-5 h-5 mr-3 ml-2" /> {/* Adjusted margin for icon */}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="mt-auto pt-8 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} EduDars.uz. Barcha huquqlar himoyalangan.
      </div>
    </div>
  );
};

export default Sidebar;