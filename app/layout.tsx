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

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
  display: "swap",
});

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
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "OFFICIALLYSKELLY · skellywags.club" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OFFICIALLYSKELLY",
    description: "chaos, bad decisions, and surviving barely",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "OFFICIALLYSKELLY · skellywags.club" }],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const social = getSocial();
  const theme = getTheme();
  const themeCss = `:root { --c-cta: ${hexToRgbTriplet(theme.cta_color)}; --c-cta-light: ${lighten(theme.cta_color)}; --c-highlight: ${hexToRgbTriplet(theme.highlight_color)}; }`;
  return (
    <html lang="en" className={`${bebas.variable} ${nunito.variable} ${bangers.variable}`}>
      <head>
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
