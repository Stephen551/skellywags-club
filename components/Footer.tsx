import Link from "next/link";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import SocialIcon from "./SocialIcon";
import EmailCapture from "./EmailCapture";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-purple-core/25 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 grid gap-12 md:grid-cols-3">
        <div>
          <h4 className="heading text-2xl text-white mb-4">QUICK LINKS</h4>
          <ul className="space-y-2 text-text-primary/85">
            {[...NAV_LINKS, { href: "/blog", label: "Blog" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-electric-blue transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="heading text-2xl text-white mb-4">SUPPORT</h4>
          <ul className="space-y-2 text-text-primary/85">
            <li>
              <a
                href={`${(process.env.NEXT_PUBLIC_FOURTHWALL_SHOP_URL || "").replace(/\/$/, "")}/pages/shipping-returns`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-electric-blue transition-colors"
              >
                Shipping &amp; Returns
              </a>
            </li>
            <li><Link href="/about" className="hover:text-electric-blue transition-colors">FAQ</Link></li>
            <li><a href="https://discord.gg/zpWv2cXxB9" target="_blank" rel="noreferrer" className="hover:text-electric-blue transition-colors">Contact (Discord)</a></li>
            <li><Link href="/privacy" className="hover:text-electric-blue transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-electric-blue transition-colors">Terms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="heading text-2xl text-white mb-3">GET NOTIFIED WHEN CHAOS DROPS</h4>
          <p className="text-text-muted text-sm mb-4">drop your email. we'll yell when something happens.</p>
          <EmailCapture />
        </div>
      </div>

      <div className="border-t border-purple-core/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.key} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} className="hover:text-electric-blue transition-colors">
                <SocialIcon k={s.key as any} className="w-5 h-5" />
              </a>
            ))}
          </div>
          <div>© {new Date().getFullYear()} OfficiallySkelly · skellywags.club</div>
        </div>
      </div>
    </footer>
  );
}
