"use client";

import { motion } from "framer-motion";

interface LoadingScreenProps {
  /** 0–100. Driven by real ImageBitmap decode progress from HeroCanvas. */
  progress: number;
}

/**
 * LoadingScreen — V2
 *
 * Premium fullscreen loading experience.
 * Progress bar is driven by the real frame decode count — not a fake timer.
 * Never shows a white flash. Background matches the site's #050505.
 * Exit animation fades out in 1.1s before the canvas becomes interactive.
 */
export default function LoadingScreen({ progress }: LoadingScreenProps) {
  const pct = Math.min(Math.round(progress), 100);
  const display = String(pct).padStart(3, "0");

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ zIndex: 9999, background: "#050505" }}
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
      }}
      role="status"
      aria-label="Loading PT Indofresh experience"
    >
      {/* Ambient radial — subtle green tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(30,50,30,0.28) 0%, transparent 70%)",
        }}
      />

      {/* Wordmark */}
      <motion.div
        className="relative z-10 flex flex-col items-center mb-14"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="text-[10px] font-light tracking-[0.3em] uppercase mb-2"
          style={{ color: "rgba(245,245,245,0.22)" }}
        >
          PT
        </span>
        <span
          className="text-[2.6rem] md:text-[3rem] font-semibold tracking-[0.14em] uppercase leading-none"
          style={{ color: "rgba(245,245,245,0.94)" }}
        >
          INDOFRESH
        </span>
        <motion.span
          className="mt-3 text-[9px] font-light tracking-[0.24em] uppercase"
          style={{ color: "rgba(245,245,245,0.28)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          The Fresh Fruit People
        </motion.span>
      </motion.div>

      {/* Progress */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-3.5 w-44"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.55 }}
      >
        {/* Track */}
        <div
          className="w-full h-px overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full origin-left"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.65))",
              transition: "width 80ms linear",
            }}
          />
        </div>

        {/* Percentage */}
        <div className="flex items-baseline gap-0.5">
          <span
            className="text-[11px] font-light tracking-[0.24em] tabular-nums"
            style={{ color: "rgba(245,245,245,0.3)" }}
            aria-hidden="true"
          >
            {display}
          </span>
          <span
            className="text-[9px] font-light"
            style={{ color: "rgba(245,245,245,0.15)" }}
            aria-hidden="true"
          >
            %
          </span>
        </div>
      </motion.div>

      {/* Copyright */}
      <motion.p
        className="absolute bottom-7 text-[8px] font-light tracking-[0.2em] uppercase"
        style={{ color: "rgba(245,245,245,0.1)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        © {new Date().getFullYear()} PT Indofresh. All rights reserved.
      </motion.p>
    </motion.div>
  );
}
