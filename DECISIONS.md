# Decision log

Append-only. Each entry permanent. When a decision is superseded, add a new entry that supersedes it — never edit prior entries.

---

## 2026-05-18 — Reframe "marketplace" → "hub" / "field manual"

**Decision:** The project is conceptually a *hub* (or *field manual*), not a *marketplace*.

**Why:** "Marketplace" implies a catalog of items / transactions. What we're actually building is a curated journey for newcomers framed around the team's hard-won lessons. Framing shapes the information architecture.

**Alternatives considered:** Keep "marketplace" framing (rejected: misleads contributors into thinking link-list completeness matters more than curation).

**Status:** accepted.

---

## 2026-05-18 — Triangle architecture: GitHub repo as CMS + Astro Starlight web UI + Claude Code skill

**Decision:** Single GitHub repo holds markdown as the source of truth. Astro Starlight builds a static web UI from it. A Claude Code skill plugin reads the same content to expose `/hub-*` commands inside the terminal.

**Why:** One source of truth, two surfaces. Markdown is native to both Claude Code and human contributors. GitOps gives versioning and PR-based curation for free. The skill is the differentiator (lives inside the tool people use daily); the web UI is table stakes for first impressions and stakeholders.

**Alternatives considered:** Azure web app (rejected: contributor friction, no Claude-native access), GitHub Pages markdown-only (rejected: insufficient polish for promotion-grade demo), Notion / Confluence (rejected: not Claude-readable, not git-versionable, brand mismatch).

**Status:** accepted.

---

## 2026-05-18 — Curated RSS, not auto-aggregated

**Decision:** GitHub Action fetches RSS feeds daily into `/news/incoming` (staging). Items are promoted to `/news/published` only via PR (manual editorial review).

**Why:** Auto-aggregation becomes noise within a week and erodes trust. The promotion step is itself a quality signal. Cost: a few minutes of editorial review per week. Benefit: zero broken-trust-on-day-one risk.

**Alternatives considered:** Live RSS widget (rejected: noise, no editorial control), no news at all (rejected: misses one of the most-asked-for content types).

**Status:** accepted.

---

## 2026-05-18 — Astro Starlight as static site generator

**Decision:** Use Astro Starlight to build the web UI.

**Why:** Clean dev-docs aesthetic that doesn't read as AI slop; built-in tag filtering, sidebar nav, dark mode, search, and MDX; reference users (Cloudflare, Tauri, Biome) give it credibility; low learning curve for contributors who already know markdown.

**Alternatives considered:** Docusaurus (heavier, React-first feel), MkDocs Material (Python-flavored toolchain), Nextra (Next.js weight without enough payoff for a static site).

**Status:** accepted; revisit if a specific feature gap surfaces.

---

## 2026-05-18 — Skill is the differentiator; web UI is table stakes

**Decision:** Prioritize the Claude Code skill plugin as the primary value driver. The web UI exists for stakeholder demos and first-visit discovery, not as the daily-use surface.

**Why:** Internal portals die because nobody bookmarks them. A skill lives inside the tool teammates use daily. Adoption follows.

**Status:** accepted. Drives MVP prioritization — the skill must be functional in the MVP even if the web UI is sparse.

---

## 2026-05-18 — Project documentation pattern: SCOPE.md (mutable) + DECISIONS.md (append-only) + project CLAUDE.md (wiring)

**Decision:** Track project evolution with two living docs — `SCOPE.md` (always reflects current truth, edited in place) and `DECISIONS.md` (this file — append-only, immutable record). Project `CLAUDE.md` auto-imports SCOPE.md and encodes rules for when to update each file.

**Why:** Manager demo needs a chronological narrative of how we thought about this. Future Claude sessions need fresh context without paying tokens for an ever-growing history file. Splitting mutable state from immutable history gives both.

**Alternatives considered:** GSD `.planning/` structure (rejected: heavyweight for pre-MVP exploration), single CLAUDE.md as scope source (rejected: CLAUDE.md is for agent behavior, not project state).

**Status:** accepted.

---

## 2026-05-18 — Onboarding guide is complementary, not duplicative

