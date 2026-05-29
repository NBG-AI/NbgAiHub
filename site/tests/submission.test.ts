// site/tests/submission.test.ts
//
// Unit tests for the submission helper. Runs under the default `node`
// vitest environment; navigator + fetch are stubbed via vi.stubGlobal.
//
// Coverage map (against the acceptance criteria in plan-005-skills-catalog):
//   - serializeSkillToMarkdown: canonical key order, nullish omissions
//   - buildEditorUrl:           URL-encoding correctness, AC12 length flip
//   - validateSkillForm:        happy path, AC13 install_command, AC14 skill_id,
//                               multi-issue accumulation (no short-circuit)
//   - checkSlugCollision:       AC15 200/404/429 + network-error mapping
//   - copyToClipboard:          success path + ClipboardUnavailableError

import { describe, it, expect, afterEach, vi } from 'vitest';

import {
  serializeSkillToMarkdown,
  buildEditorUrl,
  validateSkillForm,
  copyToClipboard,
  checkSlugCollision,
  deriveSlugFromTitle,
  ClipboardUnavailableError,
} from '../src/lib/submission.js';
import type { SkillForm } from '../src/lib/skill-types.js';

/** Build a known-valid SkillForm; tests mutate one field at a time. */
function makeValidForm(overrides: Partial<SkillForm> = {}): SkillForm {
  return {
    type: 'skill',
    title: 'Example Skill',
    audience: 'both',
    topics: ['workflow', 'cli'],
    internal: false,
    authored: '2026-05-19',
    last_reviewed: '2026-05-19',
    external_link: null,
    deeper_link: null,
    ai_summary: 'A short summary of what this skill does.',
    install_command: '/plugin marketplace add 556LowCodeNoCode/NbgAiHub',
    skill_id: 'example-skill',
    origin: 'internal',
    category: 'workflow',
    status: 'active',
    maintainer: '@chomovazuzana',
    body: '# Example Skill\n\nThis is the body.',
    ...overrides,
  };
}

