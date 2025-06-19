"use client";

import { motion } from "framer-motion";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";
import {
  FaUserMd,
  FaNotesMedical,
  FaHeartbeat,
  FaRobot,
  FaCalendarCheck,
  FaPrescriptionBottleAlt,
  FaDna,
  FaPlusSquare,
  FaStethoscope, // Added for the header
} from "react-icons/fa";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const backgroundIcons = [
  { icon: FaHeartbeat, size: "text-6xl", top: "15%", left: "10%", duration: 25 },
  { icon: FaDna, size: "text-5xl", top: "30%", left: "80%", duration: 30 },
  { icon: FaPlusSquare, size: "text-7xl", top: "70%", left: "5%", duration: 35 },
  { icon: FaNotesMedical, size: "text-4xl", top: "85%", left: "90%", duration: 28 },
  { icon: FaPrescriptionBottleAlt, size: "text-6xl", top: "50%", left: "45%", duration: 22 },
];

const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-300 dark:bg-blue-900 opacity-30 rounded-full blur-3xl"
    />
    <motion.div
      animate={{ scale: [1, 1.05, 1], x: [0, -20, 0], y: [0, -10, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200 dark:bg-blue-800 opacity-20 rounded-full blur-2xl"
    />
    {backgroundIcons.map((item, index) => {
      const Icon = item.icon;
      return (
        <motion.div
          key={index}
          className={`absolute text-blue-300/50 dark:text-blue-700/50 blur-sm ${item.size}`}
          style={{ top: item.top, left: item.left }}
          animate={{
            y: [0, -20, 0, 10, 0],
            x: [0, 5, 0, -5, 0],
            rotate: [0, 10, -5, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon />
        </motion.div>
      );
    })}
    <motion.svg
      className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl text-blue-300 dark:text-blue-800 opacity-60"
      viewBox="0 0 800 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <motion.path
        d="M0 50 H150 L180 20 L210 80 L240 50 H350 L380 35 L410 65 L440 50 H550 L580 70 L610 30 L640 50 H800"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: 'loop', repeatDelay: 2 }}
      />
    </motion.svg>
  </div>
);

const features = [
  {
    title: "Dashboard",
    icon: FaHeartbeat,
    description: "Visualize trends, assess treatment efficacy, and make data-backed decisions with real-time clinical analytics.",
  },
  {
    title: "Patient Management",
    icon: FaUserMd,
    description: "Track 360° patient profiles, visit history, allergies, diagnostics, and risk levels — all integrated for quick clinical access.",
  },
  {
    title: "Appointments",
    icon: FaCalendarCheck,
    description: "Real-time scheduling system with auto-reminders, conflict detection, and patient-friendly booking experiences.",
  },
  {
    title: "Prescriptions",
    icon: FaPrescriptionBottleAlt,
    description: "AI-assisted prescriptions with smart suggestions. Instantly generate PDFs or email prescriptions directly to patients.",
  },
  {
    title: "AI Chat Assistant",
    icon: FaNotesMedical,
    description: "Get intelligent answers based on patient context — from clinical suggestions to diagnosis clarifications.",
  },
  {
    title: "AI Engine",
    icon: FaRobot,
    description: "Gemini-powered AI analyzes symptoms, checks drug interactions, and suggests safe, evidence-based prescriptions.",
  },
];

export default function DoctorDashboardLanding() {
  return (
    <div className="relative min-h-screen px-4 py-16 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-950 dark:to-black text-blue-900 dark:text-blue-100 overflow-hidden transition-colors duration-300">
      <AnimatedBackground />

      {/* --- Header --- */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20 relative z-10"
      >
        <h1 className="text-5xl font-extrabold mb-4">
          <FaStethoscope className="inline-block mb-2 mr-4 text-blue-500" />
          Welcome to DoctorCare!
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-blue-800 dark:text-blue-200">
          Revolutionizing Healthcare, One Click at a Time
        </p>
      </motion.div>

      {/* --- Features Section (Restored Compact Design) --- */}
      <div className="space-y-8 max-w-xl mx-auto relative z-10">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className={`
                  flex flex-col md:flex-row items-center gap-6 md:gap-8 
                  p-6 rounded-2xl shadow-xl
                  bg-white/20 dark:bg-gray-900/20 
                  backdrop-blur-lg 
                  border border-white/30 dark:border-gray-700/30
                `}
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-5xl text-blue-700 dark:text-blue-300 flex-shrink-0"
                >
                  <Icon />
                </motion.div>
                <div className="w-full text-left space-y-2">
                  <h2 className="text-2xl font-bold">{feature.title}</h2>
                  <p className="text-base text-blue-800 dark:text-blue-200 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* --- Call to Action & Quote --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-20 text-center relative z-10"
      >
        <Link href="/dashboard" passHref>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Go to Dashboard
          </motion.button>
        </Link>
                
        <p
          className={`
            max-w-3xl mx-auto mt-12 text-2xl md:text-3xl italic text-blue-700 dark:text-blue-300
            ${dancingScript.className}
          `}
        >
          “Crafting a digital heartbeat for healthcare — smarter data, faster decisions, better lives.”
        </p>
      </motion.div>
      
      {/* --- Refined Footer Section --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 1 }}
        className="mt-16 text-center text-blue-600 dark:text-blue-400 relative z-10"
      >
        <p className="mb-3 text-lg">Built with ❤️ for healthcare by</p>
        <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
          Team RSA
        </p>
        <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">
          National Institute of Technology Rourkela
        </p>
      </motion.div>
    </div>
  );
}