import { getPrivacy } from "@/lib/content";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  const doc = getPrivacy();
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20 prose-skelly">
      <h1 className="heading text-5xl text-white">{doc.title}</h1>
      {doc.lastUpdated && (
        <p className="text-text-muted text-sm">Last updated: {doc.lastUpdated}</p>
      )}
      <div dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
}
