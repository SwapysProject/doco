// components/dashboard/dashboard-header.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { getNotificationColor } from "@/lib/notifications-client";

export function DashboardHeader() {
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuth();
  const router = useRouter();
  const { notifications, notificationCount, markAsRead, markAllAsRead } =
    useNotifications();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };
  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
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
    // CRITICAL CHANGE HERE: `fixed top-0 left-64 right-0`
    <header className="fixed top-0 left-64 right-0 z-50 h-16 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-sm transition-all duration-300 ease-in-out">
      {/* Use h-full here so the flex items fill the 16px height of the fixed header */}
      <div className="flex h-full items-center px-6 gap-6">
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
          </div>{" "}
        </div>{" "}
        {/* Digital Time Display */}
        <div className="hidden lg:flex items-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="font-mono text-lg font-medium text-gray-700">
            {currentTime.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>
        {/* Enhanced Right Side Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {" "}
          {/* Quick Actions as Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("/dashboard/appointments")}
              className="h-9 px-4 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-all duration-200 ease-in-out hover:scale-105 transform cursor-pointer"
            >
              <Calendar className="h-4 w-4 transition-transform duration-200 ease-in-out group-hover:rotate-6" />
              <span className="text-sm font-medium">Appointments</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("/dashboard/messages")}
              className="h-9 px-4 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-all duration-200 ease-in-out hover:scale-105 transform cursor-pointer"
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
            className="h-9 px-4 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ease-in-out hover:scale-110 transform hover:rotate-12"
          >
            {isDark ? (
              <Sun className="h-4 w-4 transition-all duration-500 ease-in-out animate-in spin-in-180" />
            ) : (
              <Moon className="h-4 w-4 transition-all duration-500 ease-in-out animate-in spin-in-180" />
            )}
          </Button>{" "}
          {/* Enhanced Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 rounded-full text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out hover:scale-110 transform"
              >
                <Bell className="h-4 w-4 transition-transform duration-200 ease-in-out hover:animate-pulse" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full border-2 border-white dark:border-gray-900 transition-all duration-200 ease-in-out animate-pulse hover:scale-110 font-medium">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>{" "}
            <DropdownMenuContent
              className="w-80 animate-in slide-in-from-top-2 fade-in-0 duration-200"
              align="end"
              forceMount
            >
              <DropdownMenuLabel>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Notifications</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {notificationCount} new
                    </span>
                    {notificationCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Real Notifications */}
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="py-3 transition-all duration-150 ease-in-out hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationColor(notification.type)}`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="py-2 text-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer font-medium"
                onClick={() => handleNavigate("/dashboard/notifications")}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Enhanced User Menu - Positioned to the right */}{" "}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full transition-all duration-200 ease-in-out hover:scale-110 transform p-0 overflow-hidden"
              >
                <Avatar className="h-9 w-9 rounded-full ring-2 ring-gray-200 transition-all duration-300 ease-in-out hover:ring-blue-400 hover:ring-4 aspect-square">
                  <AvatarImage
                    src="/api/placeholder/36/36"
                    alt={user?.name || "Doctor"}
                    className="transition-all duration-300 ease-in-out rounded-full object-cover w-full h-full aspect-square"
                  />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold transition-all duration-300 ease-in-out hover:bg-blue-700 rounded-full flex items-center justify-center w-full h-full aspect-square">
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
              <DropdownMenuSeparator />{" "}
              <DropdownMenuItem
                className="py-2 transition-all duration-150 ease-in-out hover:bg-blue-50 hover:translate-x-1 transform cursor-pointer"
                onClick={() => handleNavigate("/dashboard/profile")}
              >
                <User className="mr-3 h-4 w-4 text-gray-500 transition-colors duration-150 ease-in-out" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-2 transition-all duration-150 ease-in-out hover:bg-blue-50 hover:translate-x-1 transform cursor-pointer"
                onClick={() => handleNavigate("/dashboard/settings")}
              >
                <Settings className="mr-3 h-4 w-4 text-gray-500 transition-colors duration-150 ease-in-out" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-2 transition-all duration-150 ease-in-out hover:bg-blue-50 hover:translate-x-1 transform cursor-pointer"
                onClick={() => handleNavigate("/dashboard/activity")}
              >
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