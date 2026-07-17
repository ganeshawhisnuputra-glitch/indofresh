"use client";

import { useEffect, useState, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SCENES,
  Scene,
  SceneLayout,
  GlassConfig,
  getActiveScene,
  INDONESIA_SCENE_ID,
} from "@/engine/timelineData";
import { frameToScrollY } from "@/engine/frameController";

// ─── Layout helpers ────────────────────────────────────────────────────────────

/**
 * Computes CSS position styles for the text container based on the scene's
 * layout specification. Returns values suitable for an `position: absolute`
 * element nested inside the `position: fixed` overlay shell.
 *
 * IMPORTANT: We deliberately avoid using `transform: translateX/Y(-50%)` for
 * centering on framer-motion elements that also animate with `y`, to prevent
 * transform composition conflicts. Instead:
 *  • Horizontal centering: `left: 0; right: 0; marginLeft: auto; marginRight: auto`
 *  • Vertical middle: `top: 50%` + the framer-motion `y` initial value starts
 *    from -50% of the element height via the wrapper approach below.
 *
 * For middle-vertical alignment we use a wrapping flex container to avoid
 * the translate conflicts entirely.
 */
function getPositionStyle(layout: SceneLayout): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    maxWidth: layout.maxWidth,
    // Safe horizontal padding so content never touches viewport edge on mobile
    width: "calc(100% - 3rem)",
  };

  // Horizontal placement
  switch (layout.horizontal) {
    case "left":
      base.left = "clamp(1.5rem, 5vw, 3.5rem)";
      base.right = "auto";
      break;
    case "right":
      base.right = "clamp(1.5rem, 5vw, 3.5rem)";
      base.left = "auto";
      break;
    case "center":
    default:
      base.left = 0;
      base.right = 0;
      base.marginLeft = "auto";
      base.marginRight = "auto";
      break;
  }

  // Vertical placement
  switch (layout.vertical) {
    case "top":
      base.top = "clamp(5rem, 12vh, 8rem)";
      break;
    case "bottom":
      base.bottom = "clamp(4rem, 10vh, 7rem)";
      break;
    case "middle":
    default:
      // We handle 'middle' via a flex wrapper (see SceneText below).
      // This style is a fallback used when the wrapper isn't needed.
      base.top = "50%";
      base.transform = "translateY(-50%)";
      break;
  }

  return base;
}

/**
 * Returns the backdrop glass panel styles (Fix 08).
 * Dark semi-transparent background, strong blur, rounded corners, large padding.
 */
function getGlassStyle(glass: GlassConfig): React.CSSProperties {
  if (!glass.enabled) return {};
  return {
    background: `rgba(0,0,0,${glass.opacity !== undefined ? Math.min(glass.opacity * 8, 0.72) : 0.72})`,
    backdropFilter: `blur(${glass.blur ?? "40px"})`,
    WebkitBackdropFilter: `blur(${glass.blur ?? "40px"})`,
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "28px",
    padding: "clamp(1.75rem, 3.5vw, 3rem) clamp(2rem, 4vw, 3.5rem)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
  };
}

// ─── Animation presets ────────────────────────────────────────────────────────

const FADE_OUT = { opacity: 0, y: -20, filter: "blur(8px)" };
const FADE_IN  = { opacity: 1, y:   0, filter: "blur(0px)"  };
const EASE     = [0.25, 0.46, 0.45, 0.94] as const;
const TRANSITION = { duration: 0.5, ease: EASE };

// Entrance: from below (y: 20 → 0). Exit: upward (y: 0 → -20), per Doc 06.
const ENTRANCE_INITIAL = { opacity: 0, y: 24, filter: "blur(8px)" };

// ─── Per-scene text renderer ──────────────────────────────────────────────────

