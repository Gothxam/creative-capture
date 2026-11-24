/**
 * Every word on the site.
 *
 * Copy marked `source: "studio"` is the studio's own wording, carried over
 * verbatim from classycaptures.com. Copy marked `source: "written"` fills gaps
 * where the original site had headings but no body text (the Services page) or
 * where a section is new to this rebuild — review before launch.
 */

export const STUDIO = {
  name: "Classy Captures",
  tagline: "Timeless Moments",
  city: "Bengaluru",
  region: "Karnataka, India",
  email: "classycapturesofficial@gmail.com",
  phone: "+91 70224 44400",
  phoneHref: "+917022444400",
  address:
    "#730, Manju Mane, 30th Cross, Kengeri Main Road, Purnaprajna Nagar, Uttarahalli Hobli, Bengaluru, Karnataka 560061",
  coords: "12.91° N, 77.54° E",
  founded: 1995,
  director: "Pavan Sharma",
} as const;

export const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Weddings", href: "/weddings" },
  { label: "Pre-Wedding", href: "/pre-wedding" },
  { label: "Portraits", href: "/portraits" },
  { label: "Films", href: "/films" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

export const HOME = {
  hero: {
    /**
     * Each of the three slots has one job: the eyebrow says who and where,
     * the meta strip says what, and the lead is the only one carrying a
     * voice. They used to overlap — the eyebrow repeated the ticker, the
     * meta repeated the eyebrow.
     *
     * The lead was "Every glance, every emotion, every heartbeat — captured
     * as art." Three abstract nouns and a phrase the About page and the
     * footer were both already using, in the register the rest of the site
     * avoids. The writing that works here is concrete: "A mother's hands
     * fastening a garland. The last still minute before the house fills."
     * This line sits in that register and says something about how they
     * work rather than how they feel about it.
     */
    eyebrow: "A Bengaluru Wedding Studio",
    /**
     * Split from one `lead` sentence into a headline and a line under it,
     * because the hero is now a centred stack — label, headline, action —
     * rather than a paragraph pinned to the bottom-left corner. The whole
     * sentence set at headline size ran four lines and stopped being a
     * headline.
     */
    headline: "Thirty years of South Indian weddings.",
    lead: "We've learned when to step closer, and when to disappear.",
    cta: "See the work",
    meta: ["Est. 1995", "Weddings", "Films", "Portraits"],
    /**
     * The opening reel, full-bleed, one frame at a time.
     *
     * Only frames that can actually fill a viewport belong here. A full-bleed
     * crop of a standing photograph throws the subject away, and of the 40
     * curated stills just three are landscape above 800px — the other wide
     * ones are 1080px social exports that a 1440px screen turns to mush.
     * Two of those three are here; the rest of the reel is film, which is
     * 16:9 already and needs no crop at all.
     *
     * `umbrella-rain` and `meadow-hat` used to sit in this list. Both are
     * 1080px, and both were being stretched across the whole screen.
     */
    reel: [
      { kind: "image", slug: "couple-seated", caption: "The Garlands", place: "Bengaluru" },
      { kind: "video", slug: "film-teaser", caption: "The Teaser", place: "Karnataka" },
      // `focus` shifts the crop window on narrow screens, where a wide
      // photograph is reduced to a vertical slice of itself. Centred, this
      // one keeps the groom and his reaching arm and cuts the bride — and
      // the sindoor being applied, which is the whole moment — off the left
      // edge. It has no effect on desktop, where the frame is wide enough
      // that nothing is cropped horizontally at all.
      { kind: "image", slug: "sindoor-moment", caption: "Sindoor", place: "South India", focus: "30% 50%" },
    ],
  },
  ticker: ["Timeless Moments", "Beyond Moments", "Thirty Years Behind the Lens", "Bengaluru · South India"],
  legacy: {
    label: "[ Our Legacy ]",
    lines: [
      "Thirty years behind the lens,",
      "across Bengaluru and South India.",
    ],
    body: "Three decades of candid work, reshaped for a new generation.",
  },
  story: {
    label: "[ How We See It ]",
    beats: [
      {
        index: "01",
        title: "The quiet before",
        body: "A mother's hands fastening a garland. The last still minute before the house fills. We are already there, already looking.",
        media: "bride-jewels",
        detail: "sehra-tying",
      },
      {
        index: "02",
        title: "The vow itself",
        body: "Fire, rice, silk and the weight of two families. Rituals older than any of us, happening once, exactly this way.",
        media: "kalash-hands",
        detail: "garland-exchange",
      },
      {
        index: "03",
        title: "What stays after",
        body: "Your story outlives the day, in frames you'll hand to people not yet born.",
        media: "petals-seated",
        detail: "close-whisper",
      },
    ],
  },
  work: {
    label: "[ Selected Work ]",
    title: "Selected Work",
    note: "Drag or scroll",
  },
  philosophy: {
    label: "[ Our Philosophy ]",
    text: "Not perfection — presence. The glance, the quiet minute. We shoot the feeling, not the frame.",
  },
  stats: [
    { value: 30, suffix: "+", label: "Years behind the lens" },
    { value: 900, suffix: "+", label: "Weddings documented" },
    { value: 2, suffix: "", label: "Generations of storytellers" },
    { value: 45, suffix: "min", label: "Longest wedding film" },
  ],
  cta: {
    title: ["Let's", "Talk"],
    body: "We'd love to hear your story and help you capture it beautifully.",
  },
} as const;

export const SERVICES = [
  {
    slug: "weddings",
    href: "/weddings",
    index: "01",
    title: "Luxury Wedding Photography",
    subtitle: "Candid, emotional, artistic",
    // source: studio (subtitle + summary), written (detail/includes)
    summary:
      "Your story told with artistry, and without pretence.",
    detail:
      "Bengaluru weddings and destination weddings alike. The best moments cannot be staged, only felt, so we take them as they come.",
    includes: ["Candid coverage", "Traditional portraiture", "Two-photographer teams", "Hand-finished albums"],
    media: "mandap-garland",
  },
  {
    slug: "pre-wedding",
    href: "/pre-wedding",
    index: "02",
    title: "Creative Pre-Wedding",
    subtitle: "Your love story before “I do”",
    summary:
      "A shoot built around the two of you — your places, your weather, your way of standing next to each other.",
    detail:
      "Backwaters, temples, rain, long grass. We scout across Karnataka and Kerala and direct just enough to keep it yours.",
    includes: ["Location scouting", "Wardrobe guidance", "Half or full day", "Cinematic story reel"],
    // A standing frame, because every place this is shown is a standing box.
    // `rain-embrace` is a 1.60 landscape and the service thumbnails are 4/5,
    // so it was losing half of itself to the crop in both of them.
    media: "creek-embrace",
  },
  {
    slug: "portraits",
    href: "/portraits",
    index: "03",
    title: "Portrait Sessions",
    // Shortened from "Timeless imagery for individuals, couples and
    // families". These four subtitles sit in one row of cards, and at
    // fifty-three characters this was the only one that wrapped — which
    // pushed its card taller and broke the line the other three sat on.
    subtitle: "Individuals, couples, families",
    summary:
      "Bridal portraits, family sittings and personal work, made with the same patience we bring to a wedding day.",
    detail:
      "Studio or on location, daylight or lamp. One person, one look, held long enough to mean something.",
    includes: ["Bridal portraiture", "Family sittings", "Studio or location", "Retouched masters"],
    media: "petals-twirl",
  },
  {
    slug: "films",
    href: "/films",
    index: "04",
    title: "Wedding Cinematography",
    subtitle: "Stories that move hearts",
    summary:
      "Our wedding cinematography is designed to make you feel every moment, all over again.",
    detail:
      "Films built from movement, music and emotion. Our roots are in the Kannada film industry, so aerial work and large crews are familiar ground.",
    includes: ["Teasers · 2–3 min", "Highlights · 5–8 min", "Full films · 30–45 min", "Same-day edits"],
    media: "garland-exchange",
  },
] as const;

export const ABOUT = {
  hero: { eyebrow: "[ About ]", title: ["Thirty", "Years"] },
  story: {
    label: "[ Our Story ]",
    title: "Two generations behind one lens",
    lines: [
      "With a legacy spanning more than three decades,",
      "Classy Captures has been crafting timeless wedding",
      "stories filled with love, emotion and authenticity.",
    ],
    body: [
      "We are storytellers first. Emotion and craft, in service of a story that keeps.",
      `Under the leadership of ${STUDIO.director}, our second-generation Creative Director, we continue to push the boundaries of luxury wedding photography in Bengaluru. His eye for detail and love for storytelling have guided Classy Captures to become a name couples trust with their most precious memories.`,
    ],
  },
  beyond: {
    label: "[ Beyond Weddings ]",
    title: "Where the work goes next",
    body: [
      "Our work reaches past weddings into the Kannada film industry: cinematography and aerial filming.",
      "From intimate weddings to large-scale film productions, our visual storytelling has touched countless hearts and screens.",
    ],
  },
  promise: {
    label: "[ Our Promise ]",
    title: "Moments made everlasting",
    body: "We do not just document. Emotion, connection, story — every frame made to last.",
  },
} as const;

export const FILMS = {
  hero: { eyebrow: "[ Films ]", title: ["Stories", "That Move"] },
  lead: "Films that let you feel the day again, told through movement, music and emotion.",
  packages: [
    { name: "Teaser", length: "2–3 min", body: "A glimpse of your love story, cut to land in the first week." },
    { name: "Highlights", length: "5–8 min", body: "The essence of your wedding day, start to finish." },
    { name: "Full Film", length: "30–45 min", body: "Your story, complete and cinematic." },
    { name: "Same-Day Edit", length: "Screened that night", body: "Memories, shared before the night ends." },
  ],
  reels: [
    { slug: "film-teaser", title: "Pooja & Sourab", kind: "Teaser" },
    { slug: "film-ceremony", title: "The Ceremony", kind: "Highlights" },
    { slug: "film-celebration", title: "The Celebration", kind: "Full Film" },
    { slug: "film-portrait", title: "Quiet Hours", kind: "Same-Day Edit" },
  ],
  closing:
    "With a legacy rooted in the art of filmmaking, our work represents the pinnacle of wedding cinematography in South India.",
} as const;

export const COLLECTIONS = {
  weddings: {
    eyebrow: "[ Weddings ]",
    title: ["Every Love", "Story"],
    note: "[ The Day ]",
    noteTitle: "What a wedding looks like with us in it",
    lead: "Every love story deserves telling well. Yours, with artistry and without pretence.",
    body: [
      "Bengaluru weddings and destination weddings alike: emotional, elegant, everlasting.",
      "We believe the best moments can't be staged — they can only be felt. And we capture them exactly as they unfold.",
      "Because long after the lights fade and the guests leave, your story will still live here.",
    ],
  },
  "pre-wedding": {
    eyebrow: "[ Pre-Wedding ]",
    title: ["Before", "I Do"],
    note: "[ The Shoot ]",
    noteTitle: "Where we go, and how we work",
    lead: "Your love story before the vows — scouted, lit and directed just enough to still feel like the two of you.",
    body: [
      "Karnataka and Kerala: backwaters, banyan trees, temple steps, monsoon rain.",
      "A shoot beforehand means that on the day we are not strangers with lenses.",
    ],
  },
  portraits: {
    eyebrow: "[ Portraits ]",
    title: ["Held", "Still"],
    note: "[ The Sitting ]",
    noteTitle: "One person, one look, held long enough",
    lead: "Timeless imagery for individuals, couples and families, made with the same patience we bring to a wedding day.",
    body: [
      "Bridal portraiture is where our oldest instincts live — one person, one look, held still long enough to mean something.",
      "Studio or on location, in daylight or by lamp, finished by hand and delivered as masters you can print at any size.",
    ],
  },
} as const;

export const FOOTER = {
  cta: ["Let's work", "together"],
  /** Wordmark set edge-to-edge across the foot of every page. */
  wordmark: ["Classy", "Captures"],
  links: [
    { label: "Work", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Films", href: "/films" },
    { label: "Contact", href: "/contact" },
  ],
  /** Ticker blurbs, drawn from the studio's own copy. */
  blurbs: [
    "Classy Captures turns weddings into timeless works of art, holding the feeling and not just the frame.",
    "Every production starts with a point of view. We carry it through to the final frame.",
  ],
  pill: "Timeless Moments",
  years: `${STUDIO.founded} — Forever`,
  discipline: "Wedding Studio",
} as const;

export const CONTACT = {
  eyebrow: "[ Contact ]",
  title: ["Let's", "Talk"],
  lead: "We'd love to hear your story and help you capture it beautifully.",
  fields: {
    name: "Your name",
    email: "Email address",
    date: "Wedding date",
    place: "Venue or city",
    message: "Tell us about your day",
  },
} as const;
