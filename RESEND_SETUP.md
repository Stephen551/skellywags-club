# Resend Setup Manual - skellywags.club

Hey Skelly. This walks you through turning on the email list. You'll do this once, then it just works. Total time: about 30 minutes, plus waiting on DNS, which can take a few hours but is usually faster.

Until you finish this, the subscribe form on the site still works in fallback mode: it pings the Discord webhook if configured and writes every email to the subscribers store if Stephen has wired Upstash. No signups are lost. When Resend is ready, you can backfill anyone who signed up early via CSV import.

## What you need before starting

- The login for the registrar where `skellywags.club` is registered, such as Namecheap, GoDaddy, Cloudflare, or wherever the domain was bought.
- Your Vercel dashboard access.
- Your Resend dashboard access.

## Step 1 - Make a Resend account

1. Go to [resend.com](https://resend.com).
2. Click **Sign Up**. Use the same email you use for Vercel if possible.
3. Verify your email when Resend sends the confirmation.

## Step 2 - Verify the domain `skellywags.club`

This proves to Resend that you own the domain so the site can send from `hello@skellywags.club`.

1. In the Resend dashboard, click **Domains** in the left sidebar.
2. Click **Add Domain**.
3. Type `skellywags.club` and submit.
4. Resend shows DNS records for the domain, usually SPF, DKIM, and optionally DMARC/return-path records. Leave this tab open.
5. Open a new tab and log in to your domain registrar.
6. Find the **DNS records** section for `skellywags.club`.
7. Add each record exactly as Resend shows it. Copy and paste instead of retyping.
8. Save the records at the registrar.
9. Go back to Resend and click **Verify DNS Records**.
10. Wait. Green checkmarks usually appear in minutes but can take a few hours.

## Step 3 - Optional: Create a Segment

Resend's current dashboard uses global **Contacts**. The site can add contacts with only an API key, so this step is optional.

If you want these signups grouped for broadcasts:

1. In Resend, open **Audience**.
2. Open **Segments**.
3. Create a Segment named `skellywags newsletter` or whatever you like.
4. Copy the **Segment ID**. You'll paste it into Vercel in a moment.

If your Resend account still has the older **Audiences** dashboard, you can create an Audience instead and copy its **Audience ID**. The site supports that legacy setup too.

## Step 4 - Create an API key

1. In Resend, click **API Keys** in the left sidebar.
2. Click **Create API Key**.
3. Name it `skellywags.club production`.
4. Permission: **Full access**. If Resend offers scoped permissions in your dashboard, make sure it can create contacts and send emails.
5. Click **Create**. Copy the key right now. Resend only shows it once. If you lose it, make a new one.

## Step 5 - Add env vars in Vercel

1. Open your [Vercel dashboard](https://vercel.com) and pick the `skellywags-club` project.
2. Go to **Settings -> Environment Variables**.
3. Add these variables, scoped to **Production**:
   - Name: `RESEND_API_KEY`; value: the API key from Step 4.
   - Optional: `RESEND_SEGMENT_ID`; value: the Segment ID from Step 3.
   - Legacy only: `RESEND_AUDIENCE_ID`; value: the Audience ID from Step 3, if your Resend dashboard still uses Audiences.
   - Optional: `SUBSCRIBER_NOTIFY_EMAIL`; value: `skellysofficialemail@gmail.com`. This is already the code default, but setting it in Vercel makes it easy to change later.
4. Click **Save** for each.
5. Trigger a redeploy from Vercel, or wait for the next push to main.

## Step 6 - Test it

1. After the redeploy is done, go to `https://skellywags.club/subscribe`.
2. Submit your own email.
3. Check these things:
   - Your inbox should get the welcome email. Check spam if it does not arrive within a minute.
   - `skellysofficialemail@gmail.com` should get a notification email with the new subscriber address.
   - Resend dashboard -> **Audience -> Contacts** should show your email as a contact.
   - If you set `RESEND_SEGMENT_ID`, your contact should also appear in that Segment.
   - The Discord notify channel should get the ping if `DISCORD_NOTIFY_WEBHOOK` is configured.

If those happened, email capture is live.

## Step 7 - Sending broadcasts later

When you want to email the list, use Resend's **Broadcasts** feature:

1. Resend dashboard -> **Broadcasts** -> **Create Broadcast**.
2. Pick the contacts or segment you want to send to.
3. Write the subject and body. Resend handles unsubscribe flows for broadcasts.
4. Send.

You do not have to touch website code to send broadcasts.

## Editing the welcome email

The welcome email content lives in Pages CMS under **Welcome Email**. You can edit:

- Whether it sends at all.
- From name and address. Only change `from_address` if you have verified a different domain; otherwise leave it as `hello@skellywags.club`.
- Subject and preheader.
- Body markdown.

The body can use these tokens:

- `{youtube}` - YouTube channel URL.
- `{discord}` - Discord invite link.
- `{shop}` - link to `/shop`.
- `{handle}` - creator handle.

## Troubleshooting

**Domain stays unverified for hours.**
Double-check that the DNS records at the registrar match Resend exactly. Even a stray space or wrong host value can break verification.

**Discord ping arrived but Resend dashboard shows no contact.**
The site is probably still in fallback mode. Make sure `RESEND_API_KEY` is set in Vercel Production and the project has redeployed since you added it.

**Contact appears in Resend but no welcome email arrives.**
Check Resend dashboard -> **Logs**. If the contact is stored but the email send failed, the site still returns success so the signup is not lost. The welcome email sends from `hello@skellywags.club`, so the verified Resend domain must cover `skellywags.club`.

**Welcome email says it sent but you cannot find it.**
Check spam, promotions, and Resend Logs. If Resend says delivered, the remaining issue is usually on the recipient mailbox side.

---

# Resend Inbound forwarding

Use this when Gmail needs to verify `skelly@skellywags.club`, or when you want incoming mail for that address forwarded to `skellysofficialemail@gmail.com`.

## Vercel env vars

Add these in Vercel Production and redeploy:

- `INBOUND_FORWARD_EMAIL` - `skellysofficialemail@gmail.com`
- `RESEND_INBOUND_WEBHOOK_TOKEN` - any long random string

`RESEND_API_KEY` must already be set.

## Resend webhook

In Resend, create a webhook:

- Endpoint URL: `https://skellywags.club/api/resend/inbound?token=YOUR_RANDOM_TOKEN`
- Event type: `email.received`

Use the exact same token value as `RESEND_INBOUND_WEBHOOK_TOKEN`.

## Resend receiving domain

In Resend, open the verified `skellywags.club` domain and enable **Receiving** / **Inbound**. Resend will show an MX record. Add that MX record in the domain's DNS.

Important: if another mail service already has MX records for `skellywags.club`, do not replace them unless you intend Resend to receive all mail for the domain. Resend says its receiving MX must be the lowest priority value to receive mail. For this project, that is okay only if Resend is the inbound service for the domain.

Once this is verified, mail sent to `skelly@skellywags.club` will hit the webhook and forward to `skellysofficialemail@gmail.com`.

---

# Subscribers store + admin portal

This documents the Upstash Redis store that captures every signup and the basic-auth admin portal at `/admin/subscribers`. The store works independently of Resend, so signups can be persisted before Resend is ready and used as a backup forever.

## One-time Vercel setup

1. Vercel project -> **Storage** -> **Marketplace** -> **Upstash** -> **Redis** -> Create.
2. Link it to the `skellywags-club` project. Pick the closest region, probably `iad1` or US East.
3. Vercel auto-injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
4. Add `ADMIN_PASSWORD` manually. This is the password for the admin portal. Username does not matter.
5. Redeploy or push to main.

## Using the admin portal

Once live, visit `https://skellywags.club/admin/subscribers`. Browser prompts for credentials; use any username and the `ADMIN_PASSWORD` you set.

The page shows:

- Total subscriber count.
- How many were captured before Resend was configured (`mode=fallback`).
- How many were captured after Resend was configured (`mode=resend`).
- A table of every email with capture timestamp and mode.
- A CSV download you can import into Resend if needed.

When `ADMIN_PASSWORD` is unset, the admin route returns 404.

## Storage model

- One Redis hash, key `subscribers`, field = email, value = JSON `{ email, ts, mode }`.
- First write wins per email, so re-subscribes do not overwrite the original capture timestamp.
- Free Upstash tier is more than enough for a small creator site.
- If Upstash env vars are not set, the store silently no-ops. Signups can still go to Resend and Discord.
