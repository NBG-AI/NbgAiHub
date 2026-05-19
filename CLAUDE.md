# NbgAiHub — Project instructions

A curated Claude Code knowledge hub for bank colleagues, framed around *"what I wish I knew a year ago."* Skills catalog, tips & tricks, curated news, onboarding journeys, glossary — accessible both as a web UI (host TBD) and as a `/hub-*` skill inside Claude Code.

**Repo:** `github.com/chomovazuzana/NbgAiHub` (**private**, personal account, bootstrap mode).
**Constraint:** repo lives on a personal account — bank-confidential content should go through compliance review before being stored here, even though the repo is not world-readable.

## Project state files

@SCOPE.md

- **SCOPE.md** — current MVP scope, deferred items, explicit out-of-scope, open questions. Mutable; always reflects current truth. Auto-imported above.
- **DECISIONS.md** — append-only decision log. Consult before re-opening a settled question.
- **Issues - Pending Items.md** — per global rules.
- **SECRETS.md** — required GitHub Action secrets + one-time repo setup. Used by operators, not Claude.

## Repo layout

```
.
├── CLAUDE.md                  ← (this file)
├── SCOPE.md                   ← mutable scope (auto-imported)
├── DECISIONS.md               ← append-only history
├── SECRETS.md                 ← operator setup checklist
├── Issues - Pending Items.md  ← per global rules
├── config/
│   ├── rss-sources.json       ← data-driven feed list (currently 5: 2 Reddit + HN + Wired + Verge)
│   └── maintainers.json       ← team_aliases allowlist consumed by the skill-validator tool
├── news/
│   ├── incoming/              ← Action writes triaged items here, PR opens for review
│   └── published/             ← editor moves approved items here (permanent archive)
├── glossary/                  ← 15 terms (original 5 + claude-code, context-window, build-time-vs-runtime, gsd, gh, repository, commit, branch, pull-request, issue)
├── skills/                    ← 9 entries cataloguing 556LowCodeNoCode/Skills marketplace (extended 17-key schema lives in site/src/content.config.ts)
├── tips/                      ← 12 entries (prompting, survival keys, context, compliance)
├── journeys/                  ← day-1.md (full 6-step walkthrough; week-1.md + by-role TBD)
├── pipeline/                  ← TypeScript workspace for the RSS Action + skill validator
│   ├── package.json           ← Node 22, ESM, vitest 4.x, @rowanmanning/feed-parser
│   ├── src/                   ← 15 RSS modules + src/validators/ (skill, cli, config)
│   │   └── validators/        ← skill-validator tool (see docs/tools/skill-validator.md)
│   └── tests/                 ← 15 test files, 112 tests (101 RSS + 11 validator)
├── site/                      ← Astro 6 + Starlight 0.39 web UI workspace
│   ├── package.json           ← Node 22, ESM, astro ^6, @astrojs/starlight ^0.39, vitest 4.x
│   ├── astro.config.mjs       ← sidebar 11 entries (My Pins + Submit a Skill added), SocialIcons override, dev port 4321
│   ├── vitest.config.ts       ← Vitest 4.x node-env, tests/**/*.test.ts pattern
│   ├── src/content.config.ts  ← 5 content collections; skills schema extended with 7 new fields
│   ├── src/components/        ← 10 .astro components: original 7 + PinButton, SignInModal, SocialIconsOverride
│   ├── src/lib/               ← 8 TS modules: news, slug, auth, api-fetch, gist, submission, skill-types, pin-store
│   ├── src/pages/             ← /news, /skills, /tips, /glossary, /reference,
│   │                            /contribute, /start-here/day-1, /start-here/week-1,
│   │                            /my-pins, /submit-skill (the personalization pages)
│   ├── src/content/docs/      ← index.mdx (homepage, template:splash)
│   ├── scripts/               ← build-pin-index.ts (pre-build step emitting public/_data/<type>-index.json)
│   ├── public/_data/          ← build-emitted JSON indices (5 files, one per content type)
│   └── tests/                 ← 7 test files, 127 tests (auth, api-fetch, gist, submission, pin-store, build-pin-index, slug)
├── plugin/                   ← Claude Code plugin workspace — eleven /hub-* commands
│   ├── package.json           ← Node 22, ESM, vitest 4.x, esbuild ^0.25 (deps: gray-matter, js-yaml, open)
│   ├── tsconfig.json          ← strict TS (mirror of pipeline/)
│   ├── esbuild.config.mjs     ← bundles src/<cmd>.ts → dist/<cmd>.mjs with packages: "external"
│   ├── config.json            ← URL config (devMode flag), search weights, refresh cache path
│   ├── .claude-plugin/        ← Claude Code spec dir
│   │   └── plugin.json        ← plugin manifest (name/description/author; NO commands array, NO version)
│   ├── commands/              ← 11 markdown command shells, filesystem-discovered by Claude Code
│   ├── src/                   ← 11 entry scripts (hub.ts, hub-search.ts, …) + lib/ (13 shared modules)
│   ├── snapshot/              ← bundled content snapshot (built by scripts/build-snapshot.mjs)
│   ├── scripts/build-snapshot.mjs ← mirrors repo's glossary/tips/skills/news/journeys into snapshot/
│   ├── dist/                  ← esbuild output (gitignored except .gitkeep)
│   └── tests/                 ← 13 test files, 130 tests (12 lib + manifest + e2e entry-script smoke)
├── .claude-plugin/            ← repo-root marketplace manifest for /plugin marketplace add chomovazuzana/NbgAiHub
│   └── marketplace.json       ← lists nbg-ai-hub with source: "./plugin"
├── .github/workflows/
│   ├── rss-triage.yml         ← daily cron 05:00 UTC = 08:00 Athens (DST) + workflow_dispatch
│   └── validate-skill-submission.yml ← PR-on-skills/**/*.md → CI validator → GH Actions annotations
└── docs/
    ├── design/                ← project-design.md (§1-S.12 + §P.1-P.13 personalization + §H.1-H.13 hub plugin), plan-001/002/003 (RSS / site / hub plugin)
    ├── reference/             ← code-review, dep-validation, integration-verification, test-build,
    │                            codebase-scans, investigations, gist-contract.md (incl. hub-plugin set)
    ├── refined-requests/      ← refined specs (rss-pipeline, astro-starlight-site, personalization-and-contributions, hub-plugin)
    └── tools/                 ← per-tool docs per global CLAUDE.md convention (skill-validator.md)
```