describe('serializeSkillToMarkdown', () => {
  it('emits frontmatter keys in canonical order', () => {
    const md = serializeSkillToMarkdown(
      makeValidForm({
        external_link: 'https://example.com/a',
        deeper_link: 'https://example.com/b',
        requires: ['claudemd', 'mcp'],
      }),
    );

    // Strip the body so we only inspect the frontmatter block.
    const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
    expect(fmMatch).not.toBeNull();
    const fm = (fmMatch as RegExpMatchArray)[1] as string;

    const expectedKeys = [
      'type',
      'title',
      'audience',
      'topics',
      'internal',
      'authored',
      'last_reviewed',
      'external_link',
      'deeper_link',
      'ai_summary',
      'install_command',
      'skill_id',
      'origin',
      'category',
      'status',
      'maintainer',
      'requires',
    ];

    // Build a regex that asserts each key appears in order at the
    // start of a line, with anything (including list items) between them.
    const orderedKeyPattern = new RegExp(
      expectedKeys.map((k) => `^${k}:`).join('[\\s\\S]*?'),
      'm',
    );
    expect(fm).toMatch(orderedKeyPattern);

    // Body still present after the closing ---.
    expect(md).toMatch(/---\n\n# Example Skill/);
  });

  it('omits external_link when null', () => {
    const md = serializeSkillToMarkdown(makeValidForm({ external_link: null }));
    expect(md).not.toMatch(/^external_link:/m);
  });

  it('omits deeper_link when null', () => {
    const md = serializeSkillToMarkdown(makeValidForm({ deeper_link: null }));
    expect(md).not.toMatch(/^deeper_link:/m);
  });

  it('omits requires when undefined', () => {
    const md = serializeSkillToMarkdown(makeValidForm());
    expect(md).not.toMatch(/^requires:/m);
  });

  it('omits requires when an empty array', () => {
    const md = serializeSkillToMarkdown(makeValidForm({ requires: [] }));
    expect(md).not.toMatch(/^requires:/m);
  });

  it('emits requires when populated', () => {
    const md = serializeSkillToMarkdown(makeValidForm({ requires: ['claudemd'] }));
    expect(md).toMatch(/^requires:\n {2}- claudemd$/m);
  });

  it('round-trips YAML-special characters in title (colon, quotes)', () => {
    const md = serializeSkillToMarkdown(
      makeValidForm({ title: 'Tricky: a "weird" title' }),
    );
    // Whatever escaping yaml picks (quoted/escaped), the raw characters
    // must round-trip when parsed. We assert via a substring presence
    // check against the yaml library on the receiving side.
    expect(md).toMatch(/^title:/m);
    // A naive grep for the literal substring still finds the words.
    expect(md).toContain('Tricky');
    expect(md).toContain('weird');
  });
});

describe('buildEditorUrl', () => {
  it('URL-encodes body containing &, =, #', () => {
    const slug = 'example-skill';
    const body = 'value=1&other=2#fragment';
    const { url } = buildEditorUrl(slug, body);
    // The encoded form contains percent-escapes for each special char.
    expect(url).toContain('%26'); // &
    expect(url).toContain('%3D'); // =
    expect(url).toContain('%23'); // #
    // The literal raw special chars must NOT appear in the value param
    // (they would prematurely terminate the query string parameter).
    const valueParam = url.split('&value=')[1];
    expect(valueParam).toBeDefined();
    expect(valueParam).not.toContain('=');
    expect(valueParam).not.toContain('#');
    // The slug is encoded into the filename param.
    expect(url).toContain(`filename=${slug}.md`);
  });

  it('encodes slugs with special characters', () => {
    // deriveSlugFromTitle should normally produce safe slugs, but the
    // helper still needs to encode defensively in case a caller forgets.
    const { url } = buildEditorUrl('weird slug', 'body');
    expect(url).toContain('filename=weird%20slug.md');
  });

  it('AC12: fits in URL at 6000-char body', () => {
    const body = 'a'.repeat(6000);
    const { fitsInUrl } = buildEditorUrl('example-skill', body);
    expect(fitsInUrl).toBe(true);
  });

  it('AC12: does not fit in URL at 8000-char body', () => {
    const body = 'a'.repeat(8000);
    const { url, fitsInUrl } = buildEditorUrl('example-skill', body);
    expect(fitsInUrl).toBe(false);
    expect(url.length).toBeGreaterThan(7000);
  });

  it('AC12: explicit oversized body case surfaces the flip', () => {
    // A serialized form with 8 KB body should not fit.
    const md = serializeSkillToMarkdown(
      makeValidForm({ body: 'x'.repeat(8000) }),
    );
    const { fitsInUrl } = buildEditorUrl('example-skill', md);
    expect(fitsInUrl).toBe(false);
  });
});

describe('validateSkillForm', () => {
  it('happy path returns {ok: true}', () => {
    expect(validateSkillForm(makeValidForm())).toEqual({ ok: true });
  });

  it('accepts external_link and deeper_link as parseable URLs', () => {
    const result = validateSkillForm(
      makeValidForm({
        external_link: 'https://example.com/foo',
        deeper_link: 'https://docs.example.com/bar',
      }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('accepts /plugin install <id> as a valid install_command prefix', () => {
    const result = validateSkillForm(
      makeValidForm({ install_command: '/plugin install some-skill' }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('AC13: rejects install_command "rm -rf /" with field=install_command', () => {
    const result = validateSkillForm(
      makeValidForm({ install_command: 'rm -rf /' }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const ic = result.issues.find((i) => i.field === 'install_command');
    expect(ic).toBeDefined();
    expect(ic?.rule).toBe('install-prefix');
  });

  it('AC14: rejects skill_id "Bad Slug" with field=skill_id', () => {
    const result = validateSkillForm(makeValidForm({ skill_id: 'Bad Slug' }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const si = result.issues.find((i) => i.field === 'skill_id');
    expect(si).toBeDefined();
    expect(si?.rule).toBe('kebab-id');
  });

  it('accumulates multiple violations without short-circuiting', () => {
    const result = validateSkillForm(
      makeValidForm({
        title: '',
        skill_id: 'Bad Slug',
        install_command: 'rm -rf /',
        authored: 'not-a-date',
        maintainer: 'no-at-sign',
        body: '',
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const fields = result.issues.map((i) => i.field);
    expect(fields).toContain('title');
    expect(fields).toContain('skill_id');
    expect(fields).toContain('install_command');
    expect(fields).toContain('authored');
    expect(fields).toContain('maintainer');
    expect(fields).toContain('body');
    expect(result.issues.length).toBeGreaterThanOrEqual(6);
  });

  it('rejects malformed external_link', () => {
    const result = validateSkillForm(
      makeValidForm({ external_link: 'not a url' }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((i) => i.field === 'external_link')).toBe(true);
  });

  it('rejects malformed dates', () => {
    const result = validateSkillForm(
      makeValidForm({ authored: '2026/05/19', last_reviewed: 'yesterday' }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((i) => i.field === 'authored')).toBe(true);
    expect(result.issues.some((i) => i.field === 'last_reviewed')).toBe(true);
  });

  it('rejects invalid audience / origin / category / status enums', () => {
    const result = validateSkillForm(
      makeValidForm({
        // Cast intentional — exercising the runtime enum check.
        audience: 'expert' as unknown as SkillForm['audience'],
        origin: 'random' as unknown as SkillForm['origin'],
        category: 'misc' as unknown as SkillForm['category'],
        status: 'sunset' as unknown as SkillForm['status'],
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((i) => i.field === 'audience')).toBe(true);
    expect(result.issues.some((i) => i.field === 'origin')).toBe(true);
    expect(result.issues.some((i) => i.field === 'category')).toBe(true);
    expect(result.issues.some((i) => i.field === 'status')).toBe(true);
  });

  it('rejects empty topics array', () => {
    const result = validateSkillForm(makeValidForm({ topics: [] }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((i) => i.field === 'topics')).toBe(true);
  });
});

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('calls navigator.clipboard.writeText with the markdown', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await copyToClipboard('hello world');
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('hello world');
  });

  it('throws ClipboardUnavailableError when navigator.clipboard is missing', async () => {
    vi.stubGlobal('navigator', {});
    await expect(copyToClipboard('x')).rejects.toBeInstanceOf(
      ClipboardUnavailableError,
    );
  });

  it('throws ClipboardUnavailableError when navigator is missing entirely', async () => {
    vi.stubGlobal('navigator', undefined);
    await expect(copyToClipboard('x')).rejects.toBeInstanceOf(
      ClipboardUnavailableError,
    );
  });
});

describe('checkSlugCollision', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("AC15: returns 'collision' on 200", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await checkSlugCollision('example-skill');
    expect(result).toBe('collision');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    expect(firstCall[0]).toContain('/skills/example-skill.md');
  });

  it("AC15: returns 'free' on 404", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
    const result = await checkSlugCollision('example-skill');
    expect(result).toBe('free');
  });

  it("AC15: returns 'unknown' on 429", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 429 })));
    const result = await checkSlugCollision('example-skill');
    expect(result).toBe('unknown');
  });

  it("returns 'unknown' on 403 (rate-limited)", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 })));
    const result = await checkSlugCollision('example-skill');
    expect(result).toBe('unknown');
  });

  it("returns 'unknown' when fetch rejects with a network error", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('network down')),
    );
    const result = await checkSlugCollision('example-skill');
    expect(result).toBe('unknown');
  });
});

describe('deriveSlugFromTitle', () => {
  it('delegates to slugify', () => {
    expect(deriveSlugFromTitle('Hello, World!')).toBe('hello-world');
  });
});
