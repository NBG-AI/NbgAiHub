// site/tests/remark-glossary-news-skip.test.ts
//
// Tests for news-skip behavior (resolved OQ1) from docs/design/project-design.md §S.14.5.

import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGlossaryLink from '../src/plugins/remark-glossary-link.ts';
import { resolve } from 'node:path';

const glossaryDir = resolve(import.meta.dirname, '../../glossary');

async function processWithDefaults(md: string, filePath = '/test/page.md'): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGlossaryLink, { glossaryDir })
    .use(remarkStringify)
    .process({ value: md, path: filePath });
  return String(file);
}

async function processWithCustomExcludes(md: string, filePath: string, excludePaths: string[]): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGlossaryLink, { glossaryDir, excludePaths })
    .use(remarkStringify)
    .process({ value: md, path: filePath });
  return String(file);
}

describe('News-skip behavior (resolved OQ1)', () => {
  it('news file at /news/published/foo.md produces no buttons', async () => {
    const result = await processWithDefaults('agent is important here', '/path/news/published/foo.md');
    expect(result).not.toContain('data-glossary-slug=');
  });

  it('path-substring match is correct for published news', async () => {
    const result = await processWithDefaults('agent item', '/path/news/published/2026-01-01-item.md');
    expect(result).not.toContain('data-glossary-slug=');
  });

  it('path-substring does NOT match news/draft/', async () => {
    const result = await processWithDefaults('agent draft', '/path/news/draft/foo.md');
    expect(result).toContain('data-glossary-slug="agent"');
  });

  it('default excludePaths includes /news/published/', async () => {
    const result = await processWithDefaults('agent text', '/var/path/news/published/item.md');
    expect(result).not.toContain('data-glossary-slug=');
  });

  it('custom excludePaths option works', async () => {
    const result = await processWithCustomExcludes(
      'agent at private',
      '/path/private/foo.md',
      ['/private/']
    );
    expect(result).not.toContain('data-glossary-slug=');
  });

  it('excludePaths supports multiple patterns', async () => {
    const result1 = await processWithCustomExcludes(
      'agent text',
      '/path/private/foo.md',
      ['/private/', '/drafts/']
    );
    const result2 = await processWithCustomExcludes(
      'agent text',
      '/path/drafts/bar.md',
      ['/private/', '/drafts/']
    );
    expect(result1).not.toContain('data-glossary-slug=');
    expect(result2).not.toContain('data-glossary-slug=');
  });

  it('excludePaths=[] processes all files', async () => {
    const result = await processWithCustomExcludes(
      'agent text',
      '/path/news/published/item.md',
      []
    );
    expect(result).toContain('data-glossary-slug="agent"');
  });

  it('news/published substring anywhere in path triggers skip', async () => {
    const result = await processWithDefaults('agent here', '/deeply/nested/news/published/path/to/file.md');
    expect(result).not.toContain('data-glossary-slug=');
  });

  it('non-excluded path processes normally', async () => {
    const result = await processWithDefaults('agent and skill', '/path/tips/tip-123.md');
    expect(result).toContain('data-glossary-slug="agent"');
    expect(result).toContain('data-glossary-slug="skill"');
  });

  it('excludePaths is case-sensitive', async () => {
    const result = await processWithCustomExcludes(
      'agent text',
      '/path/News/Published/item.md',
      ['/news/published/']
    );
    // Capital case doesn't match lowercase pattern
    expect(result).toContain('data-glossary-slug="agent"');
  });
});
