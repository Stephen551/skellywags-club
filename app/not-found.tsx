import Image from "next/image";
import GlowButton from "@/components/GlowButton";
import { getTheme } from "@/lib/content";

export const metadata = { title: "Lost in the Void" };

export default function NotFound() {
  const theme = getTheme();
  return (
    <section className="relative bg-starfield-dense noise-overlay min-h-[80vh] flex items-center">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20 text-center">
        <p className="font-bangers text-electric-pink text-2xl tracking-widest">⚠ ERROR 404 ⚠</p>
        <h1 className="heading text-7xl md:text-9xl text-white mt-3">LOST IN THE VOID</h1>
        <p className="text-xl text-text-primary/85 mt-6 max-w-md mx-auto">
          this page doesn't exist. or it did, and skelly broke it. either way, the chaos found you.
        </p>

        <div className="mt-10 flex justify-center">
          <div className="relative animate-drift">
            <div className="absolute inset-0 bg-purple-core blur-3xl opacity-50 rounded-full" />
            <Image
              src={theme.avatar_url || "/avatar.png"}
              alt="Skelly"
              width={260}
              height={260}
              className="relative drop-shadow-[0_0_30px_rgba(155,95,192,0.7)]"
              unoptimized={theme.avatar_url?.startsWith("/uploads/")}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <GlowButton variant="gold" size="lg" href="/">BACK TO BASE →</GlowButton>
          <GlowButton variant="purple" size="lg" href="/videos">WATCH SOMETHING →</GlowButton>
        </div>
      </div>
    </section>
  );
}
