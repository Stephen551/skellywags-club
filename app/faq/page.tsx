import SectionDivider from "@/components/SectionDivider";
import { getFaq } from "@/lib/content";

export const metadata = { title: "FAQ" };

export default function FaqPage() {
  const faq = getFaq();
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
      <h1 className="heading text-6xl md:text-7xl text-white">FAQ</h1>
      {faq.intro && <p className="text-text-muted mt-3">{faq.intro}</p>}
      <SectionDivider />

      {faq.items.length === 0 ? (
        <div className="bg-bg-card border border-purple-core/30 rounded-xl p-12 text-center">
          <p className="font-bangers text-2xl text-electric-pink">no questions yet.</p>
          <p className="text-text-muted mt-2">add some in the CMS.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faq.items.map((item, i) => (
            <details
              key={i}
              className="group bg-bg-card border border-purple-core/30 rounded-xl overflow-hidden lift hover:border-electric-blue"
            >
              <summary className="cursor-pointer list-none px-6 py-5 flex items-start justify-between gap-4">
                <h3 className="heading text-xl text-white pr-2">{item.question}</h3>
                <span className="font-bebas text-electric-pink text-2xl leading-none transition-transform group-open:rotate-45 select-none">
                  +
                </span>
              </summary>
              <div className="px-6 pb-5 text-text-primary/90 leading-relaxed border-t border-purple-core/20 pt-4">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