**Decision:** The hub does **not** absorb or rewrite the existing Onboarding guide at `556lowcodenocode.github.io/Onboarding`. Instead, the hub provides three things the guide doesn't: (1) *curated journeys* (Day 1, Week 1, by-role), (2) a *living catalog* (skills, tips, news, glossary), (3) a *Claude-Code-native skill* (`/hub-*`). Every hub page deep-links into the relevant guide section.

**Why:** The Onboarding guide is the encyclopedia (~12,000 words, 11 sections, comprehensive reference). The hub is the journey + catalog + skill layer. Different shapes, different consumption patterns. Duplicating content would create drift and double the maintenance burden for the same team.

**Alternatives considered:** Absorb the guide into the hub (rejected: existing guide is already published, maintained, linkable — moving it would break inbound links and bury 12K words of work). Maintain in parallel as the same content (rejected: drift).

**Status:** accepted.

---

## 2026-05-18 — Five user-facing pillars + cross-cutting substrate

**Decision:** The hub has five user-facing pillars: **Skills catalog**, **Tips & Tricks**, **News**, **Curated journeys**, **Glossary + Reference**. The substrate that underlies all five: GitHub repo as CMS, Astro Starlight web UI, hub-as-skill plugin, shared content shape.

**Why:** Locking the pillars locks the IA. Naming Tips, Journeys, and Glossary explicitly (not just "skills + news + onboarding") catches what was missing from the original three-pillar framing. The substrate is what makes the pillars composable — same plumbing for every pillar.

**Status:** accepted.

---

## 2026-05-18 — Shared content shape across all pillars

**Decision:** Every piece of hub content — skill entry, tip, news item, journey step, glossary term, reference page — uses one common frontmatter schema:

```yaml
---
type: skill | tip | news | journey-step | glossary | reference
title: ...
audience: [beginner | advanced | both]
topics: [setup, workflow, github, mcp, claudemd, ...]
internal: false
authored: 2026-05-18
last_reviewed: 2026-05-18
external_link: ...      # for skills, news
deeper_link: ...        # to a section of the Onboarding guide
ai_summary: ...         # auto-generated; optional
---
```

**Why:** One filter, one tag system, one search index, one set of `/hub-*` commands work across every pillar with no per-pillar plumbing. Adding a new pillar later (e.g., war stories, post-mortems) inherits the same machinery for free.

**Status:** accepted.

---

## 2026-05-18 — Tips & Tricks are a distinct pillar from Skills

**Decision:** Tips & Tricks (patterns, prompts, gotchas, workflow recipes) are a separate pillar from Skills (installable packaged instruction sets distributed via plugin marketplace).

**Why:** Different content shapes, different consumption patterns. A tip is *read and apply manually* (e.g., "use `Esc Esc` to stop and edit your last prompt"). A skill is *install once and invoke* (e.g., `/team`). Mixing them obscures discovery — newcomers don't know whether they're being told to *do* something or *install* something.

**Status:** accepted.

---

## 2026-05-18 — Hub ships as its own Claude Code skill plugin

**Decision:** The hub repo includes its own plugin manifest. Installing the hub = `/plugin marketplace add chomovazuzana/NbgAiHub` followed by `/plugin install hub@…`. The plugin exposes `/hub`, `/hub-search <query>`, `/hub-news`, `/hub-tips`, `/hub-skills`, `/hub-onboard <journey>`, and adds a CLAUDE.md fragment so the local agent knows the hub exists. Updates via `/plugin marketplace update`.

**Why:** One command bootstraps a colleague into the hub. Aligns naturally with Day 1 Step 5 ("install the team plugin marketplace"). Reinforces the "skill is the differentiator" decision — the hub *is* a skill that exposes everything else.

**Status:** accepted.

---

## 2026-05-18 — Hybrid glossary: canonical page + inline anchor links

**Decision:** Glossary terms live on a canonical `/glossary` page with anchors (`/glossary#claudemd`, `/glossary#mcp`, etc.). Across other pages, terms link to those anchors when first mentioned. No definitions duplicated inline.

**Why:** One canonical definition (no drift) + contextual access from anywhere in the hub + the glossary page itself is discoverable/searchable as its own asset.

**Alternatives considered:** Flat page only (rejected: forces context switch every time a reader hits a new term), inline-only definitions (rejected: drift across pages, no single place to skim all terms).

