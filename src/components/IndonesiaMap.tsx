"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BRANCHES,
  Branch,
  getWhatsAppUrl,
  getMapsUrl,
  formatPhoneDisplay,
} from "@/data/branches";
import {
  INDONESIA_START_FRAME,
  INDONESIA_MARKERS_FRAME,
} from "@/engine/timelineData";
import { useEditor } from "@/editor/EditorContext";

// ─── Official marker appearance order (Fix 04) ────────────────────────────────
// 1. Jakarta (Ancol)  id:1
// 2. Marunda          id:2
// 3. Semarang         id:3
// 4. Surabaya         id:4
// 5. Bali             id:5
// 6. Makassar         id:6
// 7. Balikpapan       id:8  ← appears 7th
// 8. Palembang        id:7  ← appears 8th
// Delay between markers: 120ms (Fix 04)
const MARKER_ORDER: Record<number, number> = {
  1: 0, // Jakarta (Ancol)
  2: 1, // Marunda
  3: 2, // Semarang
  4: 3, // Surabaya
  5: 4, // Bali
  6: 5, // Makassar
  8: 6, // Balikpapan (7th to appear)
  7: 7, // Palembang  (8th to appear)
};
const MARKER_STAGGER_MS = 0.12; // 120ms between each marker (Fix 04)

// ─── Icons ────────────────────────────────────────────────────────────────────

function WaIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Card body ─────────────────────────────────────────────────────────────────

