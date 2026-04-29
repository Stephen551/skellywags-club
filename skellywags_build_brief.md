# skellywags.club — Complete CC Build Brief
**Creator:** @OfficiallySkelly  
**Domain:** skellywags.club  
**Tagline:** *chaos, bad decisions, and surviving barely*  
**Community name:** Skellywags  
**Content type:** Mixed / variety VTuber  

---

## 1. Platform Architecture

This is a **custom Next.js frontend** that wraps around Fourthwall (merch + memberships) and links to YouTube (videos + memberships). The site does NOT handle payments or fulfillment — Fourthwall and YouTube handle those. The site is the brand hub.

```
Stack:         Next.js 14 (App Router)
Styling:       Tailwind CSS + CSS custom properties
Deployment:    Vercel
Fonts:         Google Fonts — Bebas Neue (headings), Nunito (body), Bangers (chaos accents)
Store backend: Fourthwall (placeholder until merch launches)
Video source:  YouTube Data API v3
Domain:        skellywags.club
```

---

## 2. Social & Platform Links

| Platform  | URL |
|-----------|-----|
| YouTube   | https://www.youtube.com/@officiallyskelly |
| Twitch    | https://twitch.tv/officiallyskelly |
| Discord   | https://discord.gg/zpWv2cXxB9 |
| Instagram | https://instagram.com/officiallyskelly |
| X         | https://twitter.com/itsmeskelly |
| TikTok    | https://tiktok.com/@officiallyskelly |

Include ALL six in nav and footer. Order: YouTube → Twitch → Discord → Instagram → X → TikTok

---

## 3. Design System

### 3.1 Color Tokens
```css
:root {
  /* Backgrounds */
  --bg-primary:       #0D0814;   /* near-black deep purple — main background */
  --bg-secondary:     #1A0F2E;   /* elevated sections */
  --bg-card:          #221540;   /* card surfaces */
  --bg-card-hover:    #2D1A55;   /* card hover state */

  /* Brand Purple (pulled from avatar skin) */
  --purple-core:      #9B5FC0;   /* primary brand color */
  --purple-light:     #C87FE8;   /* highlights, hover text */
  --purple-deep:      #6B2FA0;   /* gradients, depth */
  --purple-glow:      rgba(155, 95, 192, 0.35);

  /* Chaos Accents (from avatar's mismatched eyes) */
  --electric-blue:    #4FC3F7;   /* left eye — links, icons, highlights */
  --electric-pink:    #FF4FCB;   /* right eye — CTAs, hype moments */
  --lightning:        #E8D5FF;   /* lightning bolt decoratives */

  /* Gold (from skull medallion) */
  --gold:             #D4A017;   /* primary CTA buttons */
  --gold-light:       #F0C040;   /* gold hover state */
  --gold-glow:        rgba(212, 160, 23, 0.4);

  /* Text */
  --text-primary:     #F0E8FF;   /* off-white with purple tint */
  --text-muted:       #9080AA;   /* secondary/supporting text */
  --text-bright:      #FFFFFF;   /* pure white for emphasis */

  /* Borders */
  --border-subtle:    rgba(155, 95, 192, 0.25);
  --border-glow:      rgba(79, 195, 247, 0.5);
  --outline-white:    #FFFFFF;   /* avatar-style white outline stroke */
}
```

### 3.2 Typography
```css
/* Headings — tall, bold, maximum hype */
font-family: 'Bebas Neue', sans-serif;

/* Body — warm, readable, not corporate */
font-family: 'Nunito', sans-serif;

/* Chaos callouts — badges, tags, fun labels */
font-family: 'Bangers', cursive;
```

### 3.3 Visual Language Rules
- **Background texture:** Deep space / starfield on all hero sections. Use CSS radial gradients + subtle noise overlay to simulate. NOT flat solid colors.
- **Glow effects:** Purple and electric blue `box-shadow` / `drop-shadow` on cards, buttons, active states. Gold glow on CTAs.
- **White outline stroke:** Key UI elements (cards, avatar displays, tier cards) get a `2px solid white` outline with slight offset — mimics the avatar's art style.
- **Lightning motifs:** Use as section dividers, hover decorations, and background accents. SVG zigzag or CSS clip-path.
- **Skull iconography:** Use as bullet points, section markers, favicon. Reference the skull medallion from the avatar.
- **Animations:** Entrance animations on scroll (fade + slide up). Glow pulse on CTAs. Hover states on all cards (scale 1.02 + glow intensify). Keep it hype, not slow.
- **NO:** flat white backgrounds, corporate blue, Inter font, boring grid-only layouts.

### 3.4 Button Variants
```
Primary (Gold):     bg #D4A017, dark text, gold glow on hover
Secondary (Purple): transparent bg, #9B5FC0 border, purple glow on hover  
Chaos (Pink):       bg #FF4FCB, white text — used sparingly for max hype moments
Ghost:              transparent, white border, subtle glow
```

---

## 4. Copy Tone Guide

**Voice:** Chaotic, loud, fun, irreverent. Like the tagline — "chaos, bad decisions, and surviving barely."

Rules for all copy:
- Buttons are punchy and fun. "JOIN THE CHAOS" not "Sign Up". "GET THE DRIP" not "Shop Now".
- Section headers are dramatic. "THE SKELLYWAG VAULT" not "Members Area".
- Error states are in character. "welp. that broke. very on-brand." 
- Empty states are funny. "nothing here yet. skelly's probably napping."
- Never say "Welcome to" anything. Just dive in.

---

## 5. Site Map

```
/                   Home
/shop               Store (Fourthwall placeholder)
/shop/[collection]  Collection page
/products/[slug]    Product detail
/videos             Videos (public + members-only)
/members            Skellywags Club (membership tiers)
/about              The Lore
/community          Fan art wall + Discord + stream schedule
/blog               News / posts
```

---

## 6. Page Specifications

### 6.1 `/` — Home

**Sections in order:**

**Hero**
- Full viewport height
- Starfield background with purple nebula gradient
- Avatar PNG right-aligned (large, with white outline glow)
- Left side: Channel name "OFFICIALLYSKELLY" in Bebas Neue, massive
- Tagline: *"chaos, bad decisions, and surviving barely"* in Nunito italic
- Two CTAs stacked: `GET THE DRIP →` (gold) and `JOIN THE SKELLYWAGS →` (purple)
- Six social icons below CTAs
- Lightning bolt decorative element crossing the hero diagonally

**Latest Drop Banner**
- Full-width dark band
- Text: "⚠️ NEW DROP INCOMING ⚠️" — placeholder until merch launches
- Sub-text: "drop your email to get notified when the chaos goes live"
- Email input + submit button (hooks into Fourthwall email list)

**Recent Videos**
- Section header: "FRESH CONTENT FROM THE VOID"
- 3-card row pulling from YouTube Data API (latest public videos)
- Each card: thumbnail, title, view count, duration
- "WATCH MORE CHAOS →" link to /videos

**Skellywags Club Pitch**
- Full-width section, darker bg
- Header: "THINK YOU CAN HANDLE IT?"
- Short pitch: "Join the Skellywags. Get exclusive videos, members-only streams, Discord access, and the eternal bragging rights of surviving Skelly's chaos."
- Three tier cards previewed (see /members spec)
- CTA: "BECOME A SKELLYWAG →" (gold)

**Stream Schedule Strip**
- Compact dark band
- Header: "CATCH SKELLY LIVE"
- Four schedule blocks:
  - Tuesday: 8:00 PM – 12:00 AM
  - Wednesday: 4:30 PM – 10:30 PM
  - Friday: 12:00 PM – 3:00 PM
  - Sunday: 12:00 PM – 3:00 PM
- Twitch icon + "WATCH LIVE →" link to twitch.tv/officiallyskelly

**Merch Train Callout**
- Small hype band: "🔥 GIFT MERCH TO TWITCH CHAT WHILE SKELLY IS LIVE — [HOW IT WORKS →]"
- Links to Fourthwall gifting explainer

**Footer** (see Section 8)

---

### 6.2 `/shop` — Store

**State:** Placeholder (merch launching soon)

**Sections:**
- Hero: "THE DRIP IS COMING" — full-width, starfield bg, skull art
- Email capture: "get notified when the store drops" — Fourthwall email list
- Category tiles (placeholders): Apparel | Accessories | Prints | Gift Cards
- "Previous Drops" section — empty state: *"no fallen soldiers yet. check back after the chaos."*
- When merch launches: current drop hero + product grid with category filters + Shop All

**Product Card component:**
- Image with white outline border
- Name in Bebas Neue
- Price in gold
- Hover: scale 1.02 + purple glow + "ADD TO CART" overlay

---

### 6.3 `/videos` — Videos

**Sections:**
- Tab switcher: `ALL VIDEOS` | `💀 SKELLYWAGS ONLY`
- **All Videos tab:** Grid of YouTube embeds via YouTube Data API. 6 per page, load more button.
- **Skellywags Only tab:** 
  - If not a member: blurred card grid with lock icons + "JOIN TO WATCH" overlay. CTA links to /members.
  - If member: unlocked video grid (members-only YouTube videos)
- Filter row: All | Gaming | IRL | Just Vibes (maps to YouTube playlists if available)

---

### 6.4 `/members` — Skellywags Club

