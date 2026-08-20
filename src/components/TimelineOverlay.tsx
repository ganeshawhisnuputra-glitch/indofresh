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
    // Safe horizontal padding so content never touches viewport edge on mobile (min 16px safe margin)
    width: "calc(100% - 2rem)",
  };

  // Horizontal placement
  switch (layout.horizontal) {
    case "left":
      base.left = "clamp(1rem, 4vw, 3.5rem)";
      base.right = "auto";
      break;
    case "right":
      base.right = "clamp(1rem, 4vw, 3.5rem)";
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

  // Vertical placement (safe top padding so text never overlaps with header wordmark)
  switch (layout.vertical) {
    case "top":
      base.top = "clamp(4.75rem, 11vh, 7rem)";
      break;
    case "bottom":
      base.bottom = "clamp(3.5rem, 8vh, 6.5rem)";
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
    background: "rgba(5, 10, 20, 0.68)",
    backdropFilter: `blur(${glass.blur ?? "24px"})`,
    WebkitBackdropFilter: `blur(${glass.blur ?? "24px"})`,
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "20px",
    padding: "clamp(1.25rem, 3vw, 1.75rem) clamp(1.5rem, 3.5vw, 2rem)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  };
}

// ─── Animation presets ────────────────────────────────────────────────────────

const FADE_OUT = { opacity: 0, y: -12, filter: "blur(4px)" };
const FADE_IN  = { opacity: 1, y:   0, filter: "blur(0px)"  };
const EASE     = [0.21, 0.47, 0.32, 0.98] as const;
const TRANSITION = { duration: 0.7, ease: EASE };

// Entrance: subtle upward motion
const ENTRANCE_INITIAL = { opacity: 0, y: 12, filter: "blur(8px)" };

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "Cotton Candy Grape": "/fruit-products/Cotton Candy Grape.png",
  "Muscat Grape": "/fruit-products/Muscat Grape.png",
  "Granny Smith Apple": "/fruit-products/Granny Smith Apple.png",
  "Kiwi": "/fruit-products/Kiwi.png",
  "Pear": "/fruit-products/Pear.png",
  "Longan": "/fruit-products/Longan.png",
  "Wangshan Apple": "/fruit-products/Wangshan Apple.png",
  "Orange": "/fruit-products/Oranges.png",
  "Wangshan Pear": "/fruit-products/Wangshan Pear.png",
};

// ─── Per-scene text renderer ──────────────────────────────────────────────────

