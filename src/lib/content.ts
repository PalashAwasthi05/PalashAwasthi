import { getCollection, type CollectionEntry } from 'astro:content';

export type Writing = CollectionEntry<'writing'>;

const byDateDesc = (a: Writing, b: Writing) =>
  b.data.date.valueOf() - a.data.date.valueOf();

// Drafts are visible while developing but never in a production build.
const isVisible = ({ data }: Writing) =>
  import.meta.env.PROD ? data.draft !== true : true;

/** Published essays, newest first. */
export async function getWriting(): Promise<Writing[]> {
  const entries = await getCollection('writing', isVisible);
  return entries.sort(byDateDesc);
}

/** Slug used for routing — explicit override wins, else the file id. */
export function slugOf(entry: Writing): string {
  return entry.data.slug ?? entry.id;
}

/** Canonical path for an essay. */
export function hrefOf(entry: Writing): string {
  return `/writing/${slugOf(entry)}`;
}

// Rough reading time from the raw markdown body (~200 wpm). No remark plugin
// needed — keeps the fast default markdown engine.
export function readingTime(body: string | undefined): string {
  if (!body) return '1 min read';
  const text = body
    .replace(/```[\s\S]*?```/g, ' ') // drop fenced code
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/[#>*_~\-\[\]()!]/g, ' '); // markdown punctuation
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  // Frontmatter dates are parsed as UTC midnight; format in UTC so the day
  // never drifts by one in a westward timezone.
  timeZone: 'UTC',
});

/** Human date, e.g. "May 12, 2026". */
export function formatDate(date: Date): string {
  return DATE_FMT.format(date);
}

/** ISO date for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
