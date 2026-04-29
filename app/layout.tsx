import type { Metadata } from "next";
import { Bebas_Neue, Nunito, Bangers } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
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
    images: ["/skellybanner.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OFFICIALLYSKELLY",
    description: "chaos, bad decisions, and surviving barely",
    images: ["/skellybanner.jpg"],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${nunito.variable} ${bangers.variable}`}>
      <body className="min-h-screen bg-bg-primary text-text-primary">
        <RevealOnScroll />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
