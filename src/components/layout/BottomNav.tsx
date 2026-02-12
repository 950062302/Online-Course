"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  History,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
    { href: "/courses", label: "Kurslar", icon: BookOpen },
    { href: "/dashboard/history", label: "Tarix", icon: History },
    { href: "/dashboard/chat", label: "Chat", icon: MessageCircle },
    { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm lg:hidden">
      <div className="flex justify-between items-center px-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/dashboard" &&
              location.pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex-1 flex flex-col items-center justify-center py-1.5"
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-gray-500"
                )}
              />
              <span
                className={cn(
                  "mt-0.5 text-[10px] leading-tight",
                  isActive ? "text-primary font-semibold" : "text-gray-500"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;