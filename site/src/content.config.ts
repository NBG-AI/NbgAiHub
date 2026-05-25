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

// Astro's YAML parser (js-yaml) auto-converts unquoted YAML 1.1 date strings
// (`2026-05-18`) into JS Date objects before Zod sees them, even though the
// pipeline emits these as strings. Accept either shape and normalize to a
// "YYYY-MM-DD" string. Same root cause as the pipeline's gray-matter bug
// resolved during the vitest 2→4 upgrade.
const isoDateString = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD'),
  z.date().transform((d) => d.toISOString().slice(0, 10)),
]);

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
// Extends `baseShape('skill')` (10 canonical keys) with 7 new fields per
// project-design.md §P.5.6. The site validator does *shape only* — the CI
// validator at `pipeline/src/validators/skill.ts` enforces semantic rules
// (handle/allowlist for `maintainer`, prefix/regex for `install_command`,
// etc.) using the same enum sets.
const skills = defineCollection({
  loader: glob({ pattern: '*.md', base: '../skills' }),
  schema: z.object({
    ...baseShape('skill'),
    install_command: z
      .string()
      .refine(
        (cmd) =>
          cmd.startsWith('/plugin marketplace add ') ||
          cmd.startsWith('/plugin install '),
        {
          message:
            'install_command must start with `/plugin marketplace add ` or `/plugin install `',
        },
      ),
    skill_id: z
      .string()
      .regex(/^[a-z0-9-]+$/, { message: 'skill_id must match /^[a-z0-9-]+$/' }),
    origin: z.enum(['internal', 'community', 'external']),
    category: z.enum([
      'workflow',
      'code',
      'docs',
      'integration',
      'productivity',
      'testing',
      'other',
    ]),
    status: z.enum(['active', 'experimental', 'deprecated']),
    // CI validator enforces handle-or-allowlist; site does shape-only.
    maintainer: z.string().min(1),
    // Free-text per A11; `undefined` when absent (NOT `[]`) to keep diffs minimal.
    requires: z.array(z.string()).optional(),
  }),
});

// ─── tips ──────────────────────────────────────────────────────────────
const tips = defineCollection({
  loader: glob({ pattern: '*.md', base: '../tips' }),
  schema: z.object(baseShape('tip')),
});

// ─── glossary ──────────────────────────────────────────────────────────
// Extends `baseShape('glossary')` with two fields driving the build-time
// auto-link + hover tooltip feature (project-design.md §S.14):
//   - `tldr`: required ≤160-char plain-text summary rendered inside the
//     popover. No silent fallback if missing — Zod fails the build.
//   - `aliases`: optional list of alternative spellings the remark plugin
//     also matches (e.g. plurals, abbreviations). Empty by default.
const glossary = defineCollection({
  loader: glob({ pattern: '*.md', base: '../glossary' }),
  schema: z.object({
    ...baseShape('glossary'),
    tldr: z
      .string()
      .min(1, { message: 'tldr is required (≤160 chars, plain text)' })
      .max(160, { message: 'tldr must be ≤160 characters' }),
    aliases: z.array(z.string().min(1, { message: 'alias must be a non-empty string' })).default([]),
  }),
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
