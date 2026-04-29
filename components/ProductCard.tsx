import Image from "next/image";

export type Product = {
  slug: string;
  name: string;
  price: string;
  image?: string;
  placeholder?: boolean;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative bg-bg-card border-2 border-white/10 rounded-xl overflow-hidden lift hover:border-white hover:shadow-glow-purple">
      <div className="relative aspect-square bg-bg-secondary overflow-hidden">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-purple-core">
            <svg viewBox="0 0 64 64" className="w-20 h-20 opacity-50">
              <circle cx="32" cy="28" r="20" fill="currentColor" opacity="0.3" />
              <circle cx="24" cy="26" r="3" fill="#0D0814" />
              <circle cx="40" cy="26" r="3" fill="#0D0814" />
            </svg>
          </div>
        )}
        {!product.placeholder && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gold text-bg-primary text-center font-bebas tracking-wider py-3">
            ADD TO CART
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="heading text-xl text-white">{product.name}</h3>
        <p className="text-gold font-bebas text-2xl mt-1">{product.price}</p>
      </div>
    </div>
  );
}
