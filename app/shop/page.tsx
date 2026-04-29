import EmailCapture from "@/components/EmailCapture";
import ProductCard from "@/components/ProductCard";
import SectionDivider from "@/components/SectionDivider";

export const metadata = { title: "Shop" };

const CATEGORIES = ["Apparel", "Accessories", "Prints", "Gift Cards"];

export default function ShopPage() {
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

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <h2 className="heading text-4xl text-white">CATEGORIES (COMING SOON)</h2>
        <SectionDivider />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <div
              key={c}
              className="bg-bg-card border-2 border-purple-core/30 rounded-xl aspect-square flex flex-col items-center justify-center text-center lift hover:border-white"
            >
              <p className="heading text-2xl text-white">{c}</p>
              <p className="text-text-muted text-xs mt-2 font-bangers">soon</p>
            </div>
          ))}
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

      {/* Future product grid (hidden until merch launches): */}
      <section className="hidden">
        <ProductCard product={{ slug: "x", name: "x", price: "$0", placeholder: true }} />
      </section>
    </>
  );
}
