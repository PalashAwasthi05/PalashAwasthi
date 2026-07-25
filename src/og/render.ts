// Build-time OG image rendering: satori (SVG) + resvg-wasm (PNG). Both are
// pure WASM — no native bindings — so this runs under bun without Node.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { site } from '../lib/site';

const root = process.cwd();
const fontDir = join(root, 'src', 'og', 'fonts');
const akatabDir = join(root, 'node_modules', '@fontsource', 'akatab', 'files');

// satori reads static TTF/OTF/WOFF (NOT woff2, NOT variable). Akatab ships .woff
// per weight, so we use those straight from the package. Geist Mono is variable
// woff2 only, so its metadata face stays a committed instanced TTF.
const fonts = [
  { name: 'Akatab', weight: 600 as const, style: 'normal' as const, data: readFileSync(join(akatabDir, 'akatab-latin-600-normal.woff')) },
  { name: 'Akatab', weight: 400 as const, style: 'normal' as const, data: readFileSync(join(akatabDir, 'akatab-latin-400-normal.woff')) },
  { name: 'GeistMono', weight: 500 as const, style: 'normal' as const, data: readFileSync(join(fontDir, 'GeistMono-Meta.ttf')) },
];

// Initialize the resvg WASM exactly once for the whole build.
let wasmReady: Promise<unknown> | null = null;
function ensureWasm() {
  if (!wasmReady) {
    const wasm = readFileSync(join(root, 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm'));
    wasmReady = initWasm(wasm).catch((err) => {
      // initWasm throws if called twice; tolerate that across module reloads.
      if (!String(err).includes('Already initialized')) throw err;
    });
  }
  return wasmReady;
}

// Brand palette (light, warm — the signature look).
const C = {
  bg: '#FFFFFF',
  ink: '#18181B',
  muted: '#5A5A62',
  faint: '#8A8A93',
  accent: '#4A5A6A',
  hairline: '#E5E5E8',
};

function clamp(s: string, n: number): string {
  const t = s.trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
}

export interface OgInput {
  eyebrow: string; // small mono label, e.g. "WRITING"
  title: string;
  description?: string;
}

// satori takes a React-like tree; plain objects work at runtime (cast to any).
const el = (type: string, style: Record<string, unknown>, children?: unknown) =>
  ({ type, props: { style, children } }) as unknown;

export async function renderOg({ eyebrow, title, description }: OgInput): Promise<Uint8Array> {
  await ensureWasm();

  const tree = el(
    'div',
    {
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: C.bg,
      fontFamily: 'Akatab',
    },
    [
      // Eyebrow row: slate mark + mono label.
      el('div', { display: 'flex', alignItems: 'center', gap: '16px' }, [
        el('div', { width: '14px', height: '14px', backgroundColor: C.accent }),
        el(
          'div',
          {
            fontFamily: 'GeistMono',
            fontSize: '24px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: C.accent,
          },
          eyebrow.toUpperCase(),
        ),
      ]),

      // Title + description.
      el('div', { display: 'flex', flexDirection: 'column', gap: '26px', maxWidth: '1000px' }, [
        el(
          'div',
          { fontSize: '70px', fontWeight: 600, lineHeight: 1.08, color: C.ink, letterSpacing: '-1px' },
          clamp(title, 110),
        ),
        description
          ? el('div', { fontSize: '32px', fontWeight: 400, lineHeight: 1.4, color: C.muted }, clamp(description, 150))
          : el('div', {}, ''),
      ]),

      // Footer: hairline + name.
      el(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${C.hairline}`,
          paddingTop: '28px',
          fontFamily: 'GeistMono',
          fontSize: '22px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: C.faint,
        },
        [el('div', {}, site.name)],
      ),
    ],
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return png;
}
