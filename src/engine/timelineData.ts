// ─── Timeline Data Engine ─────────────────────────────────────────────────────
//
// V3 Architecture: Official client copy + per-scene layout system.
//
// Every scene is entirely self-contained:
//  • layout   → where to position the text overlay
//  • glass    → whether to render a glass panel behind text
//  • content  → official client-approved copy (never summarised, never rewritten)
//
// Frame Ranges (from official storyboard, V3 FINAL):
//  Scene 1:  000–049
//  Scene 2:  050–084  (content 050–075, gap 076–084)
//  Scene 3:  085–114  (content 085–100, gap 101–114)
//  Scene 4:  115–154  (content 115–125, gap 126–154)
//  Scene 5:  155–171  (content 155–161, gap 162–171)
//  Scene 6:  172–207
//  Scene 7:  208–214  (content 208–213, gap 214)
//  Scene 8:  215–226  (content 215–220, gap 221–226)
//  Scene 9:  227–234  (content 227–228, gap 229–234)
//  Scene 10: 235–239  (content 235–236, gap 237–239)
//  Scene 11: 240–290  (content 240–265, gap 266–290)
//  Scene 12: 291–296
//
// Total: 297 frames (indices 0–296) ✓
//
// Rules:
//  • One frame → one scene. No overlapping ranges.
//  • Gap frames automatically continue the previous scene (endFrame includes gaps).
//  • Never hardcode frame checks in components — always derive from SCENES[].

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SceneLayout {
  /** Horizontal text alignment and placement */
  horizontal: 'left' | 'center' | 'right';
  /** Vertical text placement */
  vertical: 'top' | 'middle' | 'bottom';
  /** CSS max-width of the text container */
  maxWidth: string;
}

export interface GlassConfig {
  /** Whether to render a frosted-glass backdrop behind text */
  enabled: boolean;
  /** backdrop-filter blur radius */
  blur?: string;
  /** Background opacity (0–1) */
  opacity?: number;
}

/** Paired bullet: bold title line + lighter body (Scene 04 format) */
export interface BulletItem {
  title: string;
  body: string;
}

export interface Scene {
  /** Unique scene ID (1-based, matches storyboard) */
  id: number;
  /** Short navigation label */
  label: string;
  /** First frame of this scene (inclusive) */
  startFrame: number;
  /** Last frame of this scene (inclusive, includes trailing gap frames) */
  endFrame: number;

  // ─── Content (official client copy — never summarise, never rewrite) ───────
  /** Tiny all-caps label appearing above the headline */
  eyebrow?: string;
  /** Main headline. Use \n for deliberate line breaks. */
  title?: string;
  /** Supporting subtitle below the headline */
  subtitle?: string;
  /** Body paragraph */
  body?: string;
  /** Second body paragraph (Scene 02 only) */
  body2?: string;
  /** Country scene tagline — appears between eyebrow and body (Doc 06) */
  tagline?: string;
  /** Simple bullet list */
  bullets?: string[];
  /** Paired bullets: bold title + lighter body line (Scene 04) */
  bulletItems?: BulletItem[];
  /** Key products list — each item appears individually with 100ms stagger (country scenes) */
  products?: string[];
  /** Stat pills shown below the text block */
  stats?: { value: string; label: string }[];

  // ─── Layout ────────────────────────────────────────────────────────────────
  layout: SceneLayout;
  glass: GlassConfig;
}

// ─── Official Scene Data ──────────────────────────────────────────────────────

