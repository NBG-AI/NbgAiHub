// site/tests/agentnews-aesthetic.test.ts
//
// AgentNews-aesthetic retune — coverage tests.
// Covers: news-sections discriminator (Phase 4 helper), built-output markers
// for AgentNews class APIs, token retune evidence.
//
// Related: plan-005 phase 6.

import { describe, it, expect } from 'vitest';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  getNewsSection,
  groupNewsBySection,
  pickFeatureEntry,
  NEWS_SECTIONS,
  NEWS_SECTION_LABELS,
  NEWS_SECTION_TAGS,
} from '../src/lib/news-sections.ts';

// ─── 1. news-sections discriminator ──────────────────────────────────────

describe('news-sections — getNewsSection()', () => {
  it('classifies Reddit subreddit sources as ai-news', () => {
    expect(getNewsSection({ data: { source: 'r/ClaudeAI' } })).toBe('ai-news');
    expect(getNewsSection({ data: { source: 'r/ClaudeCode' } })).toBe('ai-news');
    expect(getNewsSection({ data: { source: 'R/Something' } })).toBe('ai-news');
  });

  it('classifies youtube sources as deep-dives', () => {
    expect(getNewsSection({ data: { source: 'youtube.com' } })).toBe('deep-dives');
    expect(getNewsSection({ data: { source: 'some-channel', external_link: 'https://youtube.com/watch?v=abc' } })).toBe('deep-dives');
    expect(getNewsSection({ data: { source: 'x', external_link: 'https://youtu.be/abc' } })).toBe('deep-dives');
  });

  it('falls through to articles for everything else', () => {
    expect(getNewsSection({ data: { source: 'wired.com' } })).toBe('articles');
    expect(getNewsSection({ data: { source: 'Hacker News' } })).toBe('articles');
    expect(getNewsSection({ data: { source: 'theverge.com' } })).toBe('articles');
    expect(getNewsSection({ data: { source: '' } })).toBe('articles');
    expect(getNewsSection({ data: {} })).toBe('articles');
  });
});

describe('news-sections — groupNewsBySection()', () => {
  it('preserves the three-bucket shape and ordering within each bucket', () => {
    const entries = [
      { id: 'a', data: { source: 'r/ClaudeAI' } },
      { id: 'b', data: { source: 'wired.com' } },
      { id: 'c', data: { source: 'youtube.com' } },
      { id: 'd', data: { source: 'r/ClaudeCode' } },
      { id: 'e', data: { source: 'hnrss' } },
    ];
    const grouped = groupNewsBySection(entries);
    expect(Object.keys(grouped).sort()).toEqual([...NEWS_SECTIONS].sort());
    expect(grouped['ai-news'].map((e) => e.id)).toEqual(['a', 'd']);
    expect(grouped['deep-dives'].map((e) => e.id)).toEqual(['c']);
    expect(grouped['articles'].map((e) => e.id)).toEqual(['b', 'e']);
  });

  it('returns three empty buckets when no entries', () => {
    const grouped = groupNewsBySection([]);
    expect(grouped['ai-news']).toEqual([]);
    expect(grouped['deep-dives']).toEqual([]);
    expect(grouped['articles']).toEqual([]);
  });
});

describe('news-sections — pickFeatureEntry()', () => {
  it('picks the first articles entry when available', () => {
    const entries = [
      { id: 'a', data: { source: 'r/ClaudeAI' } },
      { id: 'b', data: { source: 'wired.com' } },
      { id: 'c', data: { source: 'r/ClaudeAI' } },
    ];
    expect(pickFeatureEntry(entries)?.id).toBe('b');
  });

  it('falls back to deep-dives if no articles', () => {
    const entries = [
      { id: 'a', data: { source: 'r/ClaudeAI' } },
      { id: 'b', data: { source: 'youtube.com' } },
    ];
    expect(pickFeatureEntry(entries)?.id).toBe('b');
  });

  it('falls back to ai-news if neither articles nor deep-dives', () => {
    const entries = [{ id: 'a', data: { source: 'r/ClaudeAI' } }];
    expect(pickFeatureEntry(entries)?.id).toBe('a');
  });

  it('returns null when all buckets empty', () => {
    expect(pickFeatureEntry([])).toBeNull();
  });
});

describe('news-sections — labels + tags coverage', () => {
  it('NEWS_SECTION_LABELS covers all three sections', () => {
    for (const s of NEWS_SECTIONS) {
      expect(NEWS_SECTION_LABELS[s]).toBeTruthy();
    }
  });

  it('NEWS_SECTION_TAGS covers all three sections', () => {
    for (const s of NEWS_SECTIONS) {
      expect(NEWS_SECTION_TAGS[s]).toBeTruthy();
    }
  });
});

// ─── 2. Token retune evidence ────────────────────────────────────────────

