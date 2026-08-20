"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroCanvasProps {
  /** True once the loading screen is dismissed — canvas fades in */
  isVisible: boolean;
  /**
   * Called as each frame finishes decoding.
   * @param loaded  number of frames decoded so far
   * @param total   total number of frames in the sequence
   */
  onProgress: (loaded: number, total: number) => void;
  /** Called once ALL frames have been decoded (optional signal) */
  onAllFramesReady?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_FRAMES = 293;

function getFrameUrl(index: number, isMobile: boolean): string {
  const padded = String(index).padStart(3, "0");
  const folder = isMobile ? "frames_mobile" : "frames";
  const ext = index <= 45 ? "png" : "webp";
  return `/${folder}/frame_${padded}.${ext}`;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * HeroCanvas — Targeted Responsive & Progressive Performance Architecture
 */
export default function HeroCanvas({
  isVisible,
  onProgress,
  onAllFramesReady,
}: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Mobile vs Desktop detection ref ───────────────────────────────────────
  const isMobileRef = useRef<boolean>(false);

  // ── Frame pool ──────────────────────────────────────────────────────────────
  const framesRef = useRef<(ImageBitmap | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
  // Track in-flight fetch promises to prevent duplicate fetches
  const fetchingRef = useRef<Set<number>>(new Set());

  // Current rendered frame index
  const currentFrameRef = useRef<number>(0);
  // Set to true whenever currentFrameRef changes — RAF loop clears it
  const isDirtyRef = useRef<boolean>(true);
  // Running RAF handle
  const rafRef = useRef<number>(0);
  // Total frames decoded so far
  const loadedCountRef = useRef<number>(0);

  // ── Canvas sizing ──────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }
      isDirtyRef.current = true;
    }
  }, []);

  // ── Cover-fit draw ─────────────────────────────────────────────────────────
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bitmap = framesRef.current[frameIndex];
    if (!bitmap) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = bitmap.width;
    const ih = bitmap.height;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const ox = (cw - sw) / 2;
    const oy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(bitmap, ox, oy, sw, sh);
  }, []);

  // ── RAF render loop ────────────────────────────────────────────────────────
  const startRenderLoop = useCallback(() => {
    const tick = () => {
      if (isDirtyRef.current) {
        drawFrame(currentFrameRef.current);
        isDirtyRef.current = false;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [drawFrame]);

  // ── Single frame decoder ───────────────────────────────────────────────────
  const loadFrame = useCallback(
    async (index: number): Promise<void> => {
      if (framesRef.current[index] !== null || fetchingRef.current.has(index)) return;
      fetchingRef.current.add(index);
      try {
        const url = getFrameUrl(index, isMobileRef.current);
        const res = await fetch(url);
        if (!res.ok) return;
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob, {
          premultiplyAlpha: "none",
          colorSpaceConversion: "none",
          resizeQuality: "high",
        });
        framesRef.current[index] = bitmap;
        loadedCountRef.current++;
        onProgress(loadedCountRef.current, TOTAL_FRAMES);

        if (index === currentFrameRef.current || index === 0) {
          isDirtyRef.current = true;
        }
      } catch {
        // Silently skip
      } finally {
        fetchingRef.current.delete(index);
      }
    },
    [onProgress]
  );

  // ── Priority & Nearby Viewport Loader ─────────────────────────────────────
  const loadNearbyFrames = useCallback((targetFrame: number) => {
    const start = clamp(targetFrame - 5, 0, TOTAL_FRAMES - 1);
    const end = clamp(targetFrame + 15, 0, TOTAL_FRAMES - 1);
    for (let f = start; f <= end; f++) {
      if (framesRef.current[f] === null && !fetchingRef.current.has(f)) {
        loadFrame(f);
      }
    }
  }, [loadFrame]);

  // ── Priority Loader (Initial gate + progressive background stream) ────────
  const loadAllFrames = useCallback(async () => {
    // Detect mobile viewport
    if (typeof window !== "undefined") {
      isMobileRef.current = window.innerWidth < 768;
    }

    // 1. Frame 0 — immediate paint
    await loadFrame(0);
    isDirtyRef.current = true;

    // 2. Initial batch (frames 1..25) for instant presentation
    const INITIAL_BATCH = 25;
    for (let i = 1; i <= INITIAL_BATCH; i += 5) {
      const chunk = Array.from(
        { length: Math.min(5, INITIAL_BATCH - i + 1) },
        (_, k) => i + k
      );
      await Promise.all(chunk.map(loadFrame));
    }

    // 3. Remaining frames — background stream in 5-frame chunks with yields
    for (let start = INITIAL_BATCH + 1; start < TOTAL_FRAMES; start += 5) {
      const end = Math.min(start + 5, TOTAL_FRAMES);
      const chunk = Array.from({ length: end - start }, (_, i) => start + i);
      await Promise.all(chunk.map(loadFrame));
      await new Promise<void>((r) => setTimeout(r, 16));
    }

    onAllFramesReady?.();
  }, [loadFrame, onAllFramesReady]);

  // ── Subscribe to frame events from the scroll engine ──────────────────────
  useEffect(() => {
    const handler = ((e: CustomEvent<{ frame: number }>) => {
      const frame = clamp(e.detail.frame, 0, TOTAL_FRAMES - 1);

      // Preload nearby frames around current scroll target
      loadNearbyFrames(frame);

      // Walk backwards from target to find nearest decoded frame
      for (let i = frame; i >= 0; i--) {
        if (framesRef.current[i] !== null) {
          if (i !== currentFrameRef.current) {
            currentFrameRef.current = i;
            isDirtyRef.current = true;
          }
          break;
        }
      }
    }) as EventListener;

    window.addEventListener("indofresh:frame", handler, { passive: true });
    return () => window.removeEventListener("indofresh:frame", handler);
  }, [loadNearbyFrames]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    startRenderLoop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [startRenderLoop]);

  useEffect(() => {
    loadAllFrames();
  }, [loadAllFrames]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <canvas
      ref={canvasRef}
      id="hero-canvas"
      aria-label="PT Indofresh cinematic frame sequence"
      role="img"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "opacity",
      }}
    />
  );
}
