// ─── Frame Controller ─────────────────────────────────────────────────────────
//
// Single source of truth: scrollY → frame index.
//
// Architecture:
//  1. Each frame "consumes" a configurable number of CSS pixels of scroll.
//  2. Hold frames consume MORE pixels — giving users extra reading time on
//     scenes with very few animation frames (Thailand, New Zealand, etc.).
//  3. A precomputed scroll map (Float64Array) stores the cumulative scroll
//     start of each frame, enabling O(log n) binary-search lookup.
//  4. getTotalScrollHeight() returns the exact body height the app shell
//     must set so the browser's native scroll drives the animation.
//
// Correctness guarantees:
//  • NEVER autoplay  — frame is 100% derived from scrollY.
//  • NEVER setInterval — there are no timers anywhere in this file.
//  • Reversible — scrolling up returns to earlier frames.

export const TOTAL_FRAMES = 297;

// ─── Scroll sensitivity ───────────────────────────────────────────────────────
// How many CSS pixels of scroll each normal frame consumes.
// 20px gives a cinematic pace on a standard trackpad swipe gesture.
const PX_PER_FRAME = 22;

// ─── Per-Frame Hold Multipliers ───────────────────────────────────────────────
// Frames listed here consume (multiplier × PX_PER_FRAME) pixels of scroll.
//
// Purpose: when a scene has very few real animation frames, slowing down
// the scroll at key frames gives users time to read the overlay text without
// stretching the actual frame sequence.
//
// Hold distances (from official storyboard V3):
//   Scene 3  (Fruit Grading)   — holdDistance: 150px → frame 100 × 8  = 160px
//   Scene 4  (Cold Storage)    — holdDistance: 300px → frame 125 × 15 = 300px
//   Scene 5  (Trusted Brands)  — holdDistance: 100px → frame 161 × 5  = 100px
//   Scene 7  (China)           — holdDistance: 200px → frame 213 × 10 = 200px
//   Scene 8  (Malaysia)        — holdDistance: 250px → frame 220 × 13 = 260px
//   Scene 9  (Thailand)        — holdDistance: 650px → frames 227+228 × 17 = 680px
//   Scene 10 (New Zealand)     — holdDistance: 700px → frames 235+236 × 18+17 = 700px
const HOLD_MULTIPLIERS: Readonly<Partial<Record<number, number>>> = {
  // Scene 3 — Fruit Grading Integration
  100: 8,
  // Scene 4 — Cold Storage Operations
  125: 15,
  // Scene 5 — Trusted Brands
  161: 5,
  // Scene 7 — China
  213: 10,
  // Scene 8 — Malaysia
  220: 13,
  // Scene 9 — Thailand (2 hold frames)
  227: 18,
  228: 18,
  // Scene 10 — New Zealand (2 hold frames)
  235: 20,
  236: 18,
  // Scene 11 — USA (hold before final scene transition)
  288: 8,
  289: 8,
  290: 8,
  // Scene 12 — Indonesia Distribution Network
  // Large holds so the map is always reachable + usable
  // Users on 1080p screens need ~800px of scroll headroom to reach frame 291+.
  291: 40,  // map fades in
  292: 40,  // map fully visible
  293: 40,  // text readable
  294: 50,  // markers begin appearing
  295: 80,  // all markers interactive — primary interaction zone
  296: 50,  // linger on final scene
};

function pxForFrame(frame: number): number {
  const mult = HOLD_MULTIPLIERS[frame];
  return PX_PER_FRAME * (mult ?? 1);
}

// ─── Precomputed Scroll Map ───────────────────────────────────────────────────
// _scrollMap[f] = cumulative scroll start (px) of frame f.
// _scrollMap[TOTAL_FRAMES] = total scroll height (sentinel).

let _scrollMap: Float64Array | null = null;

function buildScrollMap(): Float64Array {
  const map = new Float64Array(TOTAL_FRAMES + 1);
  let cumulative = 0;
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    map[f] = cumulative;
    cumulative += pxForFrame(f);
  }
  map[TOTAL_FRAMES] = cumulative; // sentinel / total height
  return map;
}

function getScrollMap(): Float64Array {
  if (!_scrollMap) _scrollMap = buildScrollMap();
  return _scrollMap;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the total document scroll height the app must set on <body>.
 * All visual elements must be position:fixed for this to work correctly.
 */
export function getTotalScrollHeight(): number {
  return getScrollMap()[TOTAL_FRAMES];
}

/**
 * Maps a raw window.scrollY value to the correct frame index [0, TOTAL_FRAMES-1].
 * Uses binary search on the precomputed scroll map — O(log n), always correct.
 */
export function scrollToFrame(scrollY: number): number {
  const map = getScrollMap();
  if (scrollY <= 0) return 0;
  const maxScroll = map[TOTAL_FRAMES - 1];
  if (scrollY >= maxScroll) return TOTAL_FRAMES - 1;

  // Binary search: largest f such that map[f] <= scrollY
  let lo = 0;
  let hi = TOTAL_FRAMES - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (map[mid] <= scrollY) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * Returns the scroll position (px) that should be set to navigate
 * to the START of a given frame. Used by the progress nav for
 * smooth-scroll section navigation via window.scrollTo().
 */
export function frameToScrollY(frame: number): number {
  const map = getScrollMap();
  const f = Math.max(0, Math.min(TOTAL_FRAMES - 1, frame));
  return map[f];
}

/**
 * Returns the scroll progress within a frame as [0, 1].
 * Useful for sub-frame interpolation if needed in the future.
 */
export function getFrameProgress(scrollY: number, frame: number): number {
  const map = getScrollMap();
  const frameStart = map[frame];
  const frameLen = pxForFrame(frame);
  if (frameLen === 0) return 1;
  return Math.max(0, Math.min(1, (scrollY - frameStart) / frameLen));
}
