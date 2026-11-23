// Build-time OG image rendering: satori (SVG) + resvg-wasm (PNG). Both are
// pure WASM — no native bindings — so this runs under bun without Node.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

const root = process.cwd();
// Satori needs a static WOFF or TTF. Use the same Akatab weight as the homepage heading.
const font = {
  name: 'Akatab',
  weight: 600 as const,
  style: 'normal' as const,
  data: readFileSync(join(root, 'node_modules', '@fontsource', 'akatab', 'files', 'akatab-latin-600-normal.woff')),
};

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

export async function renderOg(name: string): Promise<Uint8Array> {
  await ensureWasm();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#FFFFFF',
          color: '#18181B',
          fontFamily: 'Akatab',
          fontSize: '112px',
          fontWeight: 600,
          letterSpacing: '-0.025em',
          lineHeight: 1.05,
        },
        children: name,
      },
    },
    { width: 1200, height: 630, fonts: [font] },
  );
  return new Resvg(svg).render().asPng();
}
