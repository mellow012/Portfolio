"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface LogoProps {
  variant?: "default" | "compact" | "icon-only";
  className?: string;
}

export function MellowverseLogo({
  variant = "default",
  className = "",
}: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`flex items-center gap-5 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.96 }}
    >
      {/* The M∞ Icon – This IS Mellowverse */}
      <motion.div
        className="relative"
        animate={{ rotate: isHovered ? [0, -3, 3, 0] : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Outer glow */}
        <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

        {/* Main container */}
        <div className="relative w-14 h-14 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 flex items-center justify-center overflow-hidden">
          {/* Animated M → ∞ path */}
          <svg width="42" height="42" viewBox="0 0 120 120" className="drop-shadow-xl">
            <defs>
              <linearGradient id="mellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />   {/* purple-500 */}
                <stop offset="50%" stopColor="#EC4899" />  {/* pink-500 */}
                <stop offset="100%" stopColor="#3B82F6" /> {/* blue-500 */}
              </linearGradient>
            </defs>

            {/* The M that flows into infinity */}
            <motion.path
              d="
                M 30 30 
                L 40 70 
                L 50 40 
                L 60 70 
                L 70 30 
                Q 75 50, 80 70 
                Q 85 90, 90 90 
                Q 80 90, 75 70 
                Q 70 50, 60 30 
                Q 50 50, 40 70 
                Q 30 90, 30 90 
                Q 35 90, 40 70 
                Z
              "
              fill="none"
              stroke="url(#mellowGradient)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0.3, opacity: 0.7 }}
              animate={{
                pathLength: isHovered ? 1 : 0.3,
                opacity: 1,
              }}
              transition={{
                pathLength: { duration: 1.6, ease: "easeInOut" },
                opacity: { duration: 0.8 },
              }}
            />

            {/* Inner glow pulse */}
            <motion.circle
              cx="60"
              cy="60"
              r="8"
              fill="#C084FC"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isHovered ? 0.6 : 0,
                scale: isHovered ? 1.4 : 0,
              }}
              transition={{ duration: 0.8 }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Text */}
      {variant !== "icon-only" && (
        <div className="flex flex-col">
          <motion.h1
            className="text-3xl font-bold italic mellowverse-text"
            style={{
              backgroundSize: "200% auto",
            }}
            animate={{
              backgroundPosition: isHovered ? ["0%", "200%"] : "0%",
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            Mellowverse
          </motion.h1>

          {variant !== "compact" && (
            <motion.p
              className="text-[11px] font-medium tracking-widest text-muted-foreground/70 mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              DEVELOPER · DESIGNER
            </motion.p>
          )}
        </div>
      )}
    </motion.div>
  );
}