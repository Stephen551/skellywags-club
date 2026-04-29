# Welcome to skellywags.club, Skelly

Your site is live, public, and 100% yours to control. Here's everything you need.

## Your URLs

| What | URL |
|---|---|
| **Live site** | <https://skellywags.club> |
| **Your CMS** (edit content) | <https://app.pagescms.org/> |
| **Fourthwall** (manage merch) | <https://link.fourthwall.com/dashboard> |
| **Vercel** (deploy logs, domain) | <https://vercel.com> *(Stephen owns this — ping him if needed)* |
| **GitHub repo** (every change saved here) | <https://github.com/Stephen551/skellywags-club> |

---

## First 30 minutes — do these in order

### 1. Accept the GitHub invite
Check your email or <https://github.com/notifications> — there's an invite from Stephen551 to collaborate on `skellywags-club`. Click **Accept**.

### 2. Log in to your CMS
1. Go to <https://app.pagescms.org/>
2. **Sign in with GitHub** (use your `officiallyskelly` account)
3. Authorize Pages CMS to access your repos
4. Pick **Stephen551/skellywags-club** from the list
5. **Bookmark this dashboard** — it's your portal forever

### 3. Test it works
- Open **🛠 Site Identity & Hero Copy**
- Change one word (e.g., add an emoji to the tagline)
- Save
- Wait 60 seconds
- Refresh <https://skellywags.club> — you'll see your change live

If that worked, the whole pipeline works. You can skip the rest of this section.

### 4. Fill in your numbers
- Open **📊 About-page Stats**
- Type your current YouTube channel-member count (from your YouTube creator dashboard) into `skellywags_count`
- Type whatever feels right into `streams_survived`
- Save

### 5. Write your first blog post
- Open **📝 Blog Posts** → **+ New**
- Title: something short and chaotic
- Date: today
- Category: pick one
- Write a teaser excerpt (1 line)
- Write the body — markdown is supported
- Save

Live at `skellywags.club/blog/your-slug` in 60 seconds.

---

## Stuff that updates automatically (you don't do anything)

- **YouTube videos** appear on `/videos` and the homepage as soon as you upload them (refreshes hourly)
- **Subscriber count** on `/about` (refreshes hourly)
- **Discord member count** on `/community` (refreshes every 5 min)
- **Fourthwall products** on `/shop` — when you add a product on Fourthwall, it appears on the site (refreshes every 10 min)

Just keep doing what you do. The site keeps up.

---

## "I want to..." cheat sheet

| Goal | CMS section | Notes |
|---|---|---|
| Launch a merch drop | 🛠 Site Identity → `drop_banner_title` | Flip the banner to "X IS LIVE NOW" |
| End a drop | 🛠 Site Identity → `drop_banner_enabled` off | Hides the banner |
| Post a blog | 📝 Blog Posts → + New | |
| Feature fan art | 🎨 Fan Art Wall → + New | Drag-drop the image, credit the artist |
| Change site colors | 🎨 Theme → cta_color, highlight_color | Hex codes, picks at coolors.co |
| Swap avatar | 🎨 Theme → avatar_url upload | Transparent PNG recommended |
| Edit stream times | 📅 Stream Schedule | Drag to reorder days |
| Update tier prices | 💀 Membership Tiers + 📋 Perks Table | Both should match |
| Add a Q to FAQ | ❓ FAQ Page → items list | Drag to reorder |
| Add a new social platform | 🔗 Social Links | Currently supports YouTube/Twitch/Discord/Instagram/X/TikTok |

---

## Stuff Stephen handles (ping him for these)

- Adding new pages
- Layout / typography / animation changes
- Adding new social platform icons (e.g., Threads, Bluesky)
- Domain or hosting issues
- Anything the CMS doesn't expose

**Discord/text Stephen** for any of the above — usually a 5–10 min fix.

---

## When something breaks

1. **Site down or broken-looking?**
   - First, check <https://www.skellywags.club> from incognito — sometimes it's just your browser cache (hit Ctrl+Shift+R to hard refresh)
   - Still broken? Ping Stephen — every change is in GitHub history and can be rolled back in 30 seconds

2. **Made a CMS edit you regret?**
   - Open the same field, change it back, save
   - Or ping Stephen — Git keeps every previous version forever

3. **CMS won't load?**
   - Check <https://www.pagescms.org/> isn't down (rare)
   - Try logging out and back in
   - Ping Stephen if persistent

---

## A few habits that'll make life easy

- **Use the CMS, not GitHub.** GitHub is the backup. The CMS is where you live.
- **Save often.** Every save = a snapshot in history. Easy to roll back.
- **Test on mobile.** Always check `skellywags.club` on your phone after big edits — that's where most fans visit.
- **Tag shorts with #shorts** in the YouTube title (you already do this) — it tells the website where to bucket them.
- **Don't edit `lib/` or `app/` files in GitHub** — that's the code, the CMS handles your needs.

---

## Anything else?

The deeper reference for power users is in [`EDITOR_GUIDE.md`](./EDITOR_GUIDE.md) — but honestly, this doc covers 99% of what you'll do.

Welcome to the chaos. The site's yours.

— Stephen
