import Link from "next/link";
import { notFound } from "next/navigation";
import { listPosts, readPost } from "@/lib/blog";

export function generateStaticParams() {
  return listPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = readPost(params.slug);
  return { title: post?.title ?? "Post" };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = readPost(params.slug);
  if (!post) notFound();

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
    </article>
  );
}
