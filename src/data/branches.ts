// ─── Branch Data ─────────────────────────────────────────────────────────────
//
// All 8 PT Indofresh branch locations.
//
// WhatsApp numbers are provided in the format supplied by the client (with
// country code prefix 62). They are used directly in wa.me/ URLs.
//
// Map marker positions (mapPosition) are expressed as percentages of the
// map image container dimensions (x = left %, y = top %).
// They assume the map image fills a 16:9 container with object-cover.
//
// ⚠️  Phone numbers are sourced from the official client spec.
//     Do NOT modify without client confirmation.

export interface Branch {
  id: number;
  name: string;
  city: string;
  province: string;
  /** Raw WhatsApp number with country code, no spaces or symbols (e.g. 6281298985155) */
  waNumber: string;
  /** Lines of the display address */
  address: string[];
  /** Marker position as % of the 16:9 image container */
  mapPosition: { x: number; y: number };
  /** Google Maps search query string */
  mapsQuery: string;
}

export const BRANCHES: Branch[] = [
  {
    id: 1,
    name: "PT Indofresh — Ancol",
    city: "Jakarta Utara",
    province: "DKI Jakarta",
    waNumber: "6281298985155",
    address: [
      "Jl. Parang Tritis Raya No.38",
      "RT.8/RW.11, Ancol, Pademangan",
      "Jakarta Utara, DKI Jakarta 14430",
    ],
    mapPosition: { x: 28.5, y: 63 },
    mapsQuery: "Jl Parang Tritis Raya No 38 Ancol Pademangan Jakarta Utara",
  },
  {
    id: 2,
    name: "PT Indofresh — Marunda",
    city: "Bekasi",
    province: "Jawa Barat",
    waNumber: "622189442220",
    address: [
      "Komplek Pergudangan Marunda Center",
      "Blok E No.3A, Bahagia",
      "Babelan, Bekasi, Jawa Barat 17211",
    ],
    mapPosition: { x: 31.5, y: 63 },
    mapsQuery: "Pergudangan Marunda Center Babelan Bekasi West Java",
  },
  {
    id: 3,
    name: "PT Indofresh — Semarang",
    city: "Semarang",
    province: "Jawa Tengah",
    waNumber: "6281112577795",
    address: [
      "Kawasan Industri Candi",
      "Blok H1 No.7, Ngaliyan",
      "Semarang, Jawa Tengah",
    ],
    mapPosition: { x: 39.5, y: 63 },
    mapsQuery: "Kawasan Industri Candi Ngaliyan Semarang Central Java",
  },
  {
    id: 4,
    name: "PT Indofresh — Surabaya",
    city: "Sidoarjo",
    province: "Jawa Timur",
    waNumber: "6281717777885",
    address: [
      "RT.06/RW.09, Ringin Wetan",
      "Bringinbendo, Taman",
      "Sidoarjo, Jawa Timur 61257",
    ],
    mapPosition: { x: 47, y: 64 },
    mapsQuery: "Bringinbendo Taman Sidoarjo East Java",
  },
  {
    id: 5,
    name: "PT Indofresh — Bali",
    city: "Gianyar",
    province: "Bali",
    waNumber: "628234803804",
    address: [
      "Jl. Prof. Dr. Ida Bagus Mantra No.170",
      "Ketewel, Sukawati",
      "Gianyar, Bali 80582",
    ],
    mapPosition: { x: 51, y: 67 },
    mapsQuery: "Jl Prof Dr Ida Bagus Mantra No 170 Sukawati Gianyar Bali",
  },
  {
    id: 6,
    name: "PT Indofresh — Makassar",
    city: "Makassar",
    province: "Sulawesi Selatan",
    waNumber: "6281244070646",
    address: [
      "Komplek Pergudangan & Industri",
      "Parangloe Indah",
      "Makassar, Sulawesi Selatan",
    ],
    mapPosition: { x: 63, y: 58 },
    mapsQuery: "Pergudangan Industri Parangloe Indah Makassar South Sulawesi",
  },
  {
    id: 7,
    name: "PT Indofresh — Palembang",
    city: "Palembang",
    province: "Sumatera Selatan",
    waNumber: "6282261885916",
    address: [
      "Kompleks Pergudangan Sukarami",
      "Jl. Gubernur H.M. Ali Amin",
      "Sukarame, Palembang, Sumatera Selatan",
    ],
    mapPosition: { x: 25.5, y: 52 },
    mapsQuery: "Pergudangan Sukarami Sukarame Palembang South Sumatra",
  },
  {
    id: 8,
    name: "PT Indofresh — Balikpapan",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    waNumber: "6281250915000",
    address: [
      "Jl. AMD, Pulau Balang KM.13",
      "Karang Joang",
      "Balikpapan Utara, Kalimantan Timur",
    ],
    mapPosition: { x: 60.5, y: 46 },
    mapsQuery: "Jl AMD Pulau Balang Karang Joang Balikpapan Utara East Kalimantan",
  },
];

// ─── URL Helpers ──────────────────────────────────────────────────────────────

/** Returns the wa.me deep link for a branch */
export function getWhatsAppUrl(branch: Branch): string {
  return `https://wa.me/${branch.waNumber}`;
}

/** Returns a Google Maps search URL for a branch */
export function getMapsUrl(branch: Branch): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapsQuery)}`;
}

/**
 * Formats the WhatsApp number for display.
 * "6281298985155" → "+62 812-9898-5155"
 */
export function formatPhoneDisplay(waNumber: string): string {
  const digits = waNumber.replace(/\D/g, "");
  if (!digits.startsWith("62")) return waNumber;
  const local = digits.slice(2); // strip leading "62"

  // Group: 3-4-4 for 11 digits, 3-3-4 for 10, etc.
  if (local.length === 11)
    return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
  if (local.length === 10)
    return `+62 ${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
  if (local.length === 9)
    return `+62 ${local.slice(0, 2)}-${local.slice(2, 6)}-${local.slice(6)}`;
  // Jakarta fixed line (2-21-8944-2220 → "021-8944-2220")
  return `+62 ${local}`;
}