**Sections:**

**Hero**
- Header: "JOIN THE SKELLYWAG CREW"
- Sub: "exclusive videos. members-only streams. discord chaos. pick your chaos level."
- Avatar with fist-pump pose

**Tier Cards** (3 cards, side by side)

| | Skellywag Mateys | Skellywag Boatswain | Skellwag First Mate |
|---|---|---|---|
| Price | $1.99/mo | $4.99/mo | $9.99/mo |
| Perks | Loyalty badges, Emoji, Member shout-outs, Members-only chat rooms, Early access to new videos | Members-only videos, Members-only live streams + all previous perks | Skelly's Community Cluster Server (Discord) + all previous perks |
| CTA | JOIN FOR $1.99 | JOIN FOR $4.99 | JOIN FOR $9.99 |
| Style | Ghost button | Purple button | Gold button (featured) |

All CTAs link to YouTube membership join page.

**Twitch Callout Box**
- Dark card with Twitch purple accent
- "ALREADY A TWITCH SUB? 👀"
- "Link your Twitch account at checkout on the merch store for an exclusive sub discount. Skelly rewards loyalty."
- Link: "SHOP THE STORE →"

**Perks Comparison Table**
- Full breakdown of all perks per tier in a scannable table
- Chaotic copy for each perk description

---

### 6.5 `/about` — The Lore

**Sections:**

**Hero**
- Header: "WHO IS SKELLY?"
- Avatar large, centered
- Origin story copy (placeholder — to be filled by creator): 2-3 paragraphs, irreverent tone
- Suggested placeholder: *"A purple skeleton with questionable decision-making skills and somehow a YouTube channel. Nobody's sure how this happened. Skelly least of all."*

**Platform Grid**
- 6 large icon buttons, one per platform
- Each: platform icon, platform name, handle, hover glow in platform color
- YouTube, Twitch, Discord, Instagram, X, TikTok

**Stats Bar** (fun/hype)
- Subscribers: [pulls from YouTube API]
- Skellywags: [membership count — placeholder]
- Streams Survived: [placeholder number]
- Chaos Level: ████████████ MAX

---

### 6.6 `/community` — The Skellywag Clubhouse

**Sections:**

**Stream Schedule**
- Full weekly calendar view
- Tuesday 8PM–12AM, Wednesday 4:30PM–10:30PM, Friday 12PM–3PM, Sunday 12PM–3PM
- Timezone note: display in EST with "(your timezone)" toggle if possible
- "SET A REMINDER →" links to Twitch follow notification

**Discord Widget**
- Embedded Discord widget (discord.gg/zpWv2cXxB9)
- Header: "THE CHAOS CONTINUES IN DISCORD"
- Show online member count + join button

**Fan Art Wall**
- Masonry grid layout
- Placeholder tiles with skull pattern
- Submission form: name, social handle, image upload
- Note: submissions go to a holding state for creator approval before display

**Merch Train Explainer**
- How Fourthwall Twitch gifting works
- Step by step: Watch live → Find merch on site → Gift to chat → FourthwallHQ bot announces winner
- CTA: "WATCH SKELLY LIVE →"

---

### 6.7 `/blog` — News & Chaos Updates

- Simple blog layout
- Posts: title, date, category tag (Update / Drop / Event / Just Vibes), body
- CMS: use markdown files in `/content/blog/` (no external CMS needed initially)
- 3-column card grid on index, full-width article on post page
- Empty state: *"nothing posted yet. skelly's still figuring out how words work."*

---

## 7. Global Components

### Navbar
```
Left:   Logo — skull icon + "OFFICIALLYSKELLY" in Bebas Neue
Center: Shop | Videos | Members | Community | About
Right:  6 social icons (small) + Cart icon (Fourthwall)
Mobile: Hamburger → full-screen overlay menu with avatar bg
```
- Sticky, dark bg with subtle blur backdrop
- Active page indicator: gold underline

### Footer
```
Column 1 — Quick Links:   Shop, Videos, Members, Community, About, Blog
Column 2 — Support:       Shipping & Returns, FAQ, Contact, Privacy Policy, Terms
Column 3 — Newsletter:    "GET NOTIFIED WHEN CHAOS DROPS" — email input (Fourthwall list)
Bottom bar:               6 social icons | © 2025 OfficiallySkelly | skellywags.club
```

### SectionDivider
- SVG lightning bolt motif
- Or: repeating skull pattern (tiny skulls at 20% opacity)

### GlowButton
```jsx
variants: 'gold' | 'purple' | 'pink' | 'ghost'
sizes:    'sm' | 'md' | 'lg'
// Gold: bg gold, dark text, gold box-shadow on hover
// Purple: outline purple, purple glow on hover
// Pink: bg pink, white text — chaos moments only
// Ghost: transparent, white border
```

