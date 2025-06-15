"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  Calendar,
  MessageSquare,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardHeader() {
  const [isDark, setIsDark] = useState(false);
  const { user, logout } = useAuth();
  const notificationCount = 5;

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "DR";
    return user.name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm transition-all duration-300 ease-in-out">
      <div className="flex h-16 items-center px-6 gap-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 hover:scale-105 transition-all duration-200 ease-in-out"
        >
          <Menu className="h-5 w-5 transition-transform duration-200 ease-in-out" />
        </Button>{" "}
        {/* Enhanced Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-200 ease-in-out group-focus-within:text-blue-500" />
            <Input
              type="search"
              placeholder="Search patients, appointments..."
              className="pl-10 pr-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-in-out hover:bg-gray-100 focus:scale-[1.02] transform"
            />
          </div>
        </div>
        {/* Current User Display */}
        <div className="hidden lg:flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Logged in as:</span>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {user?.name || "Doctor"}
              </span>
              <span className="text-xs text-gray-500">
                {user?.specialization || "Medical Professional"}
              </span>
            </div>
          </div>
        </div>{" "}
        {/* Enhanced Right Side Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Quick Actions as Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2 transition-all duration-200 ease-in-out hover:scale-105 transform"
            >
              <Calendar className="h-4 w-4 transition-transform duration-200 ease-in-out group-hover:rotate-6" />
              <span className="text-sm font-medium">Appointments</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2 transition-all duration-200 ease-in-out hover:scale-105 transform"
            >
              <MessageSquare className="h-4 w-4 transition-transform duration-200 ease-in-out group-hover:bounce" />
              <span className="text-sm font-medium">Messages</span>
            </Button>
          </div>
          {/* Separator */}
          <div className="hidden lg:block w-px h-6 bg-gray-200 transition-opacity duration-300 ease-in-out"></div>
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 ease-in-out hover:scale-110 transform hover:rotate-12"
          >
            {isDark ? (
              <Sun className="h-4 w-4 transition-all duration-500 ease-in-out animate-in spin-in-180" />
            ) : (
              <Moon className="h-4 w-4 transition-all duration-500 ease-in-out animate-in spin-in-180" />
            )}
          </Button>
          {/* Enhanced Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-110 transform"
          >
            <Bell className="h-4 w-4 transition-transform duration-200 ease-in-out hover:animate-pulse" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500 hover:bg-red-600 border-2 border-white transition-all duration-200 ease-in-out animate-pulse hover:scale-110">
                {notificationCount}
              </Badge>
            )}
          </Button>{" "}
          {/* Enhanced User Menu - Positioned to the right */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full transition-all duration-200 ease-in-out hover:scale-110 transform"
              >
                <Avatar className="h-9 w-9 ring-2 ring-gray-200 transition-all duration-300 ease-in-out hover:ring-blue-400 hover:ring-4">
                  <AvatarImage
                    src="/api/placeholder/36/36"
                    alt={user?.name || "Doctor"}
                    className="transition-all duration-300 ease-in-out"
                  />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold transition-all duration-300 ease-in-out hover:bg-blue-700">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 animate-in slide-in-from-top-2 fade-in-0 duration-200"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-gray-900">
                    {user?.name || "Doctor"}
                  </p>
                  <p className="text-xs leading-none text-gray-500">
                    {user?.specialization || "Medical Professional"} • ID:{" "}
                    {user?.id?.slice(-6) || "------"}
                  </p>
                  <p className="text-xs leading-none text-gray-400">
                    {user?.email || "doctor@hospital.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2 transition-all duration-150 ease-in-out hover:bg-blue-50 hover:translate-x-1 transform">
                <User className="mr-3 h-4 w-4 text-gray-500 transition-colors duration-150 ease-in-out" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2 transition-all duration-150 ease-in-out hover:bg-blue-50 hover:translate-x-1 transform">
                <Settings className="mr-3 h-4 w-4 text-gray-500 transition-colors duration-150 ease-in-out" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2 transition-all duration-150 ease-in-out hover:bg-blue-50 hover:translate-x-1 transform">
                <Activity className="mr-3 h-4 w-4 text-gray-500 transition-colors duration-150 ease-in-out" />
                <span>Activity Log</span>
              </DropdownMenuItem>{" "}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="py-2 text-red-600 focus:text-red-600 transition-all duration-150 ease-in-out hover:bg-red-50 hover:translate-x-1 transform"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-4 w-4 transition-colors duration-150 ease-in-out" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
