"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {Stethoscope} from "lucide-react";
// Theme toggle button
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dark-mode");
    if (
      stored === "true" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
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
      className="rounded-full p-2 bg-blue-100 hover:bg-blue-200 dark:bg-[#11235a] dark:hover:bg-[#2563eb] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {isDark ? (
        // Moon icon
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
        </svg>
      ) : (
        // Sun icon
        <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  );
}

const features = [
  {
    icon: "🤖",
    title: "Advanced AI-Powered Healthcare",
    desc: "Gemini AI and MCP server enable safe prescriptions, personalized care, and transparent, real-time AI insights.",
  },
  {
    icon: "👥",
    title: "Comprehensive Patient Management",
    desc: "360° patient profiles, smart search, real-time status, assignments, risk assessment, and timeline views.",
  },
  {
    icon: "📅",
    title: "Intelligent Appointment Scheduling",
    desc: "AI-powered, conflict-free scheduling for all visit types, with reminders, calendar sync, and virtual/in-person support.",
  },
  {
    icon: "💊",
    title: "Advanced Prescription Management",
    desc: "AI-driven prescriptions, digital delivery, tracking, renewals, medication database, and effectiveness analytics.",
  },
  {
    icon: "🔐",
    title: "Enterprise-Grade Security",
    desc: "JWT auth, role-based access, HIPAA compliance, audit trails, and advanced encryption for all data.",
  },
  {
    icon: "📊",
    title: "Real-time Analytics & Insights",
    desc: "Live dashboards, patient and appointment analytics, interactive charts, and custom exportable reports.",
  },
  {
    icon: "🎨",
    title: "Modern UI/UX Experience",
    desc: "Responsive dark/light theme, smooth animations, accessible components, and enhanced micro-interactions.",
  },
  {
    icon: "🔄",
    title: "Real-time Collaboration Features",
    desc: "Instant updates, live notifications, messaging, collaborative editing, and data sync across all devices.",
  },
  {
    icon: "🌐",
    title: "Seamless Data Integration",
    desc: "Real time medical news display, real-time sync, and up-to-date records for coordinated care.",
  },

];

const doctorReviews = [
  {
    name: "Dr. Swapnil Sutar",
    specialist: "Neurosurgeon",
    review:
      "This dashboard has revolutionized how I manage patient data. The AI insights are accurate and the interface is intuitive.",
  },
  {
    name: "Dr. Swastik Mohanty",
    specialist: "Cardiologist",
    review:
      "Scheduling and prescription management are seamless. It saves me hours every week and improves patient care.",
  },
  {
    name: "Dr. Roshan Kumar Ram",
    specialist: "Pediatrician",
    review:
      "The real-time analytics help me track patient progress efficiently. Highly recommend this platform to my peers.",
  },
  {
    name: "Dr. Anwesh Mishra",
    specialist: "Orthopedic Surgeon",
    review:
      "Security and compliance features give me peace of mind. The dashboard is a must-have for any modern clinic.",
  },
]