### ProductCard
- Image (white outline border)
- Name (Bebas Neue)
- Price (gold)
- Hover: scale 1.02, purple glow, "ADD TO CART" slide-up overlay

### VideoCard
- Thumbnail (16:9)
- Title (2 lines max, truncate)
- View count + upload date (muted text)
- Lock variant: blurred thumbnail + skull lock icon + "SKELLYWAGS ONLY" badge
- Hover: scale 1.01, electric blue border glow

### MemberTierCard
- Tier name (Bebas Neue, large)
- Price (gold)
- Perks list with skull bullet points
- CTA button (variant matches tier level)
- Featured (First Mate) gets gold border glow

### StreamScheduleBlock
- Day name (Bebas Neue)
- Time range
- Twitch icon
- Subtle purple card bg

---

## 8. API Integrations

### YouTube Data API v3
- Used on: /videos (public video grid), /about (subscriber count)
- Calls: `playlistItems` (uploads playlist), `channels` (stats)
- Key stored in: `.env.local` as `YOUTUBE_API_KEY`
- Channel ID for @OfficiallySkelly — fetch on build or at runtime

### Fourthwall
- Used on: /shop (products), /members (membership links), cart
- Integration: Fourthwall hosted shop embed OR Fourthwall Storefront API
- Placeholder state: "coming soon" UI until products are live
- Email capture: Fourthwall newsletter signup widget

---

## 9. Environment Variables
```env
YOUTUBE_API_KEY=
NEXT_PUBLIC_FOURTHWALL_SHOP_URL=
NEXT_PUBLIC_DISCORD_WIDGET_ID=zpWv2cXxB9
NEXT_PUBLIC_SITE_URL=https://skellywags.club
```

---

## 10. Build Phase Order for CC

Execute strictly in this order to avoid rework:

**Phase 1 — Foundation**
- [ ] Next.js 14 project scaffold (App Router)
- [ ] Tailwind config with all CSS custom properties from Section 3.1
- [ ] Google Fonts import (Bebas Neue, Nunito, Bangers)
- [ ] Global layout: `layout.tsx` with Navbar + Footer
- [ ] Starfield background utility component

**Phase 2 — Global Components**
- [ ] `<Navbar>` with all 6 social icons + mobile menu
- [ ] `<Footer>` 3-column layout
- [ ] `<GlowButton>` all variants
- [ ] `<SectionDivider>` lightning/skull motif
- [ ] `<VideoCard>` (public + locked variants)
- [ ] `<ProductCard>` (active + placeholder variants)
- [ ] `<MemberTierCard>` (all 3 tiers)
- [ ] `<StreamScheduleBlock>`

**Phase 3 — Static Pages**
- [ ] `/about` — The Lore
- [ ] `/members` — Skellywags Club (all 3 tiers, Twitch callout, perks table)
- [ ] `/shop` — placeholder state with email capture

**Phase 4 — Dynamic Pages**
- [ ] YouTube Data API integration
- [ ] `/videos` — public tab with API data
- [ ] `/about` — subscriber count from API

**Phase 5 — Community Page**
- [ ] `/community` — stream schedule, Discord widget, fan art wall, merch train explainer

**Phase 6 — Blog**
- [ ] `/blog` — markdown file CMS, index + post pages

**Phase 7 — Polish**
- [ ] Scroll entrance animations (fade + slide up)
- [ ] All hover states and micro-interactions
- [ ] Mobile responsiveness pass
- [ ] Favicon (skull icon)
- [ ] Meta tags and OG image for social sharing

---

## 11. Assets Needed from Creator

- [ ] Avatar PNG with transparent background (high res)
- [ ] Any banner or background art
- [ ] Logo file if exists (or use text logo)
- [ ] Favicon skull (or generate from avatar)
- [ ] About page copy (origin story, bio)
- [ ] Membership tier descriptions/copy (can use YouTube defaults above)
- [ ] OG image for social sharing (1200x630)

---

## 12. Notes for CC

- The store is in placeholder state — build the full shop architecture but render "coming soon" UI. All components should be ready to swap real Fourthwall data in.
- Fan art wall submissions need creator approval flow — build the submission form but store submissions in a JSON file or simple API route for now. Do not auto-publish.
- Membership gating on /videos is UI-only for now — blur + lock the members tab. Full auth integration with YouTube/Fourthwall is Phase 2.
- Copy throughout should match the chaotic, irreverent tone in Section 4. Do not use generic placeholder text like "Lorem ipsum" — write in-character placeholders.
- The avatar is the single most important visual asset. Feature it prominently on Home, About, and Members pages.
