import Link from "next/link";
import SectionDivider from "@/components/SectionDivider";
import { listPosts } from "@/lib/blog";

export const metadata = { title: "News & Chaos Updates" };

const CATEGORY_COLOR: Record<string, string> = {
  Update: "bg-electric-blue/15 text-electric-blue border-electric-blue/40",
  Drop: "bg-gold/15 text-gold border-gold/50",
  Event: "bg-electric-pink/15 text-electric-pink border-electric-pink/40",
  "Just Vibes": "bg-purple-core/15 text-purple-light border-purple-core/40",
};

export default function BlogPage() {
  const posts = listPosts();

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
      <h1 className="heading text-6xl md:text-7xl text-white">NEWS &amp; CHAOS UPDATES</h1>
      <p className="text-text-muted mt-3">whatever skelly has been up to, freshly typed.</p>
      <SectionDivider />
      {posts.length === 0 ? (
        <div className="bg-bg-card border border-purple-core/30 rounded-xl p-12 text-center">
          <p className="font-bangers text-3xl text-electric-pink">nothing posted yet.</p>
          <p className="text-text-muted mt-2">skelly's still figuring out how words work.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="bg-bg-card border border-purple-core/30 rounded-xl p-6 lift hover:border-electric-blue hover:shadow-glow-blue"
            >
              <span className={`inline-block text-xs font-bangers tracking-wider px-3 py-1 rounded-full border ${CATEGORY_COLOR[p.category] || CATEGORY_COLOR["Just Vibes"]}`}>
                {p.category}
              </span>
              <h2 className="heading text-2xl text-white mt-4">{p.title}</h2>
              <p className="text-text-muted text-sm mt-2">{p.date}</p>
              {p.excerpt && <p className="text-text-primary/80 mt-3 line-clamp-3">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
