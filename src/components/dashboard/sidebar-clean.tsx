"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Home,
  LogOut,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Check if current path matches the menu item
  const isActiveRoute = (url: string) => {
    if (!pathname) return false;
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Patients",
      url: "/dashboard/patients",
      icon: Users,
    },
    {
      title: "Appointments",
      url: "/dashboard/appointments",
      icon: Calendar,
    },
    {
      title: "Prescriptions",
      url: "/dashboard/prescriptions",
      icon: FileText,
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];
  return (
    <div className="w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
      {/* Header */}
      <motion.div
        className="p-6 border-b border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {" "}
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-blue-600 dark:bg-gray-700 rounded-lg shadow-md"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Stethoscope className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              DoctorCare
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Medical System
            </p>
          </div>
        </div>
      </motion.div>
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.url);

            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={item.url}>
                  {" "}
                  <motion.div
                    className={`
                      flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      }
                    `}
                    whileHover={{
                      scale: 1.02,
                      x: isActive ? 0 : 4,
                      boxShadow: isActive
                        ? "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        : "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                    </motion.div>
                    {item.title}
                  </motion.div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>{" "}
      {/* Footer */}{" "}
      <motion.div
        className="p-4 border-t border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <motion.div
          className="flex items-center mb-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {" "}
          <motion.div
            className="w-10 h-10 bg-blue-600 dark:bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md"
            whileHover={{
              scale: 1.1,
              boxShadow: "0 8px 25px -8px rgb(0 0 0 / 0.3)",
            }}
            transition={{ duration: 0.2 }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </motion.div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Medical Professional
            </p>
          </div>
        </motion.div>

        <motion.button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-all duration-200"
          whileHover={{
            scale: 1.02,
            x: 4,
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            whileHover={{ rotate: -12, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <LogOut className="mr-3 h-4 w-4" />
          </motion.div>
          Sign out
        </motion.button>
      </motion.div>
    </div>
  );
}
