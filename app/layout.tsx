import type { Metadata } from "next";
import { Bebas_Neue, Nunito, Bangers } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getSocial, getTheme, hexToRgbTriplet } from "@/lib/content";

function lighten(hex: string): string {
  const m = String(hex).trim().match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return "94 224 255";
  const lift = (h: string) => Math.min(255, parseInt(h, 16) + 50);
  return `${lift(m[1])} ${lift(m[2])} ${lift(m[3])}`;
}
import "./globals.css";

// Default-preset fonts (self-hosted via next/font, preloaded). The original
// locked design system. Any other Google Font name typed into theme.json
// flows through the custom-font path (loaded via fonts.googleapis.com stylesheet).
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas-neue", display: "swap" });
const nunito    = Nunito({    subsets: ["latin"], weight: ["400", "700"], variable: "--font-nunito", display: "swap" });
const bangers   = Bangers({   subsets: ["latin"], weight: "400", variable: "--font-bangers", display: "swap" });

const HEADING_FONTS: Record<string, string> = {
  "bebas-neue": "var(--font-bebas-neue)",
};
const BODY_FONTS: Record<string, string> = {
  "nunito": "var(--font-nunito)",
};
const ACCENT_FONTS: Record<string, string> = {
  "bangers": "var(--font-bangers)",
};

const ALL_FONT_VARIABLES = [bebasNeue.variable, nunito.variable, bangers.variable].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://skellywags.club"),
  title: {
    default: "OFFICIALLYSKELLY — chaos, bad decisions, and surviving barely",
    template: "%s · skellywags.club",
  },
  description:
    "Home of @OfficiallySkelly and the Skellywags. Merch, members-only chaos, and the latest from the void.",
  openGraph: {
    title: "OFFICIALLYSKELLY",
    description: "chaos, bad decisions, and surviving barely",
    url: "https://skellywags.club",
    siteName: "skellywags.club",
    images: [{ url: "/og-v4.jpg", width: 1200, height: 630, alt: "OFFICIALLYSKELLY · skellywags.club" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OFFICIALLYSKELLY",
    description: "chaos, bad decisions, and surviving barely",
    images: [{ url: "/og-v4.jpg", width: 1200, height: 630, alt: "OFFICIALLYSKELLY · skellywags.club" }],
  },
  icons: { icon: "/favicon.svg" },
};

function customFontHref(name: string): string {
  const family = String(name).trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700&display=swap`;
}

function fontFamilyFor(value: string | undefined, fallback: string, registry: Record<string, string>): string {
  if (!value) return fallback;
  if (registry[value]) return registry[value];
  // Treat as a custom Google Font name (e.g., "Lobster") loaded via the stylesheet link below.
  return `'${value}'`;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const social = getSocial();
  const theme = getTheme();

  const headingFamily = fontFamilyFor(theme.heading_font, HEADING_FONTS["bebas-neue"], HEADING_FONTS);
  const bodyFamily    = fontFamilyFor(theme.body_font,    BODY_FONTS["nunito"],         BODY_FONTS);
  const accentFamily  = fontFamilyFor(theme.accent_font,  ACCENT_FONTS["bangers"],      ACCENT_FONTS);

  const customFonts: string[] = [];
  for (const v of [theme.heading_font, theme.body_font, theme.accent_font]) {
    if (v && !HEADING_FONTS[v] && !BODY_FONTS[v] && !ACCENT_FONTS[v]) {
      if (!customFonts.includes(v)) customFonts.push(v);
    }
  }

  const themeCss = `
:root {
  --c-cta: ${hexToRgbTriplet(theme.cta_color)};
  --c-cta-light: ${lighten(theme.cta_color)};
  --c-highlight: ${hexToRgbTriplet(theme.highlight_color)};
  --font-active-heading: ${headingFamily};
  --font-active-body: ${bodyFamily};
  --font-active-accent: ${accentFamily};
}`.trim();

  const customFontCss = (theme.custom_font_css || "").trim();

  return (
    <html lang="en" className={ALL_FONT_VARIABLES}>
      <head>
        {customFonts.length > 0 && (
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        )}
        {customFonts.map((name) => (
          <link key={name} rel="stylesheet" href={customFontHref(name)} />
        ))}
        {customFontCss && (
          <style dangerouslySetInnerHTML={{ __html: customFontCss }} />
        )}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-screen bg-bg-primary text-text-primary">
        <RevealOnScroll />
        <Navbar social={social} />
        <main>{children}</main>
        <Footer social={social} />
      </body>
    </html>
  );
}
