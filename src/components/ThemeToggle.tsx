"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dark-mode");
    if (stored === "true" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dark-mode", "false");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dark-mode", "true");
      setIsDark(true);
    }
  };

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="rounded-full p-2 bg-muted hover:bg-primary hover:text-primary-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {isDark ? (
        // Moon icon
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
        </svg>
      ) : (
        // Sun icon
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  );
}
