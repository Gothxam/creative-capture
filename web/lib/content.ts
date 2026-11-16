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
    eyebrow: "Beyond Moments",
    title: ["Classy", "Captures"],
    lead: "The art of timeless wedding photography in Bengaluru. Every glance, every emotion, every heartbeat captured as art.",
    meta: ["Est. 1995", "Bengaluru, India", "Weddings · Films · Portraits"],
  },
  ticker: ["Timeless Moments", "Beyond Moments", "Thirty Years Behind the Lens", "Bengaluru · South India"],
  legacy: {
    label: "[ Our Legacy ]",
    lines: [
      "With over thirty years behind the lens,",
      "Classy Captures stands among the finest",
      "wedding photographers in Bengaluru",
      "and South India.",
    ],
    body: "Over the years we've shaped and mastered the art of candid wedding photography, redefining it for a new generation of love stories.",
  },
  story: {
    label: "[ How We See It ]",
    beats: [
      {
        index: "01",
        title: "The quiet before",
        body: "A mother's hands fastening a garland. The last still minute before the house fills. We are already there, already looking.",
        media: "bride-jewels",
      },
      {
        index: "02",
        title: "The vow itself",
        body: "Fire, rice, silk and the weight of two families. Rituals older than any of us, happening once, exactly this way.",
        media: "kalash-hands",
      },
      {
        index: "03",
        title: "What stays after",
        body: "Long after the lights fade and the guests leave, your story still lives here, in frames you'll hand to people not yet born.",
        media: "petals-seated",
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
    text: "Photography isn't about perfection, it's about presence. The best stories are the ones that happen naturally, in fleeting glances and quiet moments. That's what we capture — the feeling, not just the frame.",
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
      "As one of the top wedding photographers in Bengaluru, we bring your story to life through a perfect blend of artistry and authenticity.",
    detail:
      "From South Indian wedding photography in Bengaluru to modern destination weddings, we create imagery that feels emotional, elegant and everlasting. We believe the best moments can't be staged — they can only be felt, and we capture them exactly as they unfold.",
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
      "Backwaters, temples, rain, rooftops and long grass. We scout locations across Karnataka and Kerala, shoot through golden hour into blue, and direct just enough to keep it feeling like you.",
    includes: ["Location scouting", "Wardrobe guidance", "Half or full day", "Cinematic story reel"],
    media: "rain-embrace",
  },
  {
    slug: "portraits",
    href: "/portraits",
    index: "03",
    title: "Portrait Sessions",
    subtitle: "Timeless imagery for individuals, couples and families",
    summary:
      "Bridal portraits, family sittings and personal work, made with the same patience we bring to a wedding day.",
    detail:
      "Studio or on location, in daylight or by lamp. Portraiture is where our oldest instincts live — one person, one look, held still long enough to mean something.",
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
      "We create heartfelt films that tell your story through movement, music and emotion — celebrated as some of the best cinematic wedding films in Bengaluru. With a legacy rooted in the Kannada film industry, our work extends to aerial filming and large-scale production.",
    includes: ["Teasers · 2–3 min", "Highlights · 5–8 min", "Full films · 30–45 min", "Same-day edits"],
    media: "garland-exchange",
  },
] as const;

export const ABOUT = {
  hero: { eyebrow: "[ About ]", title: ["Thirty", "Years"] },
  story: {
    label: "[ Our Story ]",
    lines: [
      "With a legacy spanning more than three decades,",
      "Classy Captures has been crafting timeless wedding",
      "stories filled with love, emotion and authenticity.",
    ],
    body: [
      "We're more than photographers — we're storytellers who turn weddings into timeless works of art. As one of the top wedding photographers in South India, we blend emotion and innovation to tell love stories that stand the test of time.",
      `Under the leadership of ${STUDIO.director}, our second-generation Creative Director, we continue to push the boundaries of luxury wedding photography in Bengaluru. His eye for detail and love for storytelling have guided Classy Captures to become a name couples trust with their most precious memories.`,
    ],
  },
  beyond: {
    label: "[ Beyond Weddings ]",
    title: "Beyond Weddings",
    body: [
      "Our craft extends beyond weddings into the Kannada film industry, where our expertise in cinematography and aerial filming has earned recognition and respect.",
      "From intimate weddings to large-scale film productions, our visual storytelling has touched countless hearts and screens.",
    ],
  },
  promise: {
    label: "[ Our Promise ]",
    title: "Moments made everlasting",
    body: "At Classy Captures, we don't just document — we create memories that feel alive. Our focus is on emotion, connection and storytelling. Every photo, every frame, every second is made everlasting.",
  },
} as const;

export const FILMS = {
  hero: { eyebrow: "[ Films ]", title: ["Stories", "That Move"] },
  lead: "Our wedding cinematography in Bengaluru is designed to make you feel every moment, all over again. We create heartfelt films that tell your story through movement, music and emotion.",
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
    lead: "Every love story deserves to be told beautifully. As one of the top wedding photographers in Bengaluru, we bring your story to life through a perfect blend of artistry and authenticity.",
    body: [
      "From South Indian wedding photography in Bengaluru to modern destination weddings, we create imagery that feels emotional, elegant and everlasting.",
      "We believe the best moments can't be staged — they can only be felt. And we capture them exactly as they unfold.",
      "Because long after the lights fade and the guests leave, your story will still live here.",
    ],
  },
  "pre-wedding": {
    eyebrow: "[ Pre-Wedding ]",
    title: ["Before", "I Do"],
    lead: "Your love story before the vows — scouted, lit and directed just enough to still feel like the two of you.",
    body: [
      "We shoot across Karnataka and Kerala: backwaters and banyan trees, temple steps, monsoon rain, long grass at the end of the day.",
      "A pre-wedding shoot is where couples get comfortable in front of our cameras, so that on the wedding day we're no longer strangers holding lenses.",
    ],
  },
  portraits: {
    eyebrow: "[ Portraits ]",
    title: ["Held", "Still"],
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
