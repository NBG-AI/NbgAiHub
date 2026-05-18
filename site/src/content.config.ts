// site/src/content.config.ts
//
// Zod schemas for the 5 content collections.
//
// IMPORTANT — schema coupling:
//   The `news` schema below is a 1:1 mirror of the pipeline's NewsFrontmatter type.
//   The pipeline owns the canonical shape. Sources to keep in sync:
//     - pipeline/src/types.ts:54-74   (NewsFrontmatter type alias — 13 keys
//                                      including editor_confidence)
//     - pipeline/src/frontmatter.ts:14-30  (buildFrontmatter() emitter)
//     - DECISIONS.md "Shared content shape" and
//       "RSS triage: source-aware prompt + editor_confidence field"
//   If either side changes, update the other in the same PR.
//
// Other collections (skills, tips, glossary, journeys) share a 10-key base
// shape. Only `news` carries `editor_confidence`, `source`, `fingerprint`,
// and the optional `hero_image` — those come from AI triage, not hand-authoring.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// ─── Shared field shapes (DRY) ─────────────────────────────────────────

const audienceEnum = z.enum(['beginner', 'advanced', 'both']);
const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

/**
 * The 10 canonical keys shared by every content type per DECISIONS.md
 * "Shared content shape". News layers `editor_confidence`, `source`,
 * `fingerprint`, and optional `hero_image` on top.
 */
function baseShape(typeLiteral: string) {
  return {
    type: z.literal(typeLiteral),
    title: z.string().min(1),
    audience: audienceEnum,
    topics: z.array(z.string()),
    internal: z.boolean(),
    authored: isoDateString,
    last_reviewed: isoDateString,
    external_link: z.string().url().nullable(),
    deeper_link: z.string().url().nullable(),
    ai_summary: z.string(),
  } as const;
}

// ─── news ──────────────────────────────────────────────────────────────
// Mirrors pipeline/src/types.ts → NewsFrontmatter (13 keys).
const news = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: '../news/published',
    // Plan R-2: strip date prefix so /news/<slug> drops the date.
    // 2026-05-18-foo-bar.md → entry.id === 'foo-bar' → /news/foo-bar/.
    generateId: ({ entry }) => {
      const withoutExt = entry.replace(/\.[^.]+$/, '');
      return withoutExt.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    },
  }),
  schema: z.object({
    ...baseShape('news'),
    // External link is `string | null` for news (pipeline emits null when
    // RSS feeds omit the link).
    external_link: z.string().url().nullable(),
    // Editor triage confidence — the value-add of source-aware triage.
    editor_confidence: z.enum(['high', 'medium', 'low']),
    // News-specific provenance:
    source: z.string().min(1),
    fingerprint: z.string().min(1),
    // Forward-compat: pipeline may extract hero images in a future phase.
    hero_image: z.string().url().optional(),
  }),
});

// ─── skills ────────────────────────────────────────────────────────────
const skills = defineCollection({
  loader: glob({ pattern: '*.md', base: '../skills' }),
  schema: z.object(baseShape('skill')),
});

// ─── tips ──────────────────────────────────────────────────────────────
const tips = defineCollection({
  loader: glob({ pattern: '*.md', base: '../tips' }),
  schema: z.object(baseShape('tip')),
});

// ─── glossary ──────────────────────────────────────────────────────────
const glossary = defineCollection({
  loader: glob({ pattern: '*.md', base: '../glossary' }),
  schema: z.object(baseShape('glossary')),
});

// ─── journeys ──────────────────────────────────────────────────────────
const journeys = defineCollection({
  loader: glob({ pattern: '*.md', base: '../journeys' }),
  schema: z.object(baseShape('journey-step')),
});

// ─── docs ──────────────────────────────────────────────────────────────
// Starlight's built-in `docs` collection — backs `src/content/docs/` and
// powers the splash homepage (`index.mdx`). Required by Starlight 0.39.
const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema(),
});

export const collections = { docs, news, skills, tips, glossary, journeys };