function CardBody({
  branch,
  waUrl,
  mapsUrl,
  phone,
  onClose,
}: {
  branch: Branch;
  waUrl: string;
  mapsUrl: string;
  phone: string;
  onClose: () => void;
}) {
  return (
    <div className="relative flex flex-col">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-5 pb-4"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(223,32,40,0.1)", border: "1px solid rgba(223,32,40,0.2)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#DF2028">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold tracking-[0.22em] text-gray-400 uppercase mb-0.5">{branch.province}</p>
          <p className="text-[15px] font-bold text-gray-900 leading-tight truncate">{branch.city}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-5 py-4">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-gray-600 leading-snug">{branch.name}</p>

        {/* WhatsApp phone link */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5"
          aria-label={`Chat ${branch.city} Branch on WhatsApp — ${phone}`}
        >
          <span className="text-[#04B621] transition-transform duration-200 group-hover:scale-110">
            <WaIcon size={14} />
          </span>
          <span
            className="text-[13px] font-bold text-gray-600 group-hover:text-[#04B621] transition-colors duration-200 relative"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {phone}
            <span className="absolute -bottom-px left-0 right-0 h-px bg-[#04B621] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          </span>
        </a>

        {/* Address */}
        <address className="not-italic text-[11px] font-medium text-gray-500 leading-relaxed flex gap-2">
          <svg className="flex-shrink-0 mt-[3px] text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>
            {branch.address.map((line, i) => (
              <span key={i}>{line}{i < branch.address.length - 1 && <br />}</span>
            ))}
          </span>
        </address>

        <div className="h-px" style={{ background: "rgba(0,0,0,0.08)" }} />

        {/* CTAs */}
        <div className="flex gap-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl text-[11px] font-bold tracking-[0.08em] text-white uppercase transition-all duration-250"
            style={{ background: "#04B621", border: "1px solid #04B621" }}
            aria-label={`Chat ${branch.city} Branch on WhatsApp`}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#03961b"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#04B621"; }}
          >
            <WaIcon size={13} />
            WhatsApp
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl text-[11px] font-bold tracking-[0.08em] text-gray-600 uppercase transition-all duration-250"
            style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.color = "#111827"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.color = "#4B5563"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            Maps
          </a>
        </div>
      </div>

      {/* Close Button — 44px min touch target */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-10 h-10 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
        style={{ background: "rgba(0,0,0,0.06)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.12)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)"; }}
        aria-label="Close branch card"
      >
        <svg width="11" height="11" viewBox="0 0 9 9" fill="none">
          <path d="M1 1l7 7M8 1L1 8" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── Branch card with viewport-aware positioning (Fix 05) ─────────────────────

const BranchCard = memo(function BranchCard({
  branch,
  onClose,
}: {
  branch: Branch | null;
  onClose: () => void;
}) {
  // ESC to close
  useEffect(() => {
    if (!branch) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [branch, onClose]);

  if (!branch) return null;

  const waUrl   = getWhatsAppUrl(branch);
  const mapsUrl = getMapsUrl(branch);
  const phone   = formatPhoneDisplay(branch.waNumber);

  const glassStyle = {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(0,0,0,0.1)",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
  };

  // Card entrance per Doc 06: opacity 0→1, scale 0.95→1, y 20→0, 400ms
  const cardAnim = {
    initial:    { opacity: 0, scale: 0.95, y: 20 },
    animate:    { opacity: 1, scale: 1,    y: 0 },
    exit:       { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };

  return (
    <AnimatePresence>
      {branch && (
        <>
          {/* Backdrop — click outside closes card (Fix 05) */}
          <motion.div
            key="backdrop"
            className="fixed inset-0"
            style={{ zIndex: 45, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Desktop: right side, vertically centered, viewport-safe (Fix 05) */}
          <motion.article
            key={`card-${branch.id}`}
            className="hidden md:flex fixed flex-col w-[340px] max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              zIndex: 50,
              right: "1.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              ...glassStyle,
            }}
            {...cardAnim}
          >
            <CardBody branch={branch} waUrl={waUrl} mapsUrl={mapsUrl} phone={phone} onClose={onClose} />
          </motion.article>

          {/* Mobile: bottom sheet (Fix 05) */}
          <motion.article
            key={`sheet-${branch.id}`}
            className="md:hidden fixed inset-x-0 bottom-0 flex flex-col rounded-t-3xl overflow-hidden"
            style={{ zIndex: 50, borderBottom: "none", ...glassStyle }}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(0,0,0,0.15)" }} />
            </div>
            <CardBody branch={branch} waUrl={waUrl} mapsUrl={mapsUrl} phone={phone} onClose={onClose} />
          </motion.article>
        </>
      )}
    </AnimatePresence>
  );
});

// ─── Individual branch marker ─────────────────────────────────────────────────

const Marker = memo(function Marker({
  branch,
  isSelected,
  isVisible,
  staggerIndex,
  onClick,
  isEditMode,
  configPos,
  configAppearance,
  onDragEnd,
}: {
  branch: Branch;
  isSelected: boolean;
  isVisible: boolean;
  staggerIndex: number;
  onClick: (b: Branch) => void;
  isEditMode?: boolean;
  configPos?: { x: number; y: number };
  configAppearance?: { color?: string; size?: number; glow?: number; opacity?: number };
  onDragEnd?: (e: any, info: any, branchId: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  
  const currentPos = configPos || branch.mapPosition;
  const currentApp = configAppearance || branch.appearance || {};
  
  const color = currentApp.color || "#DF2028";
  const baseSize = currentApp.size || 11;
  const hoverSize = baseSize + 5; // e.g. 16

  // Helper to convert hex to rgba for the glow (simple implementation assuming hex color)
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 223;
    const g = parseInt(hex.slice(3, 5), 16) || 32;
    const b = parseInt(hex.slice(5, 7), 16) || 40;
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <motion.button
      drag={isEditMode}
      dragMomentum={false}
      onDragEnd={(e, info) => onDragEnd?.(e, info, branch.id)}
      className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-1"
      style={{ 
        left: `${currentPos.x}%`, 
        top: `${currentPos.y}%`,
        cursor: isEditMode ? "grab" : "pointer",
        zIndex: isSelected || hovered ? 30 : 20
      }}
      onClick={() => onClick(branch)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Open ${branch.city} Branch`}
      // Fix 04: scale 0.8→1, opacity 0→1, spring easing, 120ms stagger
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{
        duration: 0.4,
        delay: isVisible ? staggerIndex * MARKER_STAGGER_MS : 0,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      {/* Pulse ring */}
      {!isSelected && (
        <span className="absolute -inset-2 rounded-full animate-ping pointer-events-none" style={{ background: hexToRgba(color, 0.25) }} />
      )}

      {/* Dot */}
      <motion.div
        animate={{
          width:  isSelected || hovered ? hoverSize : baseSize,
          height: isSelected || hovered ? hoverSize : baseSize,
          boxShadow: isSelected || hovered
            ? `0 0 0 3px ${hexToRgba(color, 0.35)}, 0 0 24px ${hexToRgba(color, 0.6)}`
            : `0 0 0 2px ${hexToRgba(color, 0.4)}, 0 0 8px ${hexToRgba(color, 0.3)}`,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="rounded-full"
        style={{ backgroundColor: color }}
      />

      {/* City label tooltip */}
      <AnimatePresence>
        {hovered && !isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 pointer-events-none"
          >
            <div
              className="px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-[0.08em] text-white/95 whitespace-nowrap"
              style={{
                background: "rgba(6,10,18,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              {branch.city}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * IndonesiaMap — V3
 *
 * Frame gating (Doc 07 / Fix 04):
 *   291 → map fades in
 *   292 → map settling
 *   293 → text readable
 *   294 → markers begin appearing (Jakarta first, 120ms stagger)
 *   295 → all markers visible + clickable
 *
 * Only one card open at a time.
 * Cards: ESC / click-outside / other marker click → close.
 * Mobile: bottom sheet. Desktop: right-side glass card (viewport-safe).
 */
export default function IndonesiaMap({ currentFrame }: { currentFrame: number }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const { isEditMode, config, updateConfig, setSelectedId } = useEditor();

  const isMapVisible   = currentFrame >= INDONESIA_START_FRAME;
  const markersVisible = currentFrame >= INDONESIA_MARKERS_FRAME;

  const handleMarkerClick = useCallback((branch: Branch) => {
    if (isEditMode) {
      setSelectedId(`marker-${branch.id}`);
    } else {
      setSelectedBranch((prev) => (prev?.id === branch.id ? null : branch));
    }
  }, [isEditMode, setSelectedId]);

  const handleClose = useCallback(() => setSelectedBranch(null), []);

  const handleDragEnd = useCallback((e: any, info: any, branchId: number) => {
    if (!mapRef.current) return;
    const mapRect = mapRef.current.getBoundingClientRect();
    
    // Calculate new percentage based on the dragged point (info.point is viewport relative)
    // We must account for the current offset because framer-motion drag modifies the transform.
    // Wait, if it's absolute positioned, it's better to just read the element's new bounds.
    // However, info.point gives the screen coordinate of the pointer.
    const xPct = ((info.point.x - mapRect.left) / mapRect.width) * 100;
    const yPct = ((info.point.y - mapRect.top) / mapRect.height) * 100;
    
    // Clamp to 0-100
    const finalX = Math.max(0, Math.min(100, xPct));
    const finalY = Math.max(0, Math.min(100, yPct));

    updateConfig((prev) => ({
      ...prev,
      branches: {
        ...(prev.branches || {}),
        [branchId]: {
          ...(prev.branches?.[branchId] || {}),
          mapPosition: { x: finalX, y: finalY }
        }
      }
    }));
  }, [updateConfig]);

  // Auto-close when leaving the Indonesia scene
  const prevVisible = useRef(isMapVisible);
  useEffect(() => {
    if (prevVisible.current && !isMapVisible) setSelectedBranch(null);
    prevVisible.current = isMapVisible;
  }, [isMapVisible]);

  return (
    <>
      <AnimatePresence>
        {isMapVisible && (
          <motion.section
            key="indonesia-map"
            className="fixed inset-0 flex flex-col"
            style={{ 
              zIndex: 20, 
              background: "rgba(5, 10, 20, 0.60)",
              pointerEvents: "none"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            aria-label="Indonesia Distribution Network — PT Indofresh"
          >
            {/* Header */}
            <motion.div
              className="flex-shrink-0 pt-16 md:pt-20 px-8 md:px-14 pb-3 pointer-events-none"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
            >
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                Distribution Network
              </p>
              <h2
                className="font-extrabold leading-[1.0] tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}
              >
                Freshness From{" "}
                <span style={{ color: "rgba(255,255,255,0.45)" }}>Across Indonesia.</span>
              </h2>
              <p className="mt-2 font-semibold text-white/30" style={{ fontSize: "clamp(0.75rem, 1.1vw, 0.9rem)" }}>
                8 strategic branch locations · One seamless cold chain · Nationwide delivery, daily
              </p>
            </motion.div>

            {/* Interactive Map Container */}
            <motion.div
              className="flex-1 flex items-center justify-center px-6 md:px-10 pb-3 min-h-0"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.3 }}
            >
              <div
                ref={mapRef}
                className="relative w-full overflow-hidden rounded-2xl"
                style={{
                  maxWidth: "min(100%, calc((100vh - 180px) * 1376 / 768))",
                  aspectRatio: "1376 / 768",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
                  pointerEvents: "auto",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/indonesia-map.jpg"
                  alt="Indonesia distribution network — 8 branch locations across the archipelago"
                  className="w-full h-full block object-fill"
                  style={{ opacity: 0.85, mixBlendMode: "lighten" }}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />

                {/* Edge vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center, transparent 70%, rgba(5,10,20,0.2) 100%)" }}
                />

                {/* Branch markers — sequential appearance at frame 294+, 120ms stagger */}
                {BRANCHES.map((branch) => (
                  <Marker
                    key={branch.id}
                    branch={branch}
                    isSelected={selectedBranch?.id === branch.id}
                    isVisible={markersVisible || isEditMode}
                    staggerIndex={MARKER_ORDER[branch.id] ?? branch.id - 1}
                    onClick={handleMarkerClick}
                    isEditMode={isEditMode}
                    configPos={config.branches?.[branch.id]?.mapPosition}
                    configAppearance={config.branches?.[branch.id]?.appearance}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Card — outside map section for correct z-index */}
      <BranchCard branch={selectedBranch} onClose={handleClose} />
    </>
  );
}
