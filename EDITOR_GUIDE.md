# skellywags.club — Editor's Guide

A pocket reference for Skelly. Every section of the site is editable from the CMS — this doc tells you which knob to turn for what.

## How to log in

1. Open <https://app.pagescms.org/>
2. Click **Sign in with GitHub**
3. Pick the **Stephen551/skellywags-club** repo
4. Bookmark the dashboard

Every save commits to GitHub. The site rebuilds automatically and the change goes live in **~60 seconds**.

---

## "I want to..."

### ...launch a merch drop

1. Open **🛠 Site Identity & Hero Copy**
2. Set `drop_banner_title` to your drop announcement (e.g. `🔥 SKULL HOODIE LIVE NOW`)
3. Set `drop_banner_subtitle` to a hype line
4. Confirm `drop_banner_enabled` is **on**
5. Save

The big banner on the homepage updates instantly. After the drop is over, flip `drop_banner_enabled` off (or change it back to "NEW DROP INCOMING" for the next launch).

### ...post a blog update

1. Open **📝 Blog Posts** → **+ New**
2. Fill in title, today's date, category (Update / Drop / Event / Just Vibes)
3. Write a 1-line excerpt — this shows on the index card
4. Write the body in the rich-text editor (use ## for section headings)
5. Save → live in 60 sec at `/blog/your-slug`

### ...feature fan art

1. Save the artist's image to your computer
2. Open **🎨 Fan Art Wall** → **+ New**
3. Type the artist's @ handle, link their social (optional but they'll appreciate the credit)
4. Drag-drop the image into the upload field
5. Save

### ...change the site colors

1. Open **🎨 Theme — Colors & Avatar**
2. Update `cta_color` (hex) — drives every gold/cyan button
3. Update `highlight_color` (hex) — drives the @handle pink + drop banner accents
4. Save → entire site recolors

Need a color picker? Use [coolors.co](https://coolors.co) or [color.adobe.com](https://color.adobe.com).

### ...change the fonts

1. Open **🎨 Theme — Colors & Avatar**
2. Three font fields:
   - `heading_font` — big titles like OFFICIALLY SKELLY, section headers, all CTA buttons
   - `body_font` — paragraph copy, descriptions
   - `accent_font` — @handle, drop banner, chaos callouts
3. Pick from the dropdown OR **type any Google Font name** as a custom (e.g., `Lobster`, `Press Start 2P`, `Creepster`). Browse <https://fonts.google.com> to find one.
4. Save

**Curated picks (pre-loaded, instant):**
- Heading: `bebas-neue` · `anton` · `black-ops-one` · `bowlby-one` · `russo-one`
- Body: `nunito` · `inter` · `poppins` · `quicksand` · `karla`
- Accent: `bangers` · `permanent-marker` · `rampart-one`

**Custom Google Fonts:** type the exact name from Google Fonts, case-sensitive. The site fetches it from Google Fonts on first load — adds ~1 second to initial page load while the font downloads, then cached. If you typo the name, the font will silently fall back to the previous one.

### ...use a font that ISN'T on Google Fonts

If your font is from FontShare, Adobe Fonts, fontspring, or anywhere else, paste its CSS into the **`custom_font_css`** field in **🎨 Theme**:

**FontShare example** (free fonts at <https://fontshare.com>):
```css
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');
```
Then in `heading_font`, type `Satoshi`.

**Adobe Fonts (Typekit)** — copy the embed URL from your Typekit project:
```css
@import url("https://use.typekit.net/abc1234.css");
```
Then in `heading_font`, type the family name (e.g. `proxima-nova`).

**Self-hosted font file** — if you have a .woff2 file for "Comico" or any other font:
1. Send the file to Stephen — he'll drop it in `public/fonts/`
2. Then paste this into `custom_font_css`:
```css
@font-face {
  font-family: 'Comico';
  src: url('/fonts/comico.woff2') format('woff2');
  font-display: swap;
}
```
3. Type `Comico` in `heading_font` (or wherever you want it).

**Already have a font you bought?** Most paid fonts come with a `.css` file showing the @font-face rules. Just paste those rules verbatim into `custom_font_css`. The font files need to be hosted somewhere reachable (your own server, Stephen drops them in /public, or a CDN you have access to).

**The CSP allows these font hosts by default**: Google Fonts, FontShare, Adobe Fonts (Typekit), and your own server. If a font from a different host doesn't load, ping Stephen — it's a 1-line CSP change to add the new host.

### ...swap the avatar

1. Open **🎨 Theme — Colors & Avatar**
2. Click the avatar field → upload your new transparent PNG
3. Save → updates everywhere (home, about, members, 404)

### ...update channel-member count on /about

1. Open **📊 About-page Stats**
2. Set `skellywags_count` to your current YouTube member count (check creator dashboard)
3. Set `streams_survived` to whatever feels right
4. Save

(Subscriber count + video count auto-pull from YouTube, no need to update those.)

### ...change stream times

1. Open **📅 Stream Schedule**
2. Edit any block, drag to reorder, or add new ones
3. Save — updates home strip + community page

### ...update the Skellywags Club pitch

1. Open **🛠 Site Identity & Hero Copy**
2. Edit `club_pitch_heading`, `club_pitch_body`, `club_pitch_cta_label`
3. Save

### ...add a Q to the FAQ

1. Open **❓ FAQ Page** → click into the items list
2. Add a new entry (question + answer)
3. Drag to reorder if needed
4. Save

### ...change tier prices or perks

1. Open **💀 Membership Tiers** → edit price/cta/perks fields
2. Also open **📋 Membership Perks Table** to update the comparison row
3. Save both

### ...add a new social platform (e.g. Threads, Bluesky)

1. Open **🔗 Social Links**
2. Add a new entry
3. Pick the icon key (must be one of: youtube/twitch/discord/instagram/x/tiktok — if your platform isn't there, ping Stephen to add the SVG)
4. Save

---

## What's auto-pulled (don't bother editing)

- **YouTube videos + thumbnails** on /videos and home — pulls every hour
- **Subscriber count** on /about — pulls every hour
- **Discord member count** on /community — pulls every 5 minutes
- **Fourthwall products** on /shop — pulls every 10 minutes

Just upload to YouTube / add products in Fourthwall — the website catches up automatically.

---

## What I can't change myself

These need a developer:

- Site layout (which sections appear in what order)
- Animations
- Adding new pages
- Brand purple + dark background colors

Ping Stephen if you need any of those.

---

## Tips

- **Preview before publish:** Pages CMS doesn't have a preview, but every save shows up live in ~60 seconds. Refresh the live site to see it.
- **Made a typo?** Open the section, fix it, save. New deploy in 60 sec.
- **Reverted commit:** If you ever publish something you regret, ping Stephen — every change is in GitHub history and can be rolled back instantly.
- **Mobile-first:** the site is fully responsive. Test on your phone after big edits.

---

*Site by Stephen + Skelly · skellywags.club*