export const SCENES: Scene[] = [

  // ── Scene 01 — Opening Truck ───────────────────────────────────────────────
  {
    id: 1,
    label: 'Welcome',
    startFrame: 0,
    endFrame: 49,
    title: 'Welcome to Indofresh',
    subtitle: 'The Fresh Fruit People',
    layout: { horizontal: 'center', vertical: 'middle', maxWidth: 'min(92vw, 900px)' },
    glass: { enabled: false },
  },

  // ── Scene 02 — Warehouse Entrance ─────────────────────────────────────────
  // Content: 050–075.  Gap: 076–084 → continue Scene 02.
  {
    id: 2,
    label: 'About Us',
    startFrame: 50,
    endFrame: 84,
    eyebrow: 'ABOUT US',
    body: "Since 2002, PT Indofresh has grown from a small trading company into Indonesia's leading fresh fruit importer and distributor. With over two decades of experience, we deliver more than 40 premium fruit varieties nationwide through world-class sourcing, strict quality control, and an efficient distribution network.",
    body2: 'Today, PT Indofresh proudly serves more than 2,000 business partners across Indonesia, earning the trust of retailers, wholesalers, and consumers alike.',
    layout: { horizontal: 'left', vertical: 'middle', maxWidth: 'min(92vw, 820px)' },
    glass: { enabled: true, blur: '20px', opacity: 0.08 },
  },

  // ── Scene 03 — Fruit Grading Integration ──────────────────────────────────
  // Content: 085–100.  Gap: 101–114 → continue Scene 03.
  {
    id: 3,
    label: 'Grading',
    startFrame: 85,
    endFrame: 114,
    eyebrow: 'FRUIT GRADING INTEGRATION',
    body: 'Advanced grading technology ensures every fruit meets our highest standards of quality, consistency, and freshness before reaching our customers.',
    layout: { horizontal: 'right', vertical: 'middle', maxWidth: 'min(88vw, 760px)' },
    glass: { enabled: true, blur: '20px', opacity: 0.08 },
  },

  // ── Scene 04 — Cold Storage Operations ────────────────────────────────────
  // Content: 115–125.  Gap: 126–154 → continue Scene 04.
  {
    id: 4,
    label: 'Operations',
    startFrame: 115,
    endFrame: 154,
    eyebrow: 'OPERATIONS AND FRESHNESS',
    bulletItems: [
      {
        title: 'Assured Excellence',
        body: 'Uncompromising quality standards that guarantee exceptional freshness in every delivery.',
      },
      {
        title: 'Punctual Perfection',
        body: 'Reliable, on-time distribution powered by an experienced nationwide logistics network.',
      },
      {
        title: 'Abundant Selection',
        body: 'Over 40 carefully selected premium fruit varieties sourced from trusted growers worldwide.',
      },
      {
        title: 'Decades of Mastery',
        body: 'More than 20 years of industry expertise delivering consistent quality and trusted service.',
      },
    ],
    layout: { horizontal: 'left', vertical: 'middle', maxWidth: 'min(90vw, 840px)' },
    glass: { enabled: true, blur: '24px', opacity: 0.10 },
  },

  // ── Scene 05 — Trusted Brands ─────────────────────────────────────────────
  // Content: 155–161.  Gap: 162–171 → continue Scene 05.
  {
    id: 5,
    label: 'Brands',
    startFrame: 155,
    endFrame: 171,
    title: 'OUR TRUSTED BRANDS',
    body: 'A portfolio of premium fruit brands trusted by businesses and consumers across Indonesia.',
    layout: { horizontal: 'center', vertical: 'bottom', maxWidth: 'min(92vw, 860px)' },
    glass: { enabled: false },
  },

  // ── Scene 06 — Global Sourcing ────────────────────────────────────────────
  {
    id: 6,
    label: 'Global',
    startFrame: 172,
    endFrame: 207,
    eyebrow: 'GLOBAL SOURCING',
    title: 'Freshness From\nEvery Corner.',
    body: "Indofresh sources premium fresh fruit from the world's finest growing regions — across 6 continents and 12+ countries — delivering exceptional quality to Indonesia and beyond.",
    layout: { horizontal: 'left', vertical: 'middle', maxWidth: 'min(90vw, 840px)' },
    glass: { enabled: true, blur: '20px', opacity: 0.08 },
  },

  // ── Scene 07 — China ──────────────────────────────────────────────────────
  // Content: 208–213.  Gap: 214 → continue Scene 07.
  {
    id: 7,
    label: 'China',
    startFrame: 208,
    endFrame: 214,
    eyebrow: "PEOPLE'S REPUBLIC OF CHINA",
    title: 'China',
    tagline: 'Legacy of Agricultural Innovation',
    body: "Premium apples, pears, mandarins, and tropical produce sourced directly from China's most productive growing regions.",
    products: ['Fuji Apples', 'Wangshan Apples', 'Honey Pears', 'Mandarin Oranges', 'Dragon Fruit'],
    layout: { horizontal: 'center', vertical: 'middle', maxWidth: 'min(88vw, 800px)' },
    glass: { enabled: true, blur: '20px', opacity: 0.08 },
  },

  // ── Scene 08 — Malaysia ───────────────────────────────────────────────────
  // Content: 215–220.  Gap: 221–226 → continue Scene 08.
  {
    id: 8,
    label: 'Malaysia',
    startFrame: 215,
    endFrame: 226,
    eyebrow: 'MALAYSIA',
    title: 'Malaysia',
    tagline: 'The Heart of Tropical Richness',
    body: "Southeast Asia's finest tropical produce — premium durian, rambutans, and dragon fruit — sourced from trusted Malaysian growers.",
    products: ['Premium Durian', 'Rambutan', 'Dragon Fruit', 'Mangosteen', 'Starfruit'],
    layout: { horizontal: 'center', vertical: 'middle', maxWidth: 'min(88vw, 800px)' },
    glass: { enabled: true, blur: '20px', opacity: 0.08 },
  },

  // ── Scene 09 — Thailand ───────────────────────────────────────────────────
  // HOLD SECTION. Content: 227–228.  Gap: 229–234 → continue Scene 09.
  {
    id: 9,
    label: 'Thailand',
    startFrame: 227,
    endFrame: 234,
    eyebrow: 'KINGDOM OF THAILAND',
    title: 'Thailand',
    tagline: 'Where Orchards Meet Tradition',
    body: "World-renowned Thai tropical fruits — mangoes, longan, and pomelo — delivered fresh from Thailand's most celebrated orchards.",
    products: ['Thai Mango', 'Longan', 'Pomelo', 'Guava', 'Rose Apple'],
    layout: { horizontal: 'center', vertical: 'middle', maxWidth: 'min(88vw, 800px)' },
    glass: { enabled: true, blur: '20px', opacity: 0.08 },
  },

  // ── Scene 10 — New Zealand ────────────────────────────────────────────────
  // HOLD SECTION. Content: 235–236.  Gap: 237–239 → continue Scene 10.
  {
    id: 10,
    label: 'New Zealand',
    startFrame: 235,
    endFrame: 239,
    eyebrow: 'NEW ZEALAND',
    title: 'New Zealand',
    tagline: 'Southern Hemisphere Excellence',
    body: "Premium New Zealand produce — world-class apples, kiwifruit, and stone fruit — sourced from pristine southern hemisphere growing regions.",
    products: ['Kiwifruit', 'Royal Gala Apples', 'Jazz Apples', 'Nectarines', 'Plums'],
    layout: { horizontal: 'center', vertical: 'middle', maxWidth: 'min(88vw, 800px)' },
    glass: { enabled: true, blur: '20px', opacity: 0.08 },
  },

  // ── Scene 11 — United States ──────────────────────────────────────────────
  // Content: 240–265.  Gap: 266–290 → continue Scene 11.
  {
    id: 11,
    label: 'United States',
    startFrame: 240,
    endFrame: 290,
    eyebrow: 'UNITED STATES OF AMERICA',
    title: 'United States',
    tagline: 'Powered by American Precision',
    body: "California cherries, Washington grapes, and Florida citrus — premium American produce delivered from the world's most advanced agricultural industry.",
    products: ['Washington Cherries', 'Navel Oranges', 'Red Globe Grapes', 'California Kiwi', 'Fuji Blueberries'],
    layout: { horizontal: 'center', vertical: 'middle', maxWidth: 'min(88vw, 800px)' },
    glass: { enabled: true, blur: '20px', opacity: 0.08 },
  },

  // ── Scene 12 — Indonesia Distribution Network ─────────────────────────────
  // Interactive scene. IndonesiaMap overlay takes full control here.
  // This entry exists for nav/progress-bar purposes only.
  {
    id: 12,
    label: 'Indonesia',
    startFrame: 291,
    endFrame: 296,
    eyebrow: 'DISTRIBUTION NETWORK',
    title: 'Freshness From\nAcross Indonesia.',
    subtitle: '8 strategic branch locations. One seamless cold chain. Nationwide freshness delivered every day.',
    layout: { horizontal: 'center', vertical: 'middle', maxWidth: 'min(92vw, 900px)' },
    glass: { enabled: false },
  },
];

