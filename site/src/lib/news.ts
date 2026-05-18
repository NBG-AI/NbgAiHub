// site/src/lib/news.ts
//
// Shared helper for News rendering. See project-design.md §S.3.7.

import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

/**
 * Returns published news entries sorted by `authored` descending,
 * optionally sliced to the first `limit` items.
 *
 * Used by NewsPanel (limit=5) and NewsList (no limit).
 * Pure (no side effects). Astro caches `getCollection()` per build.
 */
export async function getRecentNews(
  limit?: number,
): Promise<CollectionEntry<'news'>[]> {
  const items = await getCollection('news');
  const sorted = items.sort((a, b) =>
    b.data.authored.localeCompare(a.data.authored),
  );
  return limit === undefined ? sorted : sorted.slice(0, limit);
}