export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1b2a] text-blue-900 dark:text-blue-100 transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="main-header fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 py-3 text-gray-900 dark:text-gray-100 shadow">
        <Link href="/login" className="logo-container flex items-center gap-3 ml-7">
          <motion.div
            className="stethoscope-logo p-2 bg-blue-600 dark:bg-gray-700 rounded-lg shadow-md"
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
        </Link>
        <nav className="auth-buttons flex gap-2 items-center font-medium">
          <Link
            href="#about"
            className="nav-about-us px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-[#2563eb]/20 transition-colors"
          >
            About Us
          </Link>
          <Link
            href="#features"
            className="nav-features px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-[#2563eb]/20 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#reviews"
            className="nav-reviews px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-[#2563eb]/20 transition-colors"
          >
            Reviews
          </Link>
          <Link
            href="/login_page"
            className="btn login-btn rounded-lg px-4 py-2 border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white transition-colors duration-150 font-semibold shadow-sm dark:bg-[#11235a] dark:border-blue-400 dark:text-blue-100 dark:hover:bg-blue-600 dark:hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/register_page"
            className="btn register-btn rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150 font-semibold shadow-md dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Register
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="mt-16">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-20 gap-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-[#11235a] dark:to-[#0d1b2a]">
        <div className="flex-1 animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-blue-800 dark:text-white">
            Revolutionizing Healthcare with <span className="text-blue-600 dark:text-blue-300">AI</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-700 dark:text-blue-200 max-w-xl">
            Doctor Care System is a cutting-edge, AI-powered healthcare management platform that transforms how medical professionals manage patients, prescriptions, and clinical workflows.
          </p>
          <Link
            href="/register_page"
            className="inline-block bg-blue-600 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:bg-blue-700 transition-all animate-bounce dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Get Started
          </Link>
        </div>
        <div className="flex-1 flex justify-center animate-float">
          {/* Adjusted to rectangular container with reduced height */}
          <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#0f172a] dark:to-[#1e293b] px-12 py-6 border border-blue-200 dark:border-blue-800">
            <img
              src="/doctor-illustration_2.svg"
              alt="Doctor Care Illustration"
              className="w-80 h-64 md:w-96 md:h-72 lg:w-[28rem] lg:h-80 object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5 px-6 md:px-16 bg-white dark:bg-[#11235a]">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-blue-700 dark:text-blue-200">
          Core Features & Execution
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-blue-50 dark:bg-[#0d1b2a] rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 animate-fadeInUp border border-blue-100 dark:border-blue-800"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-5xl mb-4">{feature.icon}</span>
              <h3 className="text-xl font-semibold mb-2 text-blue-700 dark:text-blue-100">{feature.title}</h3>
              <p className="text-blue-800 dark:text-blue-100">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor Reviews Section */}
      <section id="reviews" className="px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-blue-700 dark:text-blue-200">
          Our Doctors review
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctorReviews.map((doc, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start"
            >
              <h4 className="text-lg font-semibold">{doc.name}</h4>
              <span className="text-blue-600 dark:text-blue-400 text-sm mb-2">
                {doc.specialist}
              </span>
              <p className="text-gray-700 dark:text-gray-300">{doc.review}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section
        id="about"
        className="py-10 px-6 md:px-16 bg-blue-50 dark:bg-[#0d1b2a]"
      >
        <div className="max-w-3xl mx-auto text-center animate-fadeInUp">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-700 dark:text-blue-100">About Us</h2>
          <p className="text-lg text-blue-800 dark:text-blue-100 mb-6">
            We are a team of passionate engineers, and AI specialists dedicated to transforming healthcare delivery. Our mission is to empower medical professionals with intelligent, safe, and efficient tools that put patient outcomes first.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <span className="bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-full font-medium">AI-Driven</span>
            <span className="bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-full font-medium">Patient-Centric</span>
            <span className="bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-full font-medium">Secure</span>
            <span className="bg-blue-100 dark:bg-blue-700 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-full font-medium">Scalable</span>
          </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="mt-16 text-center text-blue-600 dark:text-blue-400 relative z-10"
        >
          <p className="mb-3 text-base md:text-lg">Built with ❤️ for healthcare by</p>
          <p className="text-2xl font-bold md:text-3xl text-blue-800 dark:text-blue-200">
            Team RSA
          </p>
          <p className="text-lg font-semibold md:text-xl text-blue-700 dark:text-blue-300">
            National Institute of Technology Rourkela
          </p>
        </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#11235a] border-t border-blue-100 dark:border-blue-900 py-0 px-1 md:px-10 flex items-center justify-center text-blue-700 dark:text-blue-200">
        <div className="text-xs md:text-sm">
          <span className="font-semibold text-blue-700 dark:text-blue-200">DoctorCare Medical System</span> &copy; {new Date().getFullYear()}
        </div>
      </footer>
      </main>
    </div>
  );
}





