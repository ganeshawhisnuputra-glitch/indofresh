"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Animation Presets (Subtle, Sophisticated) ────────────────────────────────

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
};

const STAGGER_CONTAINER = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true, margin: "-50px" },
};

const STAGGER_ITEM = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
};

const STORIES = [
  {
    id: "h83u_wbPexc",
    title: "Indofresh Journey & Quality Excellence",
    category: "COMPANY STORY",
    description: "Discover our dedication to sourcing and delivering Indonesia's finest fresh produce from farm to table.",
  },
  {
    id: "ageOlag_ZBk",
    title: "Harvest & Fresh Cold Chain Network",
    category: "LOGISTICS & FRESHNESS",
    description: "Inside our state-of-the-art temperature-controlled distribution network ensuring peak freshness.",
  },
  {
    id: "6PMgQTx_Uso",
    title: "Empowering Local Farmers & Partners",
    category: "PARTNERSHIPS",
    description: "Building sustainable agricultural partnerships across the Indonesian archipelago.",
  },
];

const PARTNERS = [
  { id: "3", name: "Ranch Market 99", logo: "/images/partners/3.png" },
  { id: "4", name: "Lotte Mart", logo: "/images/partners/4.png" },
  { id: "5", name: "AEON", logo: "/images/partners/5.png" },
  { id: "6", name: "Market City", logo: "/images/partners/6.png" },
  { id: "7", name: "GrandLucky Superstore", logo: "/images/partners/7.png" },
  { id: "8", name: "hypermart", logo: "/images/partners/8.png" },
  { id: "9", name: "Hero Supermarket", logo: "/images/partners/9.png" },
  { id: "10", name: "Super Indo", logo: "/images/partners/10.png" },
  { id: "11", name: "The FoodHall", logo: "/images/partners/11.png" },
  { id: "12", name: "GS The Fresh", logo: "/images/partners/12.png" },
  { id: "13", name: "Rumah Buah", logo: "/images/partners/13.png" },
  { id: "14", name: "Total Buah Segar", logo: "/images/partners/14.png" },
  { id: "15", name: "All Fresh", logo: "/images/partners/15.png" },
  { id: "16", name: "Duta Buah", logo: "/images/partners/16.png" },
  { id: "17", name: "Pepito Market", logo: "/images/partners/17.png" },
  { id: "18", name: "Kem Chicks", logo: "/images/partners/18.png" },
  { id: "19", name: "Capital Fruit", logo: "/images/partners/19.png" },
  { id: "20", name: "Top Buah Segar", logo: "/images/partners/20.png" },
  { id: "21", name: "Yogya Group", logo: "/images/partners/21.png" },
  { id: "22", name: "Hokky", logo: "/images/partners/22.png" },
];

// ─── PostMapFlow Component ───────────────────────────────────────────────────

export default function PostMapFlow() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <div className="relative z-30 bg-[#050A14] text-white overflow-hidden font-sans">
      {/* Subtle top border divider separating map from post-map content */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* ─── SECTION 1: OUR STORIES ────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div className="text-center max-w-3xl mx-auto mb-16" {...FADE_UP}>
          <span className="text-[0.7rem] font-bold tracking-[0.3em] uppercase text-[#DF2028] mb-3 block">
            Our Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Stories Behind the Produce
          </h2>
          <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed">
            Explore the stories, products, and moments behind Indofresh.
          </p>
        </motion.div>

        {/* 3 Video Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          {...STAGGER_CONTAINER}
        >
          {STORIES.map((story) => (
            <motion.div
              key={story.id}
              variants={STAGGER_ITEM}
              onClick={() => setActiveVideoId(story.id)}
              className="group relative bg-white/[0.02] border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1 cursor-pointer flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                <img
                  src={`https://img.youtube.com/vi/${story.id}/hqdefault.jpg`}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-black/20 to-transparent" />

                {/* Elegant Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[#DF2028] group-hover:border-[#DF2028] transition-all duration-300 shadow-xl">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="ml-1 text-white"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#DF2028] mb-2 block">
                    {story.category}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors mb-3">
                    {story.title}
                  </h3>
                  <p className="text-sm text-white/65 font-normal leading-relaxed">
                    {story.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold tracking-wider text-white/70 group-hover:text-[#DF2028] transition-colors">
                  <span>Watch Story</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-current group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      d="M3 7h8M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Video Modal / Lightbox */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideoId(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#090F1E] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setActiveVideoId(null)}
                aria-label="Close video"
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#DF2028] border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Responsive 16:9 YouTube Embed */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                  title="Indofresh Story Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-white/10 w-full" />
      </div>

      {/* ─── SECTION 2: SUPERMARKET PARTNERS ───────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div className="text-center max-w-3xl mx-auto mb-16" {...FADE_UP}>
          <span className="text-[0.7rem] font-bold tracking-[0.3em] uppercase text-[#DF2028] mb-3 block">
            Retail Network
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Supermarket Partners
          </h2>
          <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed">
            Trusted by leading supermarkets and retail partners across Indonesia.
          </p>
        </motion.div>

        {/* 20 Original Partner Logo Cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
          {...STAGGER_CONTAINER}
        >
          {PARTNERS.map((partner) => (
            <motion.div
              key={partner.id}
              variants={STAGGER_ITEM}
              className="group relative bg-white/[0.02] border border-white/10 hover:border-white/25 rounded-2xl p-4 sm:p-5 flex items-center justify-center min-h-[120px] sm:min-h-[135px] transition-all duration-300 hover:bg-white/[0.05] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:-translate-y-1"
            >
              <div className="w-full h-full min-h-[72px] sm:min-h-[85px] bg-white rounded-xl p-2 sm:p-3 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-300 shadow-sm overflow-hidden">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full max-h-16 sm:max-h-20 object-contain pointer-events-none"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-white/10 w-full" />
      </div>

      {/* ─── SECTION 2: RECRUITMENT (JOIN OUR TEAM) ─────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <motion.div className="max-w-3xl mx-auto" {...FADE_UP}>
          <span className="text-[0.7rem] font-bold tracking-[0.3em] uppercase text-[#10B981] mb-3 block">
            Careers at IndoFresh
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Join Our Team
          </h2>
          <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mb-10">
            Be part of a company that&apos;s growing across Indonesia. Explore our
            latest career opportunities and find the role that&apos;s right for
            you.
          </p>

          <motion.a
            href="https://career.indofresh.co.id"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold tracking-[0.14em] uppercase text-white bg-[#10B981] hover:bg-[#059669] transition-all shadow-[0_4px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_30px_rgba(16,185,129,0.5)]"
          >
            <span>Explore Careers</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-white"
            >
              <path
                d="M3 11L11 3M11 3H4M11 3V10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-white/10 w-full" />
      </div>

      {/* ─── SECTION 3: BUSINESS PARTNERSHIP ───────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <motion.div className="max-w-3xl mx-auto" {...FADE_UP}>
          <span className="text-[0.7rem] font-bold tracking-[0.3em] uppercase text-[#DF2028] mb-3 block">
            Partnership Opportunities
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Interested in Partnering With IndoFresh?
          </h2>
          <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mb-10">
            We&apos;re always looking for new business partners across Indonesia.
            Let&apos;s build long-term partnerships together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.a
              href="https://wa.me/6281298985155"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold tracking-[0.14em] uppercase text-white bg-[#DF2028] hover:bg-[#C01820] transition-all shadow-[0_4px_24px_rgba(223,32,40,0.3)] hover:shadow-[0_6px_30px_rgba(223,32,40,0.5)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Contact Partnership Team</span>
            </motion.a>

            {/* Always Visible Phone Number Display */}
            <div className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/[0.04] border border-white/10 text-white/85 text-sm font-semibold tracking-wider">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-white/60">
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>081298985155</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#03060D] py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-light tracking-[0.26em] text-white/30 uppercase">
              PT
            </span>
            <span className="text-[0.95rem] font-semibold tracking-[0.14em] text-white/90 uppercase">
              Indofresh
            </span>
            <span className="text-xs text-white/40 mt-1">
              The Fresh Fruit People — Indonesia&apos;s Leading Fresh Fruit Distributor
            </span>
          </div>

          <div className="text-xs text-white/35 font-normal tracking-wide">
            © {new Date().getFullYear()} PT Indofresh. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
