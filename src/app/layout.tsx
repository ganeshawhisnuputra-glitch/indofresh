import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#050505" />
      </head>
      <body className="bg-brand-bg text-brand-foreground font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