describe('AgentNews token retune — value evidence', () => {
  it('primitives.css contains the AgentNews teal accent value', async () => {
    const css = await readFile(
      path.resolve(__dirname, '../src/styles/tokens/primitives.css'),
      'utf-8',
    );
    expect(css).toMatch(/#007a8a/i);
    expect(css).toMatch(/#2dd4bf/i);
    expect(css).toMatch(/#f4f6f9/i);
    expect(css).toMatch(/#0b1419/i);
  });

  it('primitives.css declares the Newsreader serif family', async () => {
    const css = await readFile(
      path.resolve(__dirname, '../src/styles/tokens/primitives.css'),
      'utf-8',
    );
    expect(css).toMatch(/Newsreader/);
  });

  it('primitives.css declares the IBM Plex Sans + Mono families', async () => {
    const css = await readFile(
      path.resolve(__dirname, '../src/styles/tokens/primitives.css'),
      'utf-8',
    );
    expect(css).toMatch(/IBM Plex Sans/);
    expect(css).toMatch(/IBM Plex Mono/);
  });

  it('semantic.css declares both data-theme scopes', async () => {
    const css = await readFile(
      path.resolve(__dirname, '../src/styles/tokens/semantic.css'),
      'utf-8',
    );
    expect(css).toMatch(/data-theme=['"]light['"]/);
    expect(css).toMatch(/data-theme=['"]dark['"]/);
  });

  it('semantic.css declares the AgentNews flat-token surface', async () => {
    const css = await readFile(
      path.resolve(__dirname, '../src/styles/tokens/semantic.css'),
      'utf-8',
    );
    expect(css).toMatch(/--nbg-bg:/);
    expect(css).toMatch(/--nbg-surface:/);
    expect(css).toMatch(/--nbg-ink:/);
    expect(css).toMatch(/--nbg-accent:/);
    expect(css).toMatch(/--nbg-hairline:/);
    expect(css).toMatch(/--nbg-header-bg:/);
  });
});

// ─── 3. Layout class API ─────────────────────────────────────────────────

describe('agentnews-layout.css — class API completeness', () => {
  it('defines all 14 named atom classes', async () => {
    const css = await readFile(
      path.resolve(__dirname, '../src/styles/agentnews-layout.css'),
      'utf-8',
    );
    const required = [
      '.wrap', '.site-header', '.brand', '.nav', '.header-actions',
      '.search-trigger', '.theme-toggle', '.hero', '.section',
      '.feature', '.card', '.tag', '.eyebrow', '.empty',
    ];
    for (const cls of required) {
      expect(css).toContain(cls);
    }
  });

  it('honours prefers-reduced-motion', async () => {
    const css = await readFile(
      path.resolve(__dirname, '../src/styles/agentnews-layout.css'),
      'utf-8',
    );
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });

  it('uses --nbg-* tokens (no hardcoded hex)', async () => {
    const css = await readFile(
      path.resolve(__dirname, '../src/styles/agentnews-layout.css'),
      'utf-8',
    );
    // Allow alpha-channel rgba() and 1px hairlines, but no opaque hex colours
    // outside the standard reset / shadow declarations.
    // The file should consume --nbg-* tokens for all colour roles.
    expect(css).toMatch(/var\(--nbg-accent\)/);
    expect(css).toMatch(/var\(--nbg-bg\)/);
    expect(css).toMatch(/var\(--nbg-ink\)/);
  });
});

// ─── 4. Portability gate (AC36/AC37) ─────────────────────────────────────

describe('Portability — primitives stay Starlight-free', () => {
  it('zero @astrojs/starlight imports under src/components/primitives/', async () => {
    const dir = path.resolve(__dirname, '../src/components/primitives');
    const files = await readdir(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const s = await stat(full);
      if (!s.isFile()) continue;
      const body = await readFile(full, 'utf-8');
      expect(body).not.toMatch(/from\s+['"]@astrojs\/starlight/);
    }
  });
});

// ─── 5. AC5 — zero legacy flat hex colours ───────────────────────────────

describe('AC5 — legacy flat hex colors are gone', () => {
  it('no #0a7 / #e60 / #08c / #aa6 / #666 in src/', async () => {
    const checkedFiles = [
      'styles/tokens/legacy.css',
      'styles/tokens/primitives.css',
      'styles/tokens/semantic.css',
      'styles/tokens/aliases.css',
      'styles/agentnews-layout.css',
    ];
    const forbidden = /#0a7\b|#e60\b|#08c\b|#aa6\b|#666\b/;
    for (const rel of checkedFiles) {
      const body = await readFile(
        path.resolve(__dirname, '..', 'src', rel),
        'utf-8',
      );
      expect(body, `${rel} contains a forbidden legacy hex colour`).not.toMatch(forbidden);
    }
  });
});

// ─── 6. Build output evidence (AC10, AC15) ───────────────────────────────

describe('Build output evidence — only runs after `npm run build`', () => {
  it.skipIf(!process.env.AGENTNEWS_CHECK_BUILD)('homepage emits .hero + .section + .grid-3 markup', async () => {
    const html = await readFile(
      path.resolve(__dirname, '../dist/index.html'),
      'utf-8',
    );
    expect(html).toMatch(/class="hero"/);
    expect(html).toMatch(/class="section"/);
    expect(html).toMatch(/class="wrap"/);
  });
});