function SceneText({ scene }: { scene: Scene }) {
  const { layout, glass } = scene;
  const isHero   = scene.id === 1;
  const isMid    = layout.vertical === "middle";
  const textAlign = layout.horizontal === "center" ? "center"
                  : layout.horizontal === "right"  ? "right"
                  : "left";

  // For 'middle' vertical we render the absolute-positioned container via a
  // flex column wrapper so we don't fight framer-motion's `y` transform.
  const posStyle  = isMid ? undefined : getPositionStyle(layout);
  const glassStyle = getGlassStyle(glass);

  /** Shared per-element animation helper — entrance from below, exit upward */
  const item = (delay: number) => ({
    initial:    ENTRANCE_INITIAL,
    animate:    FADE_IN,
    exit:       FADE_OUT,
    transition: { ...TRANSITION, delay },
  });

  // ── Text content ─────────────────────────────────────────────────────────
  const content = (
    <div style={{ ...glassStyle, textAlign }}>
      {/* Eyebrow — Fix 06/07: bold, more visible */}
      {scene.eyebrow && (
        <motion.p
          className="text-[0.7rem] font-bold tracking-[0.3em] uppercase mb-4"
          style={{ color: "rgba(255,255,255,0.65)", textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}
          {...item(0.06)}
        >
          {scene.eyebrow}
        </motion.p>
      )}

      {/* Title — Fix 06: 80-110px hero, 60-72px section; Fix 07: 100% opacity; strong shadow */}
      {scene.title && (
        <motion.h1
          className="leading-[1.0] tracking-[-0.035em] text-white"
          style={{
            whiteSpace: "pre-line",
            fontWeight: isHero ? 800 : 700,
            fontSize: isHero
              ? "clamp(5rem, 7.5vw, 6.875rem)"   // 80–110px
              : "clamp(3.75rem, 5vw, 4.5rem)",   // 60–72px
            textShadow: "0 4px 32px rgba(0,0,0,0.95), 0 8px 64px rgba(0,0,0,0.8)",
          }}
          {...item(scene.eyebrow ? 0.14 : 0.08)}
        >
          {scene.title}
        </motion.h1>
      )}

      {/* Subtitle — Fix 06: 34-40px */}
      {scene.subtitle && (
        <motion.p
          className="mt-5 font-semibold leading-[1.4] text-white/90"
          style={{
            fontSize: isHero ? "clamp(2.125rem, 2.8vw, 2.5rem)" : "clamp(1.5rem, 2vw, 2rem)",
            textShadow: "0 2px 20px rgba(0,0,0,0.9)",
          }}
          {...item(0.22)}
        >
          {scene.subtitle}
        </motion.p>
      )}

      {/* Tagline — Fix 06: 28-34px, semibold, high opacity */}
      {scene.tagline && (
        <motion.p
          className="mt-4 font-semibold leading-[1.4] tracking-[-0.01em]"
          style={{
            fontSize: "clamp(1.75rem, 2.4vw, 2.125rem)",   // 28–34px
            color: "rgba(255,255,255,0.80)",
            textShadow: "0 2px 20px rgba(0,0,0,0.9)",
          }}
          {...item(0.22)}
        >
          {scene.tagline}
        </motion.p>
      )}

      {/* Body — Fix 06: 24-30px, semibold; Fix 07: 95% opacity; strong shadow */}
      {scene.body && (
        <motion.p
          className="mt-5 font-semibold leading-[1.75]"
          style={{
            fontSize: "clamp(1.5rem, 2vw, 1.875rem)",    // 24–30px
            color: "rgba(255,255,255,0.95)",
            textShadow: "0 2px 20px rgba(0,0,0,0.9)",
          }}
          {...item(scene.tagline ? 0.35 : scene.title ? 0.25 : 0.12)}
        >
          {scene.body}
        </motion.p>
      )}

      {/* Body 2 — Fix 06: 22-26px */}
      {scene.body2 && (
        <motion.p
          className="mt-5 font-semibold leading-[1.75]"
          style={{
            fontSize: "clamp(1.375rem, 1.8vw, 1.625rem)",   // 22–26px
            color: "rgba(255,255,255,0.85)",
            textShadow: "0 2px 16px rgba(0,0,0,0.9)",
          }}
          {...item(0.4)}
        >
          {scene.body2}
        </motion.p>
      )}
      {/* Key products — Fix 06: 22-26px, semibold, 95% opacity */}
      {scene.products && scene.products.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 list-none" style={{ textAlign: 'left' }}>
          {scene.products.map((product, i) => (
            <motion.li
              key={product}
              className="flex items-center gap-2.5 font-semibold"
              style={{
                fontSize: "clamp(1.375rem, 1.8vw, 1.625rem)",  // 22–26px
                color: "rgba(255,255,255,0.92)",
                textShadow: "0 2px 16px rgba(0,0,0,0.9)",
              }}
              {...item(0.45 + i * 0.10)}
            >
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }} />
              {product}
            </motion.li>
          ))}
        </ul>
      )}

      {/* Bullets — Fix 06: 22-26px, semibold; Fix 07: 95% */}
      {scene.bullets && scene.bullets.length > 0 && (
        <ul className="mt-5 space-y-3 list-none">
          {scene.bullets.map((bullet, i) => (
            <motion.li
              key={bullet}
              className="flex items-start gap-3 font-semibold"
              style={{
                fontSize: "clamp(1.375rem, 1.8vw, 1.625rem)",  // 22–26px
                color: "rgba(255,255,255,0.95)",
                textShadow: "0 2px 16px rgba(0,0,0,0.9)",
              }}
              {...item(0.24 + i * 0.08)}
            >
              <span className="mt-[6px] flex-shrink-0 w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.55)" }} />
              {bullet}
            </motion.li>
          ))}
        </ul>
      )}

      {/* Paired bullets — Fix 06: title 28-34px bold, body 22-26px semibold; Fix 07: 95% */}
      {scene.bulletItems && scene.bulletItems.length > 0 && (
        <div className="mt-6 space-y-6">
          {scene.bulletItems.map((item_data, i) => (
            <motion.div key={item_data.title} {...item(0.14 + i * 0.10)}>
              <p
                className="font-bold leading-tight text-white"
                style={{
                  fontSize: "clamp(1.75rem, 2.4vw, 2.125rem)",   // 28–34px
                  textShadow: "0 2px 20px rgba(0,0,0,0.95)",
                }}
              >
                {item_data.title}
              </p>
              <p
                className="mt-1.5 font-semibold leading-[1.65]"
                style={{
                  fontSize: "clamp(1.375rem, 1.8vw, 1.625rem)",  // 22–26px
                  color: "rgba(255,255,255,0.90)",
                  textShadow: "0 2px 16px rgba(0,0,0,0.9)",
                }}
              >
                {item_data.body}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stat pills */}
      {scene.stats && scene.stats.length > 0 && (
        <motion.div
          className="mt-6 flex items-center gap-6 flex-wrap"
          style={{ justifyContent: textAlign === "center" ? "center" : "flex-start" }}
          {...item(0.4)}
        >
          {scene.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <span className="text-[1.6rem] font-semibold tracking-tight text-white/92">
                {stat.value}
              </span>
              <span className="text-[0.6rem] font-medium tracking-[0.18em] text-white/28 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );

  // ── Middle-vertical layout ─────────────────────────────────────────────────
  // Use a flex column occupying the full overlay area so we can center the
  // content block without conflicting with framer-motion's y animation.
  if (isMid) {
    const hJustify =
      layout.horizontal === "center"
        ? "center"
        : layout.horizontal === "right"
        ? "flex-end"
        : "flex-start";

    const hPad =
      layout.horizontal === "left"
        ? "clamp(1.5rem, 5vw, 3.5rem)"
        : layout.horizontal === "right"
        ? "clamp(1.5rem, 5vw, 3.5rem)"
        : "1.5rem";

    return (
      <div
        className="absolute inset-0 flex flex-col items-stretch pointer-events-none"
        style={{ justifyContent: "center" }}
      >
        <div
          className="flex"
          style={{ justifyContent: hJustify, padding: `0 ${hPad}` }}
        >
          <motion.div
            key={scene.id}
            style={{ maxWidth: layout.maxWidth, width: "100%" }}
            initial={FADE_OUT}
            animate={FADE_IN}
            exit={FADE_OUT}
            transition={TRANSITION}
          >
            {content}
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Top / Bottom layout ────────────────────────────────────────────────────
  return (
    <motion.div
      key={scene.id}
      style={{ ...posStyle, pointerEvents: "none" }}
      initial={FADE_OUT}
      animate={FADE_IN}
      exit={FADE_OUT}
      transition={TRANSITION}
    >
      {content}
    </motion.div>
  );
}

// ─── Scroll hint (hero only, disappears after first scroll) ───────────────────

const ScrollHint = memo(function ScrollHint({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="scroll-hint"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.35 } }}
          transition={{ duration: 0.7, delay: 1.4 }}
        >
          <span className="text-[0.5rem] tracking-[0.28em] text-white/20 uppercase">
            Scroll to Explore
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/20">
              <path
                d="M6 1v8M2 7l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <div
            className="relative w-px h-6 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-full"
              style={{ background: "rgba(255,255,255,0.4)" }}
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear", repeatDelay: 0.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─── Scene badge (top-right) ──────────────────────────────────────────────────

const SceneBadge = memo(function SceneBadge({
  sceneId,
  label,
  visible,
}: {
  sceneId: number;
  label: string;
  visible: boolean;
}) {
  if (!visible || sceneId <= 1) return null;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneId}
        className="fixed top-8 right-10 md:right-14 flex flex-col items-end gap-0.5 pointer-events-none z-10"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[0.55rem] font-semibold tracking-[0.2em] text-white/18">
          {String(sceneId).padStart(2, "0")}
        </span>
        <span className="text-[0.5rem] font-light tracking-[0.12em] text-white/12 uppercase">
          {label}
        </span>
      </motion.div>
    </AnimatePresence>
  );
});

// ─── Right-side scroll progress nav ──────────────────────────────────────────

const ProgressNav = memo(function ProgressNav({
  activeSceneIndex,
}: {
  activeSceneIndex: number;
}) {
  const handleClick = (startFrame: number) => {
    const scrollY = frameToScrollY(startFrame);
    window.scrollTo({ top: scrollY, behavior: "smooth" });
  };

  return (
    <nav
      className="fixed right-5 md:right-7 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3"
      aria-label="Section navigation"
    >
      {SCENES.map((scene, index) => {
        const isActive = index === activeSceneIndex;
        return (
          <button
            key={scene.id}
            onClick={() => handleClick(scene.startFrame)}
            className="relative flex items-center justify-end group focus:outline-none"
            aria-label={`Go to ${scene.label}`}
            aria-current={isActive ? "true" : undefined}
          >
            {/* Tooltip */}
            <span
              className="absolute right-6 text-[0.5rem] font-medium tracking-[0.14em] text-white/40 uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}
            >
              {scene.label}
            </span>
            {/* Dot / pill */}
            <motion.div
              animate={{
                width: isActive ? 18 : 4,
                backgroundColor: isActive
                  ? "rgba(245,245,245,0.9)"
                  : "rgba(120,120,120,0.35)",
                opacity: isActive ? 1 : 0.6,
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ height: 4, borderRadius: 2 }}
            />
          </button>
        );
      })}
    </nav>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

interface TimelineOverlayProps {
  isVisible: boolean;
}

/**
 * TimelineOverlay — V3
 *
 * Subscribes to `indofresh:frame` custom events (from the scroll engine in page.tsx).
 * Drives all scene text, glass panels, progress nav, scroll hint, and scene badge.
 *
 * Key improvements over V2:
 *  • Per-scene layout (horizontal + vertical positioning)
 *  • Per-scene glass panel with backdrop-filter
 *  • Per-scene typography sizing
 *  • Scene 02: two separate paragraphs
 *  • Scene 04: individually animated paired bullets
 *  • Middle-vertical layout uses flex centering to avoid framer-motion transform conflicts
 *
 * Never causes HeroCanvas to re-render.
 * Only re-renders when the active SCENE changes — not on every scroll pixel.
 */
export default function TimelineOverlay({ isVisible }: TimelineOverlayProps) {
  const [activeScene, setActiveScene] = useState<Scene>(SCENES[0]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const lastFrameRef = useRef(0);
  const lastSceneIdRef = useRef(SCENES[0].id);

  useEffect(() => {
    const handler = ((e: CustomEvent<{ frame: number }>) => {
      const frame = e.detail.frame;
      lastFrameRef.current = frame;

      if (frame > 2 && !hasScrolled) setHasScrolled(true);

      const scene = getActiveScene(frame);

      // Only update state when the scene actually changes — prevents re-renders
      // on every scroll pixel while inside the same scene.
      if (scene.id !== lastSceneIdRef.current) {
        lastSceneIdRef.current = scene.id;
        setActiveScene(scene);
        const idx = SCENES.findIndex((s) => s.id === scene.id);
        setActiveSceneIndex(idx >= 0 ? idx : 0);
      }
    }) as EventListener;

    window.addEventListener("indofresh:frame", handler, { passive: true });
    return () => window.removeEventListener("indofresh:frame", handler);
  }, [hasScrolled]);

  const isIndonesiaScene = activeScene.id === INDONESIA_SCENE_ID;
  const showScrollHint   = isVisible && !hasScrolled && activeScene.id === 1;

  return (
    <>
      {/* ── Fixed overlay shell ───────────────────────────────────────────── */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        aria-hidden="true"
      >
        {/* ── Wordmark ────────────────────────────────────────────────────── */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center px-8 pt-8 md:px-12 md:pt-10"
          style={{ pointerEvents: isVisible ? "auto" : "none" }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.55rem] font-light tracking-[0.26em] text-white/30 uppercase">
              PT
            </span>
            <span className="text-[0.85rem] font-semibold tracking-[0.14em] text-white/88 uppercase">
              Indofresh
            </span>
          </div>
        </div>

        {/* ── Scene text — hidden while Indonesia interactive scene is active */}
        <AnimatePresence mode="wait">
          {!isIndonesiaScene && (
            <SceneText key={activeScene.id} scene={activeScene} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── UI chrome (outside main overlay for correct z-stacking) ───────── */}
      <SceneBadge sceneId={activeScene.id} label={activeScene.label} visible={isVisible} />
      <ProgressNav activeSceneIndex={activeSceneIndex} />
      <ScrollHint visible={showScrollHint} />
    </>
  );
}