function SceneText({
  scene,
  onSelectProduct,
}: {
  scene: Scene;
  onSelectProduct?: (product: { name: string; image: string }) => void;
}) {
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
      {/* Eyebrow */}
      {scene.eyebrow && (
        <motion.p
          className="text-[0.65rem] font-bold tracking-[0.25em] uppercase mb-3 block text-[#DF2028]"
          {...item(0.1)}
        >
          {scene.eyebrow}
        </motion.p>
      )}

      {/* Title */}
      {scene.title && (
        <motion.h1
          className={
            isHero
              ? "leading-[1.08] tracking-[-0.03em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              : "leading-[1.15] tracking-[-0.025em] text-white font-extrabold"
          }
          style={{
            whiteSpace: "pre-line",
            fontWeight: isHero ? 800 : 700,
            fontSize: isHero
              ? "clamp(2.75rem, 4.5vw, 4.25rem)"
              : "clamp(1.85rem, 3vw, 2.5rem)",
          }}
          {...item(0.25)}
        >
          {scene.title}
        </motion.h1>
      )}

      {/* Subtitle */}
      {scene.subtitle && (
        <motion.p
          className={
            isHero
              ? "mt-3 font-medium leading-[1.4] text-white/85 tracking-[0.18em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              : "mt-3 font-semibold leading-[1.4] text-white/90"
          }
          style={{
            fontSize: isHero
              ? "clamp(0.85rem, 1.3vw, 1.125rem)"
              : "clamp(1.1rem, 1.6vw, 1.35rem)",
          }}
          {...item(0.35)}
        >
          {scene.subtitle}
        </motion.p>
      )}

      {/* Subtle Red Divider Accent (Hero only) */}
      {isHero && (
        <motion.div
          className="mx-auto mt-4 mb-1 w-10 h-[2px] rounded-full bg-[#DF2028] shadow-[0_0_10px_rgba(223,32,40,0.5)]"
          {...item(0.4)}
        />
      )}

      {/* Primary Green CTA Button (Hero only) */}
      {isHero && (
        <motion.div
          className="mt-5 flex justify-center pointer-events-auto"
          {...item(0.45)}
        >
          <button
            onClick={() => {
              const scrollY = frameToScrollY(46);
              window.scrollTo({ top: scrollY, behavior: "smooth" });
            }}
            className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full text-[0.75rem] font-bold tracking-[0.16em] uppercase text-white bg-[#10B981] hover:bg-[#059669] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
          >
            <span>Explore Network</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path
                d="M2.5 6h7M6.5 2.5L10 6l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Tagline */}
      {scene.tagline && (
        <motion.p
          className="mt-2.5 font-medium leading-[1.4] tracking-[0.05em] text-white/80 uppercase text-xs"
          {...item(0.4)}
        >
          {scene.tagline}
        </motion.p>
      )}

      {/* Body */}
      {scene.body && (
        <motion.p
          className="mt-3.5 font-normal leading-[1.65] text-white/85"
          style={{
            fontSize: "clamp(0.875rem, 1.2vw, 1.05rem)",
            maxWidth: isHero ? "580px" : "100%",
          }}
          {...item(0.45)}
        >
          {scene.body}
        </motion.p>
      )}

      {/* Body 2 */}
      {scene.body2 && (
        <motion.p
          className="mt-3 font-normal leading-[1.65] text-white/75"
          style={{
            fontSize: "clamp(0.85rem, 1.15vw, 0.98rem)",
          }}
          {...item(0.5)}
        >
          {scene.body2}
        </motion.p>
      )}
      {/* Key products */}
      {scene.products && scene.products.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2 list-none" style={{ justifyContent: textAlign === "center" ? "center" : "flex-start" }}>
          {scene.products.map((product, i) => {
            const imagePath = PRODUCT_IMAGE_MAP[product];
            if (!imagePath) {
              // Text-only pill (e.g. Durian) — no image popup, no camera icon
              return (
                <motion.li
                  key={product}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-[0.75rem] font-medium"
                  {...item(0.55 + i * 0.06)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DF2028]" />
                  <span>{product}</span>
                </motion.li>
              );
            }
            return (
              <motion.li
                key={product}
                {...item(0.55 + i * 0.06)}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectProduct?.({ name: product, image: imagePath });
                  }}
                  className="group/pill flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/40 text-white text-[0.75rem] font-medium transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] cursor-pointer shadow-sm pointer-events-auto"
                  title={`Click to view ${product}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DF2028] group-hover/pill:bg-[#FF3B44] transition-colors" />
                  <span>{product}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white/40 group-hover/pill:text-white transition-colors ml-0.5"
                  >
                    <path
                      d="M15 8h.01M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 16l5-5c.928-.893 2.072-.893 3 0l5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}

      {/* Bullets */}
      {scene.bullets && scene.bullets.length > 0 && (
        <ul className="mt-4 space-y-2.5 list-none">
          {scene.bullets.map((bullet, i) => (
            <motion.li
              key={bullet}
              className="flex items-start gap-2.5 font-normal text-white/85 text-xs leading-[1.6]"
              {...item(0.55 + i * 0.08)}
            >
              <span className="mt-[6px] flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#DF2028]" />
              {bullet}
            </motion.li>
          ))}
        </ul>
      )}

      {/* Paired bullets */}
      {scene.bulletItems && scene.bulletItems.length > 0 && (
        <div className="mt-4 space-y-4">
          {scene.bulletItems.map((item_data, i) => (
            <motion.div key={item_data.title} {...item(0.55 + i * 0.1)}>
              <p className="font-bold leading-tight text-white text-xs sm:text-sm">
                {item_data.title}
              </p>
              <p className="mt-1 font-normal leading-[1.6] text-white/80 text-[0.75rem] sm:text-xs">
                {item_data.body}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stat pills */}
      {scene.stats && scene.stats.length > 0 && (
        <motion.div
          className="mt-5 flex items-center gap-6 flex-wrap"
          style={{ justifyContent: textAlign === "center" ? "center" : "flex-start" }}
          {...item(0.6)}
        >
          {scene.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <span className="text-[1.4rem] font-extrabold tracking-tight text-white">
                {stat.value}
              </span>
              <span className="text-[0.55rem] font-semibold tracking-[0.2em] text-white/50 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Official GLOBALG.A.P. Certificates (Scene 06 — Freshness From Every Corner) */}
      {scene.id === 6 && (
        <motion.div
          className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5"
          {...item(0.55)}
        >
          <div className="flex flex-col">
            <span className="text-[0.55rem] font-bold tracking-[0.22em] text-white/50 uppercase">
              International Certification
            </span>
            <span className="text-[0.78rem] font-semibold text-white tracking-tight">
              GLOBALG.A.P. Certified Standards
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 mt-0.5">
            <div className="overflow-hidden rounded-lg border border-white/15 max-w-[130px] sm:max-w-[150px] bg-white transition-transform hover:scale-[1.01]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/certificates/globalgap-cert-left.jpg"
                alt="GLOBALG.A.P. Certificate SCS Global"
                className="w-full h-auto object-contain block"
              />
            </div>
            <div className="overflow-hidden rounded-lg border border-white/15 max-w-[130px] sm:max-w-[150px] bg-white transition-transform hover:scale-[1.01]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/certificates/globalgap-cert-right.jpg"
                alt="GLOBALG.A.P. Certificate WQS"
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>
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
        style={{ 
          justifyContent: "center",
          transform: isHero ? "translateY(-8vh)" : "none"
        }}
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
        <span className="text-[0.55rem] font-semibold tracking-[0.2em] text-white/40 drop-shadow-md">
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
                  ? "#DF2028"
                  : "rgba(255,255,255,0.4)",
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
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; image: string } | null>(null);
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

  // Close product lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          className="absolute top-0 left-0 right-0 flex items-center px-8 pt-8 md:px-12 md:pt-10 pointer-events-none"
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
            <SceneText
              key={activeScene.id}
              scene={activeScene}
              onSelectProduct={(product) => setSelectedProduct(product)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Fruit Product Lightbox Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-[#070D19] border border-white/20 rounded-2xl shadow-2xl p-5 sm:p-8 flex flex-col items-center max-h-[92vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                aria-label="Close product view"
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-[#DF2028] border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Product Header */}
              <div className="text-center mb-4">
                <span className="text-[0.6rem] font-bold tracking-[0.25em] uppercase text-[#DF2028] mb-1 block">
                  INDOFRESH IMPORT SELECTION
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {selectedProduct.name}
                </h3>
              </div>

              {/* Product Image Container — 100% COMPLETE image, zero cropping, object-contain */}
              <div className="relative w-full flex-1 flex items-center justify-center bg-[#020612]/70 rounded-xl p-4 sm:p-6 border border-white/10">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="max-w-full max-h-[68vh] w-auto h-auto object-contain drop-shadow-2xl select-none"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <p className="mt-4 text-xs text-white/50 font-medium tracking-wider uppercase text-center">
                Authentic Packaging & Brand Asset
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── UI chrome (outside main overlay for correct z-stacking) ───────── */}
      <SceneBadge sceneId={activeScene.id} label={activeScene.label} visible={isVisible} />
      <ProgressNav activeSceneIndex={activeSceneIndex} />
      <ScrollHint visible={showScrollHint} />
    </>
  );
}
