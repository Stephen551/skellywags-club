const TOKEN = process.env.FOURTHWALL_STOREFRONT_TOKEN;
const SHOP_URL = process.env.NEXT_PUBLIC_FOURTHWALL_SHOP_URL || "";
const API = "https://storefront-api.fourthwall.com/v1";

export type FwProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  productUrl: string;
};

type Money = { value: number; currency: string };
type FwImage = { url?: string; transformedUrl?: string };
type FwVariant = { unitPrice?: Money; stock?: { type?: string; inStock?: number } };
type FwApiProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  state?: { type?: string };
  access?: { type?: string };
  images?: FwImage[];
  variants?: FwVariant[];
};

type Page<T> = { results?: T[]; content?: T[]; data?: T[] };

function pickProductImage(p: FwApiProduct): string | null {
  const img = p.images?.[0];
  if (!img) return null;
  return img.transformedUrl || img.url || null;
}

function pickPrice(p: FwApiProduct): Money | null {
  const variant = p.variants?.find((v) => v.unitPrice) ?? p.variants?.[0];
  return variant?.unitPrice ?? null;
}

function isPublic(p: FwApiProduct): boolean {
  const stateOk = !p.state?.type || p.state.type === "AVAILABLE" || p.state.type === "PUBLIC";
  const accessOk = !p.access?.type || p.access.type === "PUBLIC";
  return stateOk && accessOk;
}

async function fwFetch<T>(path: string): Promise<T | null> {
  if (!TOKEN) return null;
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API}${path}${sep}storefront_token=${encodeURIComponent(TOKEN)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function arrayFrom<T>(p: Page<T> | T[] | null | undefined): T[] {
  if (!p) return [];
  if (Array.isArray(p)) return p;
  return p.results ?? p.content ?? p.data ?? [];
}

export async function fetchAllProducts(): Promise<FwProduct[]> {
  if (!TOKEN || !SHOP_URL) return [];

  const collectionsPage = await fwFetch<Page<{ slug: string }> | { slug: string }[]>("/collections?size=50");
  const collections = arrayFrom(collectionsPage);
  if (collections.length === 0) return [];

  const seen = new Map<string, FwProduct>();
  for (const c of collections) {
    const productsPage = await fwFetch<Page<FwApiProduct> | FwApiProduct[]>(
      `/collections/${encodeURIComponent(c.slug)}/products?size=50`
    );
    const products = arrayFrom(productsPage);
    for (const p of products) {
      if (!isPublic(p) || seen.has(p.id)) continue;
      const money = pickPrice(p);
      seen.set(p.id, {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: money?.value ?? 0,
        currency: money?.currency ?? "USD",
        imageUrl: pickProductImage(p),
        productUrl: `${SHOP_URL.replace(/\/$/, "")}/products/${p.slug}`,
      });
    }
  }
  return Array.from(seen.values());
}

export function formatMoney(amount: number, currency: string): string {
  if (currency === "USD") return `$${amount.toFixed(2)}`;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