**Status:** accepted.

---

## 2026-05-18 — AI strategy: build-time + Claude skill, not web runtime

**Decision:** AI lives in two places in the system, and explicitly **not** in a third:

| Where | What | Why |
|---|---|---|
| Build-time (GitHub Action) | RSS triage, auto-tagging, summarization via Azure OpenAI | Earns its keep: dedup + tag + summarize at scale |
| Runtime — Claude Code skill | `/hub-ask`, `/hub-search` use the user's existing Claude session for semantic queries over hub content | Zero infra; the user's Claude IS the chatbot |
| Runtime — website | **Nothing** | Keeps the static site fast, free to host, no backend |

**Why:** A chatbot on the website would be inferior to the Claude Code skill that already serves the same purpose with full session context. Build-time AI runs once daily, cheaply, and the output is reviewable in a PR. Azure OpenAI for the build-time pipeline aligns with bank policy for any AI inference in shipped code, even when processing public RSS data — sets the right precedent for newcomers reading the system.

**Alternatives considered:** Live chatbot widget on the website (rejected: duplicates the Claude skill, requires backend), client-side embeddings search in the browser (rejected: needs an embeddings index served somewhere, complexity not justified for MVP).

**Status:** accepted.

---

## 2026-05-18 — Repo: chomovazuzana/NbgAiHub, public, single-repo

**Decision:** Initial home of the hub is `github.com/chomovazuzana/NbgAiHub` (personal account, not team org). Repo is **public** to enable free GitHub Pages on the personal tier. **Single repo** holds everything: content markdown, Astro Starlight site, GitHub Action for RSS, and the Claude Code plugin manifest.

**Why:** Bootstrap mode. Personal account lowers permission/coordination overhead during the design and MVP phase. Public visibility is required for free Pages on personal tier; aligns with the "publish public-safe onboarding content, gate bank-specific later" pattern. Single-repo keeps content + code + plugin coherent and easy to PR.

**Permanent implications of public-on-personal:**
- **Public-safe content only.** Bank-confidential material cannot live here, even gated by the `internal: true` frontmatter flag — that flag is reserved for *team-internal-but-not-confidential* content (e.g., internal tool links, team Slack channels by name).
- **PR contribution** flow runs through the repo owner; team contributors are added as collaborators or fork-and-PR.
- **Migration path** for the day we need real gating: (a) transfer to a team org and upgrade to GitHub Team, or (b) add a private supplement repo whose content the public hub does not reference.

