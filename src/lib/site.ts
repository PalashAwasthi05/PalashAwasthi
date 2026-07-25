// ─────────────────────────────────────────────────────────────────────────
// Site config — edit this one file to make the site yours.
// ─────────────────────────────────────────────────────────────────────────

export const site = {
  /** Author / site name, shown in the hero and footer. */
  name: 'Palash Awasthi',

  /** Opening line of the bio — also the meta description and OG subtitle. */
  tagline:
    "Hi, I'm Palash! I love questioning how humans will exist in the future.",

  /** Current primary role — the small mono eyebrow on share images. */
  role: 'Head of Growth · Reflex',

  /** Used as the default <meta name="description">. */
  description:
    "Palash Awasthi — Head of Growth at Reflex. I love questioning how humans will exist in the future.",

  links: {
    email: 'palash@reflex.dev',
    x: 'https://x.com/palashaw_',
    linkedin: 'https://www.linkedin.com/in/palash-awasthi/',
    spotify:
      'https://open.spotify.com/user/qt1a53s7mpw1pyudrdm4uth48?si=a8aec30b2d894030',
  },
} as const;

// Primary nav. Empty for now — the site is a single landing page. Re-add
// { href: '/writing', label: 'Writing' } when the writing section returns.
export const nav: readonly { href: string; label: string }[] = [];
