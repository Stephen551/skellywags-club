import Image from "next/image";
import EmailCapture from "@/components/EmailCapture";
import GlowButton from "@/components/GlowButton";
import SectionDivider from "@/components/SectionDivider";
import { FOURTHWALL_SHOP_URL } from "@/lib/constants";
import { fetchAllProducts, formatMoney, type FwProduct } from "@/lib/fourthwall";

export const revalidate = 600;
export const metadata = { title: "Shop" };

export default async function ShopPage() {
  if (!FOURTHWALL_SHOP_URL) return <ComingSoonShop />;
  const products = await fetchAllProducts();
  return <LiveShop products={products} />;
}

function LiveShop({ products }: { products: FwProduct[] }) {
  return (
    <>
      <section className="relative bg-starfield-dense noise-overlay">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-20 text-center">
          <p className="font-bangers text-electric-pink text-2xl tracking-widest reveal">⚠ THE DRIP IS LIVE ⚠</p>
          <h1 className="heading text-7xl md:text-9xl text-white mt-3 reveal">SHOP THE CHAOS</h1>
          <p className="text-text-primary/85 mt-6 max-w-2xl mx-auto reveal">
            real merch. printed-on-demand by Fourthwall, shipped worldwide. gift to twitch chat while skelly's live.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center reveal">
            <GlowButton variant="gold" size="lg" href={FOURTHWALL_SHOP_URL} external>
              OPEN THE STORE →
            </GlowButton>
            <GlowButton variant="purple" size="lg" href="/community#merch-train">
              HOW MERCH TRAIN WORKS
            </GlowButton>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <h2 className="heading text-4xl md:text-5xl text-white text-center">FRESH DRIP</h2>
        <p className="text-text-muted text-center mt-2">
          {products.length > 0
            ? "live in the store. click any to checkout."
            : "the vault is loading. check back in a sec."}
        </p>
        <SectionDivider />

        {products.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
            <ComingDropsTile />
          </div>
        ) : (
          <FallbackGrid />
        )}

        <div className="text-center mt-12">
          <GlowButton variant="ghost" href={FOURTHWALL_SHOP_URL} external>
            BROWSE EVERYTHING IN THE STORE →
          </GlowButton>
        </div>
      </section>

      <section className="bg-bg-secondary py-14">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-bangers text-electric-pink text-2xl tracking-widest">🔥 GIFT MERCH ON STREAM 🔥</p>
          <p className="text-text-primary/90 mt-4">
            Skelly's Twitch chat can gift merch to other chatters live. FourthwallHQ bot announces the lucky chaos
            recipient on stream.
          </p>
          <div className="mt-6">
            <GlowButton variant="purple" href="/community#merch-train">HOW IT WORKS →</GlowButton>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductTile({ product }: { product: FwProduct }) {
  return (
    <a
      href={product.productUrl}
      target="_blank"
      rel="noreferrer"
      className="group bg-bg-card border-2 border-white/10 rounded-xl overflow-hidden lift hover:border-white hover:shadow-glow-purple flex flex-col"
    >
      <div className="relative aspect-square bg-bg-secondary overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bangers text-electric-pink text-3xl">SKELLYWAGS</span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <h3 className="heading text-xl text-white line-clamp-2">{product.name}</h3>
        <div className="mt-3 flex items-end justify-between">
          <p className="font-bebas text-3xl text-gold leading-none">
            {formatMoney(product.price, product.currency)}
          </p>
          <span className="font-bangers text-electric-pink text-sm tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            SHOP →
          </span>
        </div>
      </div>
    </a>
  );
}

function ComingDropsTile() {
  return (
    <a
      href={FOURTHWALL_SHOP_URL}
      target="_blank"
      rel="noreferrer"
      className="group bg-bg-card border-2 border-purple-core/40 rounded-xl overflow-hidden flex flex-col items-center justify-center p-8 text-center lift hover:border-electric-pink hover:shadow-glow-pink"
    >
      <svg viewBox="0 0 64 64" className="w-16 h-16 text-electric-pink opacity-80 mb-4">
        <path
          fill="currentColor"
          d="M32 8c-10 0-18 8-18 18 0 6 3 10 6 12v6a2 2 0 0 0 2 2h4v-4h4v4h4v-4h4v4h4a2 2 0 0 0 2-2v-6c3-2 6-6 6-12 0-10-8-18-18-18Z"
        />
      </svg>
      <p className="heading text-2xl text-white">MORE DROPS COMING</p>
      <p className="text-text-muted text-sm mt-2 max-w-xs">
        new chaos lands every drop. browse the full store for everything live.
      </p>
      <p className="font-bangers text-electric-pink text-sm mt-4 tracking-widest">SEE THE STORE →</p>
    </a>
  );
}

function FallbackGrid() {
  return (
    <div className="bg-bg-card border border-purple-core/30 rounded-xl p-12 text-center">
      <p className="font-bangers text-2xl text-electric-pink">store is warming up.</p>
      <p className="text-text-muted mt-2">
        if products don't appear in a minute, hit{" "}
        <a href={FOURTHWALL_SHOP_URL} target="_blank" rel="noreferrer" className="text-electric-blue hover:text-electric-pink underline">
          the full store
        </a>{" "}
        directly.
      </p>
    </div>
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
