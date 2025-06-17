"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AnalogClockProps {
  size?: number;
  className?: string;
}

export function AnalogClock({ size = 80, className = "" }: AnalogClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate angles for clock hands
  const secondAngle = time.getSeconds() * 6 - 90; // 6 degrees per second
  const minuteAngle = time.getMinutes() * 6 + time.getSeconds() * 0.1 - 90; // 6 degrees per minute + smooth seconds
  const hourAngle = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90; // 30 degrees per hour + smooth minutes

  // Format time for digital display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Analog Clock */}
      <motion.div
        className="relative bg-white rounded-full shadow-lg border-2 border-gray-200"
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {/* Clock Face */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          {/* Hour Markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 bg-gray-400"
              style={{
                height: i % 3 === 0 ? "8px" : "4px",
                left: "50%",
                top: i % 3 === 0 ? "2px" : "4px",
                transformOrigin: "50% 36px",
                transform: `translateX(-50%) rotate(${i * 30}deg)`,
              }}
            />
          ))}

          {/* Clock Hands */}
          {/* Hour Hand */}
          <motion.div
            className="absolute w-0.5 bg-gray-800 rounded-full origin-bottom"
            style={{
              height: size * 0.25,
              left: "50%",
              bottom: "50%",
              transformOrigin: "50% 100%",
            }}
            animate={{ rotate: hourAngle }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Minute Hand */}
          <motion.div
            className="absolute w-0.5 bg-gray-700 rounded-full origin-bottom"
            style={{
              height: size * 0.35,
              left: "50%",
              bottom: "50%",
              transformOrigin: "50% 100%",
            }}
            animate={{ rotate: minuteAngle }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Second Hand */}
          <motion.div
            className="absolute w-px bg-red-500 rounded-full origin-bottom"
            style={{
              height: size * 0.4,
              left: "50%",
              bottom: "50%",
              transformOrigin: "50% 100%",
            }}
            animate={{ rotate: secondAngle }}
            transition={{ duration: 0.1, ease: "linear" }}
          />

          {/* Center Dot */}
          <div
            className="absolute bg-gray-800 rounded-full"
            style={{
              width: size * 0.08,
              height: size * 0.08,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </motion.div>

      {/* Digital Time Display */}
      <div className="flex flex-col space-y-1">
        <motion.div
          className="text-lg font-bold text-gray-900"
          key={formatTime(time)}
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {formatTime(time)}
        </motion.div>
        <motion.div
          className="text-sm text-gray-500"
          key={formatDate(time)}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {formatDate(time)}
        </motion.div>
      </div>
    </div>
  );
}