## Working rules for this project

- **Before any architectural discussion or scope change**, re-read SCOPE.md and check DECISIONS.md for prior calls on the topic.
- **When we converge on a decision**, append a new dated entry to DECISIONS.md. Never edit prior entries — supersede with a new entry instead.
- **When scope changes**, update SCOPE.md (the relevant section + bump *Last updated*) in the same edit.
- **Tone for all content authored under this project:** *"what I wish I knew a year ago"* — opinionated, plainspoken, no AI-slop hedging, no marketing voice. Assume the reader is a smart colleague new to Claude Code.

## Naming

Final name: **NbgAiHub**. Repo: `github.com/chomovazuzana/NbgAiHub`.

## Ports

- **Astro Starlight dev server: `4321`** (in use — `cd site && npm run dev`). Fallback band 4322–4329 per global port rules.
- No other dev servers planned for MVP. The plugin's `/hub-open` *probes* localhost:4321 (no server of its own) when `devMode: true`.

## Project tools

Per global CLAUDE.md `docs/tools/<name>.md` convention — reusable TypeScript capabilities documented for future invocation:

- **`skill-validator`** — CI validator enforcing the 17-rule skill frontmatter contract on `skills/**/*.md` PRs. Source: `pipeline/src/validators/{skill,cli,config}.ts`. Doc: `docs/tools/skill-validator.md`.
