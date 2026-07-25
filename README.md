# Personal site

A small, fast personal site — currently a single landing page (`/`): a photo on
the left, and on the right a short bio, affiliations, and contact links. No top
bar, no footer. Astro 7, static output, near-zero JS, light mode only. Built to the design brief in the handoff: brutalist structure,
neomorphic accents, a clean sans voice (Akatab), slate accent, pure white.

## Running it

There is **no Node** on this machine — everything runs through **bun**, and the
Astro CLI needs the bun runtime forced with `--bun`:

```sh
bun install
bun --bun run dev      # dev server at http://localhost:4321
bun --bun run build    # static build to ./dist
bun --bun run preview  # preview the build
bun --bun run check     # astro check (types)
```

(If you install Node 22.12+ later, the plain `bun run dev` / `npm run dev` work too.)

## Editing the page

All the landing-page copy is in two places:

- **`src/lib/site.ts`** — name, opening line (`tagline`), current `role`, meta
  `description`, and the contact links.
- **`src/pages/index.astro`** — the remaining bio paragraphs, the `affiliations`
  array, and the `education` line.

## The writing section (currently off)

The essay stream is **paused, not deleted**. Still on disk: the markdown in
`src/content/writing/`, the collection in `src/content.config.ts`, the query
helpers in `src/lib/content.ts`, and the `WritingRow` / `PostMeta` /
`FormattedDate` components.

To bring it back, restore the routes (`src/pages/writing/index.astro` +
`[...slug].astro`), the OG endpoint (`src/pages/og/writing/[...slug].png.ts`),
and `src/pages/rss.xml.ts` plus its `<link rel="alternate">` in `BaseHead.astro`.
For navigation, re-add `<Header />` to `BaseLayout.astro` (the top bar is
currently removed) and populate the nav in `src/lib/site.ts`:

```ts
export const nav = [{ href: '/writing', label: 'Writing' }];
```

Essay frontmatter, for reference:

```yaml
---
title: On Writing in Public      # required
date: 2026-05-12                 # required
description: One line.           # required — shown in the list, meta, OG
tags: [writing, web]             # optional
draft: false                     # optional, default false
slug: custom-slug                # optional, overrides the filename
---
```

Drafts (`draft: true`) show in `dev` but are excluded from the production build,
lists, feeds, and the sitemap.

## Before deploying

- **`astro.config.mjs`** — set `site` to your real origin. Required for the
  sitemap, canonical URLs, and absolute `og:image` URLs. Search for `CHANGE ME`.
- **`src/lib/site.ts`** — name, opening line, role, and the real X / LinkedIn /
  Spotify / email links.
- **`src/styles/global.css`** — all design tokens (colors, shadows, type) live at
  the top.

## Open Graph images

Share images are generated **at build time** with `satori` + `@resvg/resvg-wasm`
(both pure WASM — no native modules, works under bun):

- Endpoint: `src/pages/og/default.png.ts`
- Layout/colors: `src/og/render.ts`

satori reads **TTF/OTF/WOFF but never `woff2`**, and never variable fonts.
Akatab ships a `.woff` per weight, so `render.ts` reads those straight out of
`node_modules` — nothing to generate. Geist Mono is variable-woff2 only, so its
metadata face stays a committed static TTF in `src/og/fonts/`. To regenerate it
(needs `fonttools`):

```sh
fonttools ttLib.woff2 decompress \
  node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2 -o /tmp/gm.ttf
fonttools varLib.instancer /tmp/gm.ttf wght=500 -o src/og/fonts/GeistMono-Meta.ttf
```

## The photo

`src/assets/coast-drive.jpg` (1200×1350), rendered with Astro's `<Image />` from
`astro:assets`. At build time Astro emits responsive **WebP** variants at 480 /
800 / 1200px and sets `width`/`height` on the tag, so there's no layout shift.
This path uses `sharp`, which does work under bun here.

To swap the photo, drop a new file in `src/assets/`, update the `import` and the
`alt` text in `src/pages/index.astro`, and let the build do the rest. The current
image was downscaled from a 2160×2880 original with 450px trimmed off the top
(less sky). To redo that kind of crop:

```sh
bun -e '
import sharp from "sharp";
const m = await sharp("ORIGINAL.jpg").metadata();
await sharp("ORIGINAL.jpg")
  .extract({ left: 0, top: 450, width: m.width, height: m.height - 450 })
  .resize({ width: 1200 })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("src/assets/coast-drive.jpg");
'
```

## Fonts

Self-hosted via Fontsource — no Google Fonts CDN, so the site makes zero
third-party requests:

- **`@fontsource/akatab`** — display, headings, body. Static (non-variable), so
  only the three weights the design actually uses are imported in
  `BaseLayout.astro`: **400** body, **500** row titles/h2, **600** display/h1/h3.
  Latin subset only (~10KB each). Add another weight by importing its
  `latin-<wght>.css`.
- **`@fontsource-variable/geist-mono`** — metadata, dates, section numbers, code.

Akatab has **no italic face**, so `global.css` sets `font-synthesis: style` —
the browser slants an oblique for `<em>` and blockquotes, while real weight
files mean bold is never synthesized.

The two above-the-fold faces (400 + 600) are copied to `public/fonts/` by
`scripts/copy-fonts.mjs` (runs on `predev`/`prebuild`) and preloaded in
`BaseHead.astro`.

## Deploying

Live at **https://www.palashawasthi.com** via GitHub Pages on
`PalashAwasthi05/PalashAwasthi`:

- **`main`** holds the source (this project).
- **`gh-pages`** holds the built `dist/`, and is what Pages serves (branch `/`,
  custom domain from `CNAME`). Pages rebuilds automatically on push to it.

To ship a change:

```sh
bun run deploy      # builds, then force-pushes dist/ to gh-pages
```

Two files must survive into `dist/` or the site breaks — `scripts/deploy.sh`
aborts if either is missing:

- **`.nojekyll`** — without it Pages runs Jekyll, which silently drops
  `_astro/` (underscore-prefixed), killing all CSS, JS, fonts, and images.
- **`CNAME`** — without it the custom domain reverts to `github.io`.

Both live in `public/`, so the build copies them automatically.

### Optional: automate with GitHub Actions

`.github/workflows/deploy.yml` exists locally but is **not committed** — the
`gh` token here lacked the `workflow` scope, so pushing it was rejected. To
switch to CI deploys, grant the scope from an interactive terminal:

```sh
gh auth refresh -h github.com -s workflow
git add .github && git commit -m "Add Pages deploy workflow" && git push
```

Then set Pages source to "GitHub Actions" (repo Settings → Pages), and every
push to `main` builds and deploys on its own — no more `bun run deploy`.

## Layout

```
src/
  assets/        coast-drive.jpg (optimized by astro:assets at build)
  components/    BaseHead, RevealScript
                 (dormant: Header, WritingRow, PostMeta, FormattedDate)
  content/       writing/ markdown — dormant, see "The writing section"
  layouts/       BaseLayout.astro
  lib/           site.ts (config), content.ts (queries, dates, reading time)
  og/            render.ts + GeistMono-Meta.ttf
  pages/         index (bio), 404, robots.txt, og/default.png
  styles/        global.css (design tokens + system)
```
