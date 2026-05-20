import Link from "next/link";
import { notFound } from "next/navigation";
import { listPosts, readPost } from "@/lib/blog";
import { getSite } from "@/lib/content";
import EmailCapture from "@/components/EmailCapture";

export function generateStaticParams() {
  return listPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = readPost(params.slug);
  if (!post) return { title: "Post" };
  const description = post.seoDescription || post.excerpt;
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, type: "article" },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = readPost(params.slug);
  if (!post) notFound();
  const site = getSite();

  return (
    <article className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
      <Link href="/blog" className="font-bebas tracking-wide text-electric-blue hover:text-electric-pink">
        ← BACK TO POSTS
      </Link>
      <p className="font-bangers text-electric-pink mt-6 tracking-widest">
        {post.category} · {post.date}
      </p>
      <h1 className="heading text-5xl md:text-6xl text-white mt-2">{post.title}</h1>
      <div
        className="prose-skelly mt-10"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <aside className="mt-16 pt-10 border-t border-purple-core/30">
        <h2 className="heading text-3xl text-white">
          {site.blog_subscribe_heading}
        </h2>
        <p className="text-text-muted text-sm mt-2 mb-5">
          {site.blog_subscribe_subheading}
        </p>
        <EmailCapture cta="DROP IT" />
      </aside>
    </article>
  );
}
