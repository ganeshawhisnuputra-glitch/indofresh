"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import HeroCanvas from "@/components/HeroCanvas";
import TimelineOverlay from "@/components/TimelineOverlay";
import IndonesiaMap from "@/components/IndonesiaMap";
import LoadingScreen from "@/components/LoadingScreen";

import {
  scrollToFrame,
  getTotalScrollHeight,
  TOTAL_FRAMES,
} from "@/engine/frameController";

// ─── Loading gate ──────────────────────────────────────────────────────────────
// The loading screen persists until BOTH:
//  1. All frames are decoded (real decode progress = 100%)
//  2. A minimum aesthetic floor has elapsed (so fast connections still see the brand)
const MIN_LOADING_MS = 2200;

// ─── Page component ────────────────────────────────────────────────────────────

/**
 * Home — V2
 *
 * Layer stack (bottom → top):
 *
 *  z-0   HeroCanvas      — position:fixed, always fills viewport, pointer-events:none
 *  z-10  TimelineOverlay — position:fixed, text + progress nav + scroll hint
 *  z-20  IndonesiaMap    — position:fixed, only visible in Scene 12
 *  z-9999 LoadingScreen  — position:fixed, removed after frames ready + min time
 *
 * Scroll engine:
 *  • document.body.style.height = getTotalScrollHeight() creates the scroll track.
 *  • All visual elements are position:fixed — they NEVER move.
 *  • window.addEventListener('scroll') reads window.scrollY and dispatches
 *    indofresh:frame events consumed by HeroCanvas, TimelineOverlay,
 *    and IndonesiaMap (via currentFrame state).
 *
 * Single source of truth: window.scrollY → scrollToFrame() → currentFrame.
 * No timers. No autoplay. No virtual scroll accumulator.
 */
export default function Home() {
  // ── Loading state ────────────────────────────────────────────────────────
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Real decode progress as percentage (0–100)
  const loadProgress = Math.min(
    Math.floor((loadedFrames / TOTAL_FRAMES) * 100),
    100
  );

  // Loading ends when both conditions are met
  const allFramesDecoded = loadedFrames >= TOTAL_FRAMES;
  const isLoading = !allFramesDecoded || !minTimeElapsed;

  // ── Current frame (for IndonesiaMap visibility gate) ─────────────────────
  const [currentFrame, setCurrentFrame] = useState(0);

  // ── Refs (never trigger re-renders) ──────────────────────────────────────
  const lastFrameRef = useRef(0);
  const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Callbacks ────────────────────────────────────────────────────────────

  // HeroCanvas calls onProgress(loaded, total) — we only need `loaded`
  // but accept both args so the TypeScript signature matches.
  const handleProgress = useCallback((loaded: number, _total: number) => {
    setLoadedFrames(loaded);
  }, []);

  // ── Effects ──────────────────────────────────────────────────────────────

  // 1. Set body height = total scroll height, creating the "invisible scroll track"
  //    All fixed elements are NOT in document flow, so this is the only thing
  //    that makes the document tall enough to scroll.
  useEffect(() => {
    const totalHeight = getTotalScrollHeight();
    document.body.style.height = `${totalHeight}px`;
    // Prevent horizontal overflow from the spacer
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.height = "";
      document.body.style.overflowX = "";
    };
  }, []);

  // 2. Minimum aesthetic loading floor
  useEffect(() => {
    minTimerRef.current = setTimeout(
      () => setMinTimeElapsed(true),
      MIN_LOADING_MS
    );
    return () => {
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
    };
  }, []);

  // 3. Scroll engine: native browser scroll → frame index → custom events
  //    This is the ONLY place that reads window.scrollY.
  //    It dispatches indofresh:frame events consumed by:
  //      - HeroCanvas (renders the frame)
  //      - TimelineOverlay (drives scene text)
  //      - This component (updates currentFrame for IndonesiaMap)
  useEffect(() => {
    const handleScroll = () => {
      const frame = scrollToFrame(window.scrollY);

      if (frame !== lastFrameRef.current) {
        lastFrameRef.current = frame;

        // Dispatch to all subscribers
        window.dispatchEvent(
          new CustomEvent("indofresh:frame", { detail: { frame } })
        );

        // Update React state for IndonesiaMap (only re-renders when scene
        // 12 boundary is crossed, not on every scroll pixel)
        setCurrentFrame((prev) => {
          const wasInScene12 = prev >= 291;
          const isInScene12 = frame >= 291;
          if (wasInScene12 !== isInScene12 || isInScene12) return frame;
          return prev;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial call — sets frame 0 state on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/*
       * Layer 1 — HeroCanvas
       * position:fixed (set inline in the component)
       * Renders frames. Controlled by indofresh:frame events.
       */}
      <HeroCanvas
        isVisible={!isLoading}
        onProgress={handleProgress}
      />

      {/*
       * Layer 2 — TimelineOverlay
       * position:fixed (set inline in each child)
       * Drives scene text, progress nav, scroll hint.
       */}
      <TimelineOverlay isVisible={!isLoading} />

      {/*
       * Layer 3 — IndonesiaMap (Scene 12 only)
       * position:fixed, z-index:20
       * Visible only when currentFrame >= 291.
       */}
      <IndonesiaMap currentFrame={currentFrame} />

      {/*
       * Layer 4 — Loading Screen
       * position:fixed, z-index:9999
       * AnimatePresence plays the exit animation before unmounting.
       */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loading" progress={loadProgress} />
        )}
      </AnimatePresence>
    </>
  );
}
