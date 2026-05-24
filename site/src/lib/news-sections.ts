/**
 * news-sections.ts — render-time discriminator for AgentNews-style sections.
 *
 * Maps a news collection entry to one of the three AgentNews section labels
 * (AI-News, Deep Dives, Articles) without changing the content schema.
 *
 * Heuristic (investigation §9):
 *  - source startsWith "r/"             → ai-news
 *  - source matches youtube.com|youtu.be → deep-dives
 *  - otherwise                           → articles
 *
 * Pure functions; no I/O; safe to import from any layer.
 *
 * Related: project-design.md §S.13.16.8 (News three-section pattern).
 * Backs AC10–AC11 of the AgentNews refined spec.
 */

import type { CollectionEntry } from 'astro:content';

export type NewsSection = 'ai-news' | 'deep-dives' | 'articles';

export const NEWS_SECTIONS: ReadonlyArray<NewsSection> = [
  'ai-news',
  'deep-dives',
  'articles',
] as const;

export const NEWS_SECTION_LABELS: Record<NewsSection, string> = {
  'ai-news':    'AI-News',
  'deep-dives': 'Deep Dives',
  'articles':   'Articles',
};

export const NEWS_SECTION_TAGS: Record<NewsSection, string> = {
  'ai-news':    'AI-News · Reddit',
  'deep-dives': 'Deep dive',
  'articles':   'Article',
};

/**
 * Derive a section label from a news entry without consulting a separate
 * frontmatter field. Used at render time only.
 *
 * Accepts a partial shape so tests can exercise it without a full collection
 * entry. The actual collection entry must satisfy `{ data: { source?: string; external_link?: string | null } }`.
 */
export function getNewsSection(entry: {
  data: { source?: string; external_link?: string | null };
}): NewsSection {
  const source = (entry.data.source ?? '').trim();
  const url = (entry.data.external_link ?? '').trim();

  // Reddit subreddit-style source labels: "r/ClaudeAI", "r/ClaudeCode", etc.
  if (/^r\//i.test(source)) {
    return 'ai-news';
  }

  // YouTube video — match either the source label OR the URL.
  if (
    /youtube\.com|youtu\.be/i.test(source) ||
    /youtube\.com|youtu\.be/i.test(url)
  ) {
    return 'deep-dives';
  }

  return 'articles';
}

/**
 * Bucket an array of news entries into the three sections, preserving order
 * inside each bucket.
 */
export function groupNewsBySection<E extends { data: { source?: string; external_link?: string | null } }>(
  entries: ReadonlyArray<E>,
): Record<NewsSection, E[]> {
  const grouped: Record<NewsSection, E[]> = {
    'ai-news':    [],
    'deep-dives': [],
    'articles':   [],
  };
  for (const entry of entries) {
    grouped[getNewsSection(entry)].push(entry);
  }
  return grouped;
}

/**
 * Pick the lead/feature story for the home/news hero — most-recent entry from
 * the most-editorial bucket (articles first, then deep-dives, then ai-news).
 *
 * Returns `null` only when ALL three buckets are empty.
 */
export function pickFeatureEntry<
  E extends { data: { source?: string; external_link?: string | null; authored?: string } },
>(entries: ReadonlyArray<E>): E | null {
  const grouped = groupNewsBySection(entries);
  const order: NewsSection[] = ['articles', 'deep-dives', 'ai-news'];
  for (const section of order) {
    if (grouped[section].length > 0) {
      // Caller already sorted; just return the first.
      return grouped[section][0]!;
    }
  }
  return null;
}
