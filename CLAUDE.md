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
│   └── rss-sources.json       ← data-driven feed list (5 seed feeds)
├── news/
│   ├── incoming/              ← Action writes triaged items here, PR opens for review
│   └── published/             ← editor moves approved items here (permanent archive)
├── pipeline/                  ← TypeScript workspace for the RSS Action
│   ├── package.json           ← Node 22, ESM, vitest 4.x, @rowanmanning/feed-parser
│   ├── src/                   ← 15 modules: env, azure-client, fetch, parse, dedup,
│   │                            triage, slug, frontmatter, write, pr, etc.
│   └── tests/                 ← 14 test files, 88 tests, vitest
├── .github/workflows/
│   └── rss-triage.yml         ← daily cron 06:00 UTC + workflow_dispatch
└── docs/
    ├── design/                ← project-design.md, plan-001-rss-pipeline.md, etc.
    ├── reference/             ← code-review, dep-validation, integration-verification
    └── refined-requests/      ← refined specs (rss-pipeline.md is the seed)
```

## Working rules for this project

- **Before any architectural discussion or scope change**, re-read SCOPE.md and check DECISIONS.md for prior calls on the topic.
- **When we converge on a decision**, append a new dated entry to DECISIONS.md. Never edit prior entries — supersede with a new entry instead.
- **When scope changes**, update SCOPE.md (the relevant section + bump *Last updated*) in the same edit.
- **Tone for all content authored under this project:** *"what I wish I knew a year ago"* — opinionated, plainspoken, no AI-slop hedging, no marketing voice. Assume the reader is a smart colleague new to Claude Code.

## Naming

Final name: **NbgAiHub**. Repo: `github.com/chomovazuzana/NbgAiHub`.

## Ports

- Astro Starlight dev server (when added): **4321** (fallback band 4322–4329 per global port rules).
- No other dev servers planned for MVP.
