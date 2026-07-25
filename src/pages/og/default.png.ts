import type { APIRoute } from 'astro';
import { site } from '../../lib/site';
import { renderOg } from '../../og/render';

export const prerender = true;

export const GET: APIRoute = async () => {
  const png = await renderOg({
    eyebrow: site.role,
    title: site.name,
    description: site.tagline,
  });
  return new Response(png as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