**Alternatives considered:** Team org `556LowCodeNoCode` from day one (rejected: heavier coordination overhead before MVP exists; team org name doesn't reflect hub branding). Private personal repo (rejected: free Pages requires public on personal tier; premature spend on Pro). Two-repo split — content + code (rejected: complexity not justified for MVP).

**Status:** SUPERSEDED on 2026-05-18 by the entry below — repo will be PRIVATE.

---

## 2026-05-18 — Repo visibility: PRIVATE (supersedes prior public decision)

**Decision:** `chomovazuzana/NbgAiHub` will be **private**, not public. Naming (`NbgAiHub`), location (`chomovazuzana`), and single-repo structure from the prior entry stand; only visibility flips.

**Why:** User override — preference to iterate without world-readable visibility during pre-MVP design phase.

**Implications:**
- **GitHub Pages from a private repo on a personal account requires GitHub Pro** ($4/month or $40/year). Without Pro, the static site cannot be deployed via free Pages — we'd need alternative hosting (Vercel free tier, Netlify free tier, Cloudflare Pages) or defer deployment.
- **Bank-internal content can technically live here** since the repo is not world-readable. However, it still resides under a *personal* GitHub account, not under bank-managed infrastructure. Bank compliance review may be required before storing any real internal material.
- **Team contributors** must be added as individual collaborators (no public fork-and-PR flow available).
- **Hosting decision is now an open question** in SCOPE.md (GitHub Pro for Pages vs. alternative host vs. defer hosting until later).

**Status:** accepted; visibility now private, hosting strategy open.

---

## 2026-05-18 — RSS library: `@rowanmanning/feed-parser` (supersedes refined-request Assumption A6)

**Decision:** The RSS pipeline uses `@rowanmanning/feed-parser` ^2.x — **not** `rss-parser` as originally assumed in the refined request (A6).

**Why:** Phase 3a investigation found `rss-parser` (rbren/rss-parser on GitHub) is effectively unmaintained — no npm release in ~3 years, ~20 open 2024 bug reports, no response from maintainer. `@rowanmanning/feed-parser` is actively maintained, tested against ~40 real-world feeds, throws typed `INVALID_FEED` errors, and forces a cleaner fetch/parse seam for testing. Equivalent functionality, better engineering hygiene, no migration cost since we hadn't written code yet at the time of the swap.

**Alternatives considered:** Stick with `rss-parser` (rejected: technical debt from day one, foreseeable upgrade pain), `feedparser` (rejected: older callback-style API), hand-rolling (rejected: scope creep).

**Status:** accepted; implemented in `pipeline/src/parse.ts`. Validated end-to-end on 2026-05-18 — parsed all 5 feeds, including the Atom-format Claude Code releases feed, without issue.

---

## 2026-05-18 — Test framework: Vitest 4.x (upgraded from 2.1.9)

**Decision:** Upgrade test framework from Vitest 2.1.9 (originally scaffolded) to Vitest ^4.1.6.

**Why:** Phase 8 dependency validator surfaced **5 moderate-severity security advisories** in vitest 2.x transitive deps (`vite`, `esbuild`, `@vitest/mocker`, `vite-node`). All resolved in vitest ^4.1.6. Vulnerabilities are dev-tooling-only (do not ship in production GH Action runtime), but were trivially fixable in the same workflow run.

**Cost of the upgrade:** Two test files needed adjustment — `tests/azure-client.test.ts` (vitest 4 no longer auto-applies `[[Construct]]` semantics to arrow-function mocks; switched to `function` expressions for newable mocks) and `tests/write.test.ts` (a pre-existing latent bug surfaced — gray-matter's default `js-yaml` engine auto-converts YAML 1.1 date strings to JS `Date` objects, breaking the `authored: "2026-05-18"` string assertion; switched gray-matter to use the `yaml` engine for round-trip parity with our producer). No production source modules changed.

**Result:** 88/88 tests pass, 0 vulnerabilities (production + dev), typecheck + lint clean.

**Alternatives considered:** Defer the upgrade as a follow-up task (rejected by user during workflow — fix-now keeps the repo clean from day one); switch to Jest (rejected: heavier TS configuration, no compelling reason).

**Status:** accepted; installed and verified 2026-05-18.

---

## 2026-05-18 — RSS pipeline verified operational end-to-end

**Decision:** The RSS curation pipeline is acknowledged **OPERATIONAL** following the first successful end-to-end run on 2026-05-18. Acceptance criteria are MET in production, not just on local test runs.

**Why this entry exists:** The audit trail benefits from a permanent marker that distinguishes "pipeline coded" from "pipeline working in real life." Phase 10's per-AC verdict was based on tests + lint + typecheck, all green. This entry captures the *operational* validation that's qualitatively different — real RSS feeds parsed, real Azure OpenAI calls made and JSON-mode responses validated, real `gh pr create` flow executed, real PR opened.

**Evidence:**
- Workflow run `26047997638` on `chomovazuzana/NbgAiHub`, branch `main`, triggered via `workflow_dispatch`, completed in 2m46s with conclusion `success`.
- PR #1 (`News triage 2026-05-18`) opened automatically, branch `news-triage/2026-05-18-2604799`, with 43 relevant items across 4 of 5 feeds. Anthropic news contributed 0 items this run (either no new items or all judged irrelevant — per-feed-non-fatal contract working).
- All 4 Azure secrets and the "Allow GH Actions to create/approve PRs" repo toggle wired via `gh` CLI; SECRETS.md §3 first-time-setup checklist validated end-to-end.

**Implications going forward:**
- Daily cron `0 6 * * *` now runs autonomously; expect one PR per day with new items, or silent runs on quiet days.
- DoD #12 from the refined request is satisfied.
- Subsequent runs will only triage *new* items since 2026-05-18 (dedup walks `/news/incoming/` and `/news/published/`).

**Status:** accepted; operational.
