export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20 prose-skelly">
      <h1 className="heading text-5xl text-white">PRIVACY POLICY</h1>
      <p className="text-text-muted text-sm">Last updated: 2026-04-29 · placeholder copy, not legal advice</p>

      <h2>What this site is</h2>
      <p>
        skellywags.club is the brand hub for the YouTube creator @OfficiallySkelly. We host marketing content,
        link to merch (Fourthwall) and memberships (YouTube), and embed live data from his public channels.
        We are not a store, not a payment processor, and not an identity provider.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Email address</strong> — only if you submit it via a "notify me" or newsletter form. Used to alert you about merch drops and major site updates.</li>
        <li><strong>Standard server logs</strong> — IP address, user-agent, request path, timestamp. Hosted on Vercel; retained per Vercel's policies. Used for abuse prevention and analytics.</li>
        <li><strong>Anonymous analytics</strong> — page views, traffic sources. Configured (when enabled) without personal identifiers.</li>
      </ul>

      <h2>What we don't collect</h2>
      <ul>
        <li>We do not run ad-tech tracking or sell data.</li>
        <li>We do not store payment details — Fourthwall handles all merch transactions on their own infrastructure.</li>
        <li>Membership signups happen on YouTube, not here. YouTube governs that data.</li>
      </ul>

      <h2>Third parties we link to / embed</h2>
      <ul>
        <li><strong>YouTube</strong> — video data, subscriber count, embeds. Governed by Google's privacy policy.</li>
        <li><strong>Fourthwall</strong> — merch products, checkout. Their privacy policy applies for purchases.</li>
        <li><strong>Discord</strong> — invite + live member-count widget. Governed by Discord's privacy policy.</li>
        <li><strong>Vercel</strong> — site hosting.</li>
        <li><strong>Cloudflare</strong> — DNS + edge.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use only what's necessary for the site to function (and what Vercel/Cloudflare set for delivery and
        security). We do not run third-party advertising cookies.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request deletion of any email you've submitted by messaging Skelly on{" "}
        <a href="https://discord.gg/zpWv2cXxB9" target="_blank" rel="noreferrer">Discord</a>. We honor requests in a reasonable timeframe.
      </p>

      <h2>Changes</h2>
      <p>
        We'll update this page if anything material changes. The "last updated" date at the top will reflect the
        most recent revision.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions, ping Skelly on{" "}
        <a href="https://discord.gg/zpWv2cXxB9" target="_blank" rel="noreferrer">Discord</a>.
      </p>

      <p className="text-text-muted text-sm mt-12">
        <em>This is creator-site boilerplate provided for transparency, not formal legal advice. Replace with a
        professionally generated policy (Termly, Iubenda, or counsel) before scaling commercially.</em>
      </p>
    </div>
  );
}
