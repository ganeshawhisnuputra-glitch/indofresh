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

const TOTAL_FRAMES = 297;
const BASE_PATH = "frames";
const BATCH_SIZE = 20;

function getFrameUrl(index: number): string {
  const padded = String(index).padStart(3, "0");
  return `/${BASE_PATH}/frame_${padded}_delay-0.066s.webp`;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * HeroCanvas — V2 Architecture
 *
 * RESPONSIBILITIES (strictly limited):
 *  1. Load the 297-frame ImageBitmap pool with priority ordering.
 *  2. Subscribe to the `indofresh:frame` custom event (dispatched by the
 *     scroll engine in page.tsx) and render the requested frame.
 *  3. Paint only when the frame changes (dirty-flag RAF loop).
 *  4. Cover-fit scale to fill the viewport at any aspect ratio.
 *  5. Report decode progress via the onProgress callback.
 *
 * DOES NOT:
 *  ✗  Handle wheel events
 *  ✗  Handle touch events
 *  ✗  Maintain any scroll state
 *  ✗  Autoplay
 *  ✗  Use timers or setInterval
 *
 * Scroll input is handled entirely by the scroll engine in page.tsx.
 * This component is a pure frame renderer.
 */
export default function HeroCanvas({
  isVisible,
  onProgress,
  onAllFramesReady,
}: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Frame pool ──────────────────────────────────────────────────────────────
  const framesRef = useRef<(ImageBitmap | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
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
  // Runs at display refresh rate. Repaints only when isDirtyRef is true.
  // Frame NEVER advances on its own — it only draws what currentFrameRef holds.
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
      if (framesRef.current[index] !== null) return;
      try {
        const res = await fetch(getFrameUrl(index));
        if (!res.ok) return;
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob, {
          premultiplyAlpha: "none",
          colorSpaceConversion: "none",
        });
        framesRef.current[index] = bitmap;
        loadedCountRef.current++;
        onProgress(loadedCountRef.current, TOTAL_FRAMES);

        // Frame 0 ready — draw immediately so loading screen has something to
        // reveal when it fades out.
        if (index === 0) {
          isDirtyRef.current = true;
        }
      } catch {
        // Silently skip — sequence stays playable with skipped frames
      }
    },
    [onProgress]
  );

  // ── Priority loader ────────────────────────────────────────────────────────
  // Frame 0 → first batch → rest in background (no UI blocking)
  const loadAllFrames = useCallback(async () => {
    // 1. Frame 0 — immediate paint
    await loadFrame(0);
    isDirtyRef.current = true;

    // 2. First batch — loads before user can scroll past them
    const firstBatch = Array.from(
      { length: Math.min(BATCH_SIZE, TOTAL_FRAMES - 1) },
      (_, i) => i + 1
    );
    await Promise.all(firstBatch.map(loadFrame));

    // 3. Remaining frames — stream in background without blocking
    for (let start = BATCH_SIZE + 1; start < TOTAL_FRAMES; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE, TOTAL_FRAMES);
      await Promise.all(
        Array.from({ length: end - start }, (_, i) => start + i).map(loadFrame)
      );
      // Yield to main thread between batches (prevents long task jank)
      await new Promise<void>((r) => setTimeout(r, 0));
    }

    onAllFramesReady?.();
  }, [loadFrame, onAllFramesReady]);

  // ── Subscribe to frame events from the scroll engine ──────────────────────
  // The scroll engine in page.tsx computes the current frame from window.scrollY
  // and dispatches `indofresh:frame`. This is the only way frames advance.
  useEffect(() => {
    const handler = ((e: CustomEvent<{ frame: number }>) => {
      const frame = clamp(e.detail.frame, 0, TOTAL_FRAMES - 1);

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
  }, []);

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
