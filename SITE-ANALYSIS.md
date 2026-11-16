# classycaptures.com — site teardown

Scraped **2026-11-16** from `https://classycaptures.com/`.

Classy Captures is a **wedding photography & cinematography studio in Bengaluru (Bangalore), India**,
claiming 30+ years / two generations of work, led by Creative Director **Pavan Sharma**. Besides
weddings it does work for the **Kannada film industry** (cinematography + aerial filming).

---

## 1. Tech stack

| Layer | What it is |
|---|---|
| CMS | WordPress 6.8.12 |
| Page builder | Elementor 4.0.6 (833 references in the homepage HTML) |
| Theme | **Astra** |
| Header/footer | `header-footer-elementor` (Elementor-built header & footer templates) |
| Starter template | `astra-sites` — the Astra/Elementor starter-site importer |
| Forms | **WPForms Lite** (the real forms, on `/` and `/contact-us/`) and **SureForms** (only on the unused `/contact/` page) |
| Blocks | `ultimate-addons-for-gutenberg` |
| Chat | `wp-live-chat-support` |
| Email/marketing | `hostinger-reach` → the site is hosted on **Hostinger** |
| Fonts | Google Fonts — **Montserrat** (dominant), **Jost**, plus Astra's DM Sans / Forum; Roboto & Roboto Slab loaded as Elementor defaults |

### Design tokens
Elementor's global palette was left at **factory defaults** (`#6EC1E4`, `#61CE70`, `#54595F`, `#7A7A7A`),
so nothing is themed globally — every color is hard-coded per widget. The palette actually
rendered on the page is:

| Color | Use |
|---|---|
| `#000000` | backgrounds, type |
| `#FFEFE4` | cream / blush accent — the brand color |
| `#FFFFFF` | type on dark |
| `#5D5151`, `#040001` | minor text tones |
| `#61CE70` | leftover Elementor default green (not intentional) |

---

## 2. Page map

10 published pages, 1 default post (`/hello-world/`), 1 empty category. No blog in use.

| Page | Purpose | Notes |
|---|---|---|
| `/` | Home | Longest page. Sections: BEYOND MOMENTS (hero) → OUR LEGACY → EXPLORE → PERFECT CAPTURES → OUR SERVICES (4 cards) → OUR PHILOSOPHY → CLASSY CAPTURES / TIMELESS MOMENTS → CONTACT US (WPForms) |
| `/about/` | Studio story | ABOUT US → OUR STORY → BEYONG WEDDINGS *(sic — typo for "BEYOND")* → OUR PROMISE |
| `/services/` | Service index | **Headings only** — WEDDINGS / PRE-WEDDINGS / POTRAITS / FILMS with no body copy at all |
| `/weddings/` | Wedding photography | Copy + gallery |
| `/pre-wedding/` | Pre-wedding shoots | Copy + gallery |
| `/potraits/` | Portrait sessions | URL and nav label are misspelled "Potraits" |
| `/films/` | Cinematography | Best-written page: packages listed — Teasers (2–3 min), Highlights (5–8 min), Full Films (30–45 min), Same Day Edits. Autoplays `Website-classy-images-1.mp4` |
| `/gallery/` | Collections | Heaviest page — 134 image references |
| `/contact-us/` | **The real contact page** | WPForms + correct email/phone/address |
| `/contact/` | ⚠️ **Unfinished template leftover** | Still ships the Astra starter-template dummy data: `hello@tyler.com`, `202-555-0188`, "2360 Hood Avenue, San Diego, CA, 92123". Publicly reachable and in the sitemap. |

Navigation (identical on every page): Home · About · Services · Weddings · Pre Wedding · Potraits · Films · Gallery · Contact Us

Footer: phone, email, "Instagram", QUICK LINKS (About Us, Contacts Us, Pre-Weddings), "TIMELESS MOMENTS"

---

## 3. Business / contact details

- **Email:** classycapturesofficial@gmail.com
- **Phone:** +91 70224 44400
- **Address:** #730, Manju Mane, 30th cross, Kengeri Main Road, Purnaprajna Nagar, Uttarahalli Hobli, Bengaluru, Karnataka 560061
- **Services:** luxury wedding photography, candid/documentary wedding photography, pre-wedding shoots, wedding cinematography, portrait sessions (individuals, couples, families), aerial filming, film-industry work
- **Positioning keywords** (clearly SEO-targeted): "best wedding photographers in Bangalore", "luxury wedding photography in Bangalore", "South Indian wedding photography in Bangalore", "best cinematic wedding films in Bangalore", "top wedding photographers in South India"
- **No pricing, no packages (outside film lengths), no testimonials, no team page, no social links.**

---

## 4. Media inventory

- **329** unique media references across the 10 pages
- **96** originals (88 images + 8 videos) and **233** WordPress resized variants
- Uploads are dated `2025/11` (156 refs) and `2025/12` (167 refs), plus 4 leftover `2021/11` starter-template avatars

