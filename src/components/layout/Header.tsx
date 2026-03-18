"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/components/auth/SessionContextProvider";
import { showSuccess, showError } from "@/utils/toast";
import { Card } from "@/components/ui/card";
import DateTimeCard from "./DateTimeCard";
import UserNotifications from "./UserNotifications";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, isLoading: isSessionLoading, profile, logout } = useSession();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess("Muvaffaqiyatli chiqish!");
      navigate("/login");
    } catch (error: any) {
      showError(`Chiqishda xato: ${error.message}`);
    }
  };

  if (isSessionLoading || !user || !profile) {
    return null;
  }

  return (
    <header className="glass-card px-3 py-1 sm:px-4 sm:py-2 md:px-5 md:py-3 mb-2 md:mb-4 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Left: greeting */}
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
            Assalomu alaykum,{" "}
            {profile?.username || user?.email?.split("@")[0] || "Foydalanuvchi"}!
          </h2>
          <p className="hidden sm:block text-[11px] md:text-xs text-gray-700">
            Profil va balansni boshqarish paneli
          </p>
        </div>

        {/* Right: time (desktop), balance, notifications, avatar dropdown (desktop only) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Time card: only show on sm+ */}
          <div className="hidden sm:block">
            <DateTimeCard />
          </div>

          <Card className="dark-gradient-card flex items-center px-2 py-1 h-9 sm:h-10">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2" />
            <div>
              <p className="text-[10px] sm:text-[11px] text-gray-600 font-medium">
                Joriy Balans
              </p>
              <p className="text-sm font-bold text-gray-900">
                {profile?.balance.toLocaleString() || "0"} UZS
              </p>
            </div>
          </Card>

          <UserNotifications />

          {/* Profile avatar dropdown: hidden on mobile, shown from sm+ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden sm:flex items-center justify-center relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0 border-2 border-primary flex-shrink-0"
              >
                <Avatar className="h-full w-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.username || user?.email || "Guest"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profile && (
                <DropdownMenuItem className="flex justify-between items-center">
                  <span>Balans:</span>
                  <span className="font-bold text-gray-900">
                    {profile.balance.toLocaleString()} UZS
                  </span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="hover:bg-gray-100 hover:text-primary cursor-pointer"
                onClick={() => navigate("/dashboard/profile")}
              >
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100 hover:text-primary cursor-pointer">
                Sozlamalar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="p-0">
                <div className="Btn">
                  <div className="sign">
                    <svg viewBox="0 0 512 512">
                      <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                    </svg>
                  </div>
                  <div className="text-logout">Chiqish</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;