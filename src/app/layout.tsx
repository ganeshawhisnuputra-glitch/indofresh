import type { Metadata, Viewport } from "next";
import { EditorShell } from "@/editor/EditorShell";
import "./globals.css";

// ─── Viewport Configuration ───────────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#050A14",
};

// ─── SEO Metadata (Doc 10 — exact client-approved copy) ───────────────────────
export const metadata: Metadata = {
  title: "PT Indofresh | Premium Fresh Fruit Importer & Distributor Indonesia",
  description:
    "PT Indofresh is Indonesia's leading importer and distributor of premium fresh fruits with nationwide distribution and more than 20 years of experience.",
  keywords: [
    "PT Indofresh",
    "fresh fruit Indonesia",
    "fruit importer Indonesia",
    "fruit distributor Indonesia",
    "premium fresh fruit",
    "buah segar Indonesia",
    "importir buah segar",
    "distributor buah premium",
  ],
  authors: [{ name: "PT Indofresh" }],
  openGraph: {
    title: "PT Indofresh | Premium Fresh Fruit Importer & Distributor Indonesia",
    description:
      "PT Indofresh is Indonesia's leading importer and distributor of premium fresh fruits with nationwide distribution and more than 20 years of experience.",
    siteName: "PT Indofresh",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PT Indofresh | Premium Fresh Fruit Importer & Distributor Indonesia",
    description:
      "PT Indofresh is Indonesia's leading importer and distributor of premium fresh fruits with nationwide distribution and more than 20 years of experience.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#050A14] text-white">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#050A14] text-white font-sans antialiased selection:bg-[#DF2028]/30 selection:text-white">
        <EditorShell>
          {children}
        </EditorShell>
      </body>
    </html>
  );
}