// ─── Scene Lookup ─────────────────────────────────────────────────────────────

/**
 * Returns the active Scene for a given frame index.
 * Data-driven: derived entirely from SCENES[].startFrame / endFrame.
 * Never uses hardcoded if/else logic.
 */
export function getActiveScene(frame: number): Scene {
  for (const scene of SCENES) {
    if (frame >= scene.startFrame && frame <= scene.endFrame) {
      return scene;
    }
  }
  // Fallback: last scene (should never happen with valid frame [0, 296])
  return SCENES[SCENES.length - 1];
}

/**
 * Returns the 0-based index in SCENES[] for the given frame.
 */
export function getActiveSceneIndex(frame: number): number {
  for (let i = 0; i < SCENES.length; i++) {
    if (frame >= SCENES[i].startFrame && frame <= SCENES[i].endFrame) {
      return i;
    }
  }
  return SCENES.length - 1;
}

// ─── Scene Constants ──────────────────────────────────────────────────────────

/** Scene ID for the interactive Indonesia Distribution Network section */
export const INDONESIA_SCENE_ID = 12;

/** First frame at which the Indonesia map overlay should become visible */
export const INDONESIA_START_FRAME = 291;

/** First frame at which map markers become interactive */
export const INDONESIA_MARKERS_FRAME = 294;
