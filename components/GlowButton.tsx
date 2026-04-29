import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "purple" | "pink" | "ghost";
type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const variantMap: Record<Variant, string> = {
  gold:
    "bg-gold text-bg-primary border-2 border-gold hover:bg-gold-light hover:shadow-glow-gold-lg animate-glow-pulse",
  purple:
    "bg-transparent text-text-primary border-2 border-purple-core hover:border-purple-light hover:bg-purple-core/15 hover:shadow-glow-purple",
  pink:
    "bg-electric-pink text-white border-2 border-electric-pink hover:shadow-glow-pink",
  ghost:
    "bg-transparent text-text-primary border-2 border-white/60 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.35)]",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  external?: boolean;
} & Omit<ComponentProps<"button">, "ref">;

export default function GlowButton({
  children,
  variant = "purple",
  size = "md",
  href,
  className = "",
  external,
  ...rest
}: Props) {
  const cls = `inline-flex items-center justify-center gap-2 font-bebas tracking-wide uppercase rounded-md transition-all duration-200 ${sizeMap[size]} ${variantMap[variant]} ${className}`;
  if (href) {
    if (external || href.startsWith("http")) {
      return (
        <a className={cls} href={href} target="_blank" rel="noreferrer noopener">
          {children}
        </a>
      );
    }
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
