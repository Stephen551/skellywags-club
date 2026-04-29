export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20 prose-skelly">
      <h1 className="heading text-5xl text-white">TERMS</h1>
      <p className="text-text-muted text-sm">Last updated: 2026-04-29 · placeholder copy, not legal advice</p>

      <h2>The deal</h2>
      <p>
        skellywags.club is a marketing site run by @OfficiallySkelly. By using it, you agree to be reasonable: don't
        try to break it, don't impersonate anyone, don't post spam or harassment in any submission form.
      </p>

      <h2>Merch (Fourthwall)</h2>
      <p>
        Merch listed on this site is fulfilled by <a href="https://fourthwall.com" target="_blank" rel="noreferrer">Fourthwall</a>.
        Orders, payments, shipping, returns, and customer support for merchandise are governed by Fourthwall's terms,
        not by this site. When you click through to checkout, you're transacting with Fourthwall directly.
      </p>

      <h2>Memberships (YouTube)</h2>
      <p>
        Skellywags Club membership is run on YouTube's channel-membership system. Pricing, perks, billing, and
        cancellation are governed by Google / YouTube's terms. Tier descriptions on this site are informational —
        the canonical perks are what YouTube delivers.
      </p>

      <h2>User submissions</h2>
      <p>
        If you submit fan art (via Discord or Twitter) and Skelly chooses to feature it on the Fan Art Wall, you grant
        permission to display the work on this site with credit. You retain ownership of your art. Submitting
        means you confirm you actually made it.
      </p>

      <h2>Content</h2>
      <p>
        Site copy, branding, and design are © OfficiallySkelly. Embedded YouTube videos remain the property of
        their channel owner. Don't repackage and rehost content from this site without permission.
      </p>

      <h2>No warranties</h2>
      <p>
        The site is provided as-is. We try to keep YouTube counts, Discord member counts, and merch listings fresh
        but they're cached and pulled from third parties — they may briefly go stale or fail. If something's broken,
        ping Skelly on Discord and we'll fix it.
      </p>

      <h2>Liability</h2>
      <p>
        OfficiallySkelly and operators of this site aren't liable for issues arising from the third-party services we
        link to or embed (YouTube, Fourthwall, Discord, Twitch, etc.). Their terms govern their products.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. Continued use after a change means you accept the updates. Material changes will
        be reflected in the "last updated" date.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Ping Skelly on{" "}
        <a href="https://discord.gg/zpWv2cXxB9" target="_blank" rel="noreferrer">Discord</a>.
      </p>

      <p className="text-text-muted text-sm mt-12">
        <em>This is creator-site boilerplate provided for transparency, not formal legal advice. Replace with
        professionally drafted terms (Termly, Iubenda, or counsel) before scaling commercially.</em>
      </p>
    </div>
  );
}
