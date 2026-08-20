"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import HeroCanvas from "@/components/HeroCanvas";
import TimelineOverlay from "@/components/TimelineOverlay";
import IndonesiaMap from "@/components/IndonesiaMap";
import LoadingScreen from "@/components/LoadingScreen";
import PostMapFlow from "@/components/PostMapFlow";

import {
  scrollToFrame,
  getTotalScrollHeight,
  TOTAL_FRAMES,
} from "@/engine/frameController";

// ─── Loading gate ──────────────────────────────────────────────────────────────
// The loading screen persists until BOTH:
//  1. All frames are decoded (real decode progress = 100%)
//  2. A minimum aesthetic floor has elapsed (so fast connections still see the brand)
const MIN_LOADING_MS = 800;

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
 *  • A hidden div creates the scroll track via height.
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

  // Fast Mobile Loading: Hero initial batch threshold (25 frames) for instant presentation.
  // Remaining frames continue background streaming seamlessly without blocking the user.
  const REQUIRED_INITIAL_FRAMES = 25;
  const loadProgress = Math.min(
    Math.floor((loadedFrames / REQUIRED_INITIAL_FRAMES) * 100),
    100
  );

  // Loading ends when initial hero batch is ready + min aesthetic floor elapsed
  const initialBatchReady = loadedFrames >= REQUIRED_INITIAL_FRAMES;
  const isLoading = !initialBatchReady || !minTimeElapsed;

  // ── Current frame (for IndonesiaMap visibility gate) ─────────────────────
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalScrollTrackHeight, setTotalScrollTrackHeight] = useState(6446);

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

  // 1. Calculate and set total scroll track height
  useEffect(() => {
    const totalHeight = getTotalScrollHeight();
    setTotalScrollTrackHeight(totalHeight);
    document.body.style.overflowX = "hidden";
    return () => {
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
       * Invisible Scroll Track Spacer — Creates document height for 293 frame scroll sequence
       */}
      <div
        style={{ height: `${totalScrollTrackHeight}px` }}
        className="pointer-events-none"
        aria-hidden="true"
      />

      {/*
       * Layer 4 — Post-Map Business Journey Flow
       */}
      <PostMapFlow />

      {/*
       * Layer 5 — Loading Screen
       * position:fixed, z-index:9999
       */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loading" progress={loadProgress} />
        )}
      </AnimatePresence>
    </>
  );
}
