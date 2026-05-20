# Resend Setup Manual — skellywags.club

Hey Skelly. This walks you through turning on the email list. You'll do this once, then it just works. Total time: about 30 minutes, plus waiting on DNS (which can be up to a few hours but is usually faster).

Until you finish this, the subscribe form on the site still works — it just pings the Discord webhook and writes to the server log. No signups are lost.

## What you need before starting

- The login for the registrar where `skellywags.club` is registered (wherever you bought the domain — Namecheap, GoDaddy, Cloudflare, etc.)
- Your Vercel dashboard access
- A web browser

## Step 1 — Make a Resend account

1. Go to [resend.com](https://resend.com).
2. Click **Sign Up**. Use the same email you use for Vercel if possible (less juggling later).
3. Verify your email when Resend sends the confirmation.

## Step 2 — Verify the domain `skellywags.club`

This proves to Resend that you own the domain so they'll send emails as you.

1. In the Resend dashboard, click **Domains** in the left sidebar.
2. Click **Add Domain**.
3. Type `skellywags.club` and submit.
4. Resend shows you four DNS records: an **MX**, an **SPF** (TXT), a **DKIM** (TXT, sometimes shown as CNAME), and a **DMARC** (TXT). Leave this tab open.
5. Open a new tab and log in to your domain registrar.
6. Find the **DNS records** section for `skellywags.club`.
7. Add each of the four records exactly as Resend shows them. Copy/paste — do not retype.
8. Save the records at the registrar.
9. Go back to the Resend tab and click **Verify DNS Records**.
10. Wait. Green checkmarks usually appear in minutes but can take up to a few hours. If still red after a couple hours, ping Stephen.

## Step 3 — Create an Audience

The Audience is the list your subscribers get added to.

1. In Resend, click **Audiences** in the left sidebar.
2. Click **Create Audience**.
3. Name it `skellywags newsletter` (or whatever you like).
4. After it's created, copy the **Audience ID** — it looks like a long UUID string. You'll paste it into Vercel in a moment.

## Step 4 — Create an API key

1. In Resend, click **API Keys** in the left sidebar.
2. Click **Create API Key**.
3. Name it `skellywags.club production`.
4. Permission: **Full access**.
5. Click **Create**. Copy the key right now — Resend only shows it once. If you lose it, just make a new one.

## Step 5 — Add env vars in Vercel

1. Open your [Vercel dashboard](https://vercel.com) and pick the `skellywags-club` project.
2. Go to **Settings → Environment Variables**.
3. Add two new variables, both scoped to **Production**:
   - Name: `RESEND_API_KEY` · Value: the API key from Step 4
   - Name: `RESEND_AUDIENCE_ID` · Value: the Audience ID from Step 3
4. Click **Save** for each.
5. Either trigger a redeploy from the Vercel dashboard, or wait for the next push to main.

## Step 6 — Test it

1. After the redeploy is done, go to `https://skellywags.club/subscribe`.
2. Drop in your own email and submit.
3. Check three things:
   - Your inbox should get the welcome email (might take a minute, check spam if it doesn't).
   - Your Resend dashboard **Audiences → skellywags newsletter** should show your email as a contact.
   - The Discord notify channel should get the ping (same as before).

If all three happened, you're done. Email capture is live.

## Step 7 — Sending broadcasts later

When you want to email the list (new merch, big stream, weird update), use Resend's **Broadcasts** feature:

1. Resend dashboard → **Broadcasts** → **Create Broadcast**.
2. Pick your audience.
3. Write the subject + body. Resend has a simple editor that handles unsubscribe links automatically.
4. Send. Done.

You never have to touch the website code to send emails.

## Editing the welcome email

The welcome email content lives in Pages CMS under **📧 Welcome Email**. You can edit:

- Whether it sends at all (toggle)
- From name and address (only change `from_address` if you've verified a different domain — otherwise leave it as `hello@skellywags.club`)
- Subject and preheader (preview text)
- Body — markdown. You can use these auto-replaced tokens:
  - `{youtube}` — your YouTube channel URL
  - `{discord}` — Discord invite link
  - `{shop}` — link to /shop
  - `{handle}` — your @handle

Save in Pages CMS, the site rebuilds, the next welcome email uses the new copy.

## Troubleshooting

**Domain stays unverified for hours.**
Double-check that the DNS records at the registrar match Resend exactly — even a stray space breaks them. If still stuck, ping Stephen with a screenshot of both sides.

**Welcome email never arrives.**
Check spam folder first. If still missing, check Resend dashboard → **Logs**. Each send shows a status. If it says "bounced" or "complained", the recipient's mail provider blocked it. If it says "sent" but you don't see it, the issue is on your side.

**Discord ping arrived but Resend dashboard shows no contact.**
That means the site is still in fallback mode — the env vars aren't picked up yet. Try redeploying from Vercel, then test again.

**Anything else weird.**
Ping Stephen. Take a screenshot.
