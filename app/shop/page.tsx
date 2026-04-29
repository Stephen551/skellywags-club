import EmailCapture from "@/components/EmailCapture";
import GlowButton from "@/components/GlowButton";
import SectionDivider from "@/components/SectionDivider";
import { FOURTHWALL_SHOP_URL } from "@/lib/constants";

export const metadata = { title: "Shop" };

export default function ShopPage() {
  if (FOURTHWALL_SHOP_URL) return <LiveShop />;
  return <ComingSoonShop />;
}

function LiveShop() {
  return (
    <>
      <section className="relative bg-starfield-dense noise-overlay">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
          <p className="font-bangers text-electric-pink text-2xl tracking-widest">⚠ THE DRIP IS LIVE ⚠</p>
          <h1 className="heading text-7xl md:text-9xl text-white mt-3">SHOP THE CHAOS</h1>
          <p className="text-text-primary/85 mt-6 max-w-2xl mx-auto">
            real merch. real chaos. real skelly. fulfilled by Fourthwall — gift to twitch chat while skelly's live.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <GlowButton variant="gold" size="lg" href={FOURTHWALL_SHOP_URL} external>
              OPEN FULL STORE →
            </GlowButton>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="rounded-2xl overflow-hidden border-2 border-purple-core/40 shadow-glow-purple bg-bg-card">
          <iframe
            src={FOURTHWALL_SHOP_URL}
            title="OFFICIALLYSKELLY merch shop"
            className="w-full h-[1200px] bg-bg-card"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-forms"
          />
        </div>
        <p className="text-text-muted text-xs text-center mt-3">
          checkout opens in the full Fourthwall store.
        </p>
      </section>
    </>
  );
}

function ComingSoonShop() {
  return (
    <>
      <section className="relative bg-starfield-dense noise-overlay">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">
          <p className="font-bangers text-electric-pink text-2xl tracking-widest">⚠ DRIP STATUS ⚠</p>
          <h1 className="heading text-7xl md:text-9xl text-white mt-3">THE DRIP IS COMING</h1>
          <p className="text-text-primary/85 mt-6 max-w-2xl mx-auto">
            merch is en route. drop your email below and we'll yell when it goes live.
          </p>
          <div className="max-w-md mx-auto mt-8">
            <EmailCapture cta="NOTIFY ME" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        <h2 className="heading text-4xl text-white">PREVIOUS DROPS</h2>
        <SectionDivider />
        <div className="bg-bg-card border border-purple-core/30 rounded-xl p-12 text-center">
          <p className="font-bangers text-2xl text-electric-pink">no fallen soldiers yet.</p>
          <p className="text-text-muted mt-2">check back after the chaos.</p>
        </div>
      </section>
    </>
  );
}