### Images — the big problem
88 originals total **469 MB**, averaging **5.3 MB each**. Largest files served straight to the browser:

| Size | File |
|---|---|
| 14.5 MB | `uploads/2025/12/11-3.jpg` |
| 14.1 MB | `uploads/2025/12/09-1.jpg` |
| 14.0 MB | `uploads/2025/12/03-1.jpg` |
| 13.9 MB | `uploads/2025/12/3-3.jpg` |
| 13.9 MB | `uploads/2025/12/3-3-1.jpg` |

Only 7 WebP files exist in the whole library — essentially no modern-format delivery.

### Videos — 856 MB total, self-hosted
No YouTube/Vimeo embeds anywhere; every film plays from the WordPress uploads folder.

All 8 are downloaded to `assets/uploads/2025/11/`.

| Size | File | Used on |
|---|---|---|
| 439.2 MB | `Ashutosh-Sathvika-Srikanth-wed-Teaser-HD.mp4` | films |
| 164.2 MB | `Pooja-and-Sourab-Teaser-1.mp4` | films |
| 88.1 MB | `Website-classy-images-1.mp4` | films (autoplay) |
| 68.4 MB | `Website-classy-images-2.mp4` | |
| 49.9 MB | `Website-classy-images-3.mp4` | |
| 41.6 MB | `Website-classy-images-4.mp4` | |
| 2.7 MB | `Wed-Story-03-1.mp4` | |
| 1.8 MB | `Red-outfit-story-01-prewed.mp4` | |

A 439 MB teaser served from shared WordPress hosting with no CDN or adaptive streaming will
effectively never finish loading on mobile data.

---

## 5. Issues found

**Content**
1. `/contact/` is live with San Diego dummy data (`hello@tyler.com`, `202-555-0188`) — delete it or redirect to `/contact-us/`.
2. Two contact pages compete; only `/contact-us/` is linked from the nav, but both are in the sitemap.
3. `/services/` has headings and nothing else — no copy, and it ranks for nothing.
4. "Potraits" is misspelled in the URL, the nav, and the headings ("Portrait" is spelled correctly in the body copy, so it's inconsistent too).
5. "BEYONG WEDDINGS" typo on `/about/`.
6. Homepage form labels are garbled: "Name Message or", "Message Email Name".
7. Footer says "Instagram" but links nowhere — **the site has zero outbound links**, including no social profiles.
8. Default WordPress `/hello-world/` post and "Uncategorized" category still published.
9. `<title>` tags are "Home - classycaptures.com", "About - classycaptures.com" — no keywords, wasting the SEO work done in the body copy.
10. Meta descriptions are auto-generated from the first words on the page, so they read as broken fragments.

**Performance**
11. 469 MB of images, up to 14.5 MB each; no WebP/AVIF pipeline.
12. 856 MB of self-hosted video, one file at 439 MB; no CDN, no streaming, no poster-only fallback.
13. 833 Elementor references on the homepage — 219 KB of HTML before any asset loads.
14. Four Google Font families loaded (Montserrat, Jost, DM Sans/Forum, Roboto/Roboto Slab) where two would do.

**Build**
15. Elementor global colors/fonts are untouched defaults, so the design can't be changed centrally — every value is baked into individual widgets.
16. Two form plugins installed for one job (WPForms Lite + SureForms).
17. Leftover starter-template assets still in the library (`2021/11/avatar_1-4.jpg`).

---

## 6. What's in this folder

```
D:\creative capture\
├─ SITE-ANALYSIS.md        ← this file
├─ content\                10 .md files — title, meta, headings, de-duplicated body text per page
├─ assets\                 96 downloaded files (1.3 GB) mirroring the site's upload paths
│  └─ uploads\{2021,2025}\ all 88 original images + all 8 videos
├─ scrape\
│  ├─ html\                raw HTML of all 10 pages
│  ├─ pages.json           structured per-page data: headings, text lines, links, embeds
│  ├─ assets.json          329 media URLs → which pages use each
│  ├─ sizes.json           HEAD-probed size + content-type for all 96 originals
│  ├─ originals.txt        the 96 original asset URLs
│  ├─ elementor-*.css      Elementor page/kit CSS (design tokens)
│  ├─ dl-images.log        image download log — 88 ok, 0 failures
│  ├─ dl-videos.log        video download log — 6 ok, 2 already present, 0 failures
│  └─ py\                  extract.py, download.py, rescan.py
```

Re-run any stage with:

```bash
python -I scrape/py/extract.py            # re-parse HTML into content/*.md + json
python -I scrape/py/download.py probe     # HEAD-probe sizes of all originals
python -I scrape/py/download.py videos    # fetch videos (all 8 present; re-run skips them)
python -I scrape/py/download.py images    # fetch images (all 88 present; re-run skips them)
```
