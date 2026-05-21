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

## 2026-05-18 — Astro 6 + Starlight 0.39 (supersedes earlier Astro 5.x assumption)

**Decision:** The web UI workstream uses **Astro `^6.x`** + **`@astrojs/starlight` `^0.39.x`**, not Astro 5.x as initially assumed in `docs/refined-requests/astro-starlight-site.md` A1/A2.

**Why:** Phase 3a investigation found that Astro 6 went stable on 2026-03-10 and Starlight 0.38 *dropped* Astro 5 support; Starlight 0.39 (released 2026-05-07) requires Astro 6. The earlier-assumed "Astro 5.x + latest Starlight" combo is mutually exclusive in mid-2026.

**Migration cost:** zero. The site workspace is greenfield — no Astro 5 code to migrate from. The supersession is purely a version pin update at scaffold time.

**Cross-references:**
- Original assumption file: `docs/refined-requests/astro-starlight-site.md` A1/A2 (now updated in place with strikethrough-and-redirect to this entry).
- Investigation: `docs/reference/investigation-astro-site.md` §1.
- DECISIONS.md entry that locked Starlight as the SSG: "Astro Starlight as static site generator" — that decision stands; only the version pin shifts.

**Status:** accepted.

---

## 2026-05-18 — RSS triage: source-aware prompt + editor_confidence field

**Decision:** Tighten the triage admission criteria in two ways:

1. **Source-aware system prompt.** The triage LLM now receives explicit per-source rules in addition to a single global persona. Each of the five seed feeds has its own ACCEPT/REJECT clauses:
   - **Anthropic news / Claude Code releases** — lean permissive; reject pure infra/billing patch notes and regional-only launches.
   - **Simon Willison** — accept Claude/Anthropic/MCP content and universally applicable LLM techniques; reject competitor-only deep dives and meta-blogging.
   - **Hacker News (Claude/Anthropic)** — judge the linked article, not the thread; explicitly reject "Claude" false positives (Claude Shannon, the French given name, unrelated products), Ask-HN/Show-HN/poll threads, and paywalled articles.
   - **r/ClaudeAI** — STRICT. Accept tips, tricks, prompts, workflow recipes, gotchas, and **field reports / war stories that teach a reusable lesson**. Reject questions, "look what I built" promo, complaints/rants, screenshots without prose, memes, polls, billing/account drama.

2. **Cross-cutting rules** apply to every source: English only; substance threshold (must be summarizable in two useful sentences); no retired-model content (Claude 2 / 3.0); **when in doubt, reject**.

3. **New `editor_confidence` JSON field.** The triage response now includes `editor_confidence: "high" | "medium" | "low"` alongside `relevant`, `audience`, `topics`, `summary`. This is the model's self-rated certainty in its own verdict and is propagated into both:
   - Item frontmatter (now 13 keys instead of 12)
   - PR body (each bullet shows `[confidence: <level>]` so reviewers can skim and concentrate attention on borderline items)

**Why:** PR #1's first operational run admitted 43 items — too permissive for the hub's "signal over coverage" framing. The original prompt was a one-liner ("relevant to bank colleagues learning Claude Code") with no reject criteria, no source differentiation, and no confidence signal. Tightening the prompt is the cheapest possible lever; adding source branches piggybacks on the existing `Feed:` line we already pass to the model; the confidence field gives the editor visibility into the model's own uncertainty without changing the binary admit/reject flow.

**Why field reports were kept in:** war stories ("here's what broke when I tried X in production") match the project's *"what I wish I knew a year ago"* tone better than clean recipe-style tips. Often the highest-signal posts on Reddit.

**r/ClaudeAI ACCEPT expanded (same day, 2026-05-18):** the initial r/ClaudeAI block allowed only two categories — tips/tricks and field reports. User flagged two real-world examples the rules would have wrongly rejected — *"Claude Code weekly limits are increasing 50%, now through July 13"* and *"Claude in an Enterprise Environment"*. The block now names **four** ACCEPT categories explicitly:
- **(a) Tips, tricks, prompts, workflow recipes** — concrete reproducible steps.
- **(b) Field reports / war stories** — documented failure modes with root cause and fix.
- **(c) Platform news** — factual reporting of operational changes (rate limits, pricing, new model availability, feature rollouts, deprecations, outage post-mortems). Reddit often surfaces these before the official blog, which is why the category is worth admitting despite the strict framing.
- **(d) Professional / enterprise use** — substantive case studies, governance / compliance / security discussions, at-scale deployment patterns, comparisons grounded in actual deployment experience. Especially load-bearing for the hub's audience — bank colleagues are literally in an enterprise environment.

The REJECT list was extended in the same edit to keep the categories tight: now also rejects vendor pitches disguised as discussion, generic LinkedIn-style thought leadership with no specifics, and pure speculation about how big-company-X uses Claude with no inside source. Scope of (c) and (d): r/ClaudeAI only; HN's "big news / major moves / breakthroughs" clause already covers platform news from the wider press angle, so duplicating it there would only add noise.

**Cost of the change:** ~30 lines of code across `triage.ts`, `frontmatter.ts`, `pr.ts`, `types.ts`. Test suite grows from 88 → 93 (5 new tests covering source-aware-prompt assertions, confidence preservation, and PR confidence markers). No production source restructuring; the JSON contract is the only ABI break, and it's an additive field.

**Alternatives considered:**
- Per-source prompt lookup via `rss-sources.json` schema (rejected: heavier — feeds are already named, the model can branch on the `Feed:` line for free).
- Post-LLM topic allowlist filtering (rejected: premature; let the prompt do the work, revisit if PR volume stays noisy).
- Skip the confidence field, rely on a tighter binary verdict (rejected by user: confidence buys cheap PR-review ergonomics).
- Recency cutoff at triage stage (rejected: already handled by feed pagination + dedup).

**Status:** accepted; implemented and tested 2026-05-18. Will be validated against the next daily run.

---

## 2026-05-18 — Reddit triage tightening round 2: generalizability, scannability, anti-promo

**Decision:** Significant tightening of the Reddit-group rules in `SYSTEM_PROMPT`, driven by user review of the 21 admits in PR #3. Twelve of those admits (≈57%) were judged borderline or wrong by the user. Encoding the rejection patterns as explicit prompt rules + anchored examples.

**Rule additions:**

1. **Field-report rule sharpened** — must be *generalizable to a DIFFERENT project*, must be *primarily instructive, not celebratory*. Smell test: strip out the author's specific project; does anything teachable remain? If no, reject. Resolves the "Claude Code helped me bring my dead passion project back to life" pattern.

2. **New cross-cutting rule (5): title scannability.** The TITLE alone must be self-describing to a bank colleague who doesn't follow r/ClaudeAI / r/ClaudeCode memes. Opaque titles ("I didn't think this was possible", "my code is play-dough", "playing with X"), inside-joke titles ("DystopiaBench / Claude is still the only one I'd trust with nuclear codes"), and teaser-style framing get rejected regardless of body substance. Reasoning: users scan a list — if they'd skip the title, the item has no surface area.

3. **Six new Reddit REJECT categories:**
   - Celebratory personal-project posts (passion projects, side hustles, hobby apps, "look what Claude did for MY thing")
   - Tool / extension / library / template announcements ("I built X", "introducing Y", "claudebox", "VS Code extension") — even when well-described; the post exists to promote
   - Personal setup / infrastructure stories ("I gave Claude access to MY vault / notes / server")
   - Cost-tracking / spending / "I saved $X" content — bank uses enterprise licensing, dollar-spend is not the audience's concern
   - Reddit subculture jargon ("vibe coders", "vibe coded", "low-effort coder", subreddit catchphrases) in titles or framing
   - Feedback-solicitation posts ("roast my X") — these are questions in disguise

4. **Explicit clarification kept ACCEPT:** capability-driven model-selection content (when to use Opus vs Sonnet vs Haiku for task-fit reasons) stays. Only *cost-driven* model-selection is out. The bank cares about correct usage, not optimization.

5. **Eleven anchored REJECT examples** baked into the prompt, drawn from actual PR #3 titles the user flagged: passion project, dog walks, dollar tracking, DystopiaBench, certification cheerleading, code-is-play-dough, VS Code extension promo, claudebox tool, Obsidian vault setup, "I didn't think this was possible", "playing with Jupyter playbooks".

**Why anchor examples in the prompt:** the model demonstrated in PRs #2 and #3 that abstract rules ("reject promo") were interpreted too narrowly. Naming real titles forces the model to pattern-match against concrete shapes, not its own loose interpretation.

**Prompt size impact:** ~30 lines added to SYSTEM_PROMPT (now ~95 lines, ~1700 tokens). Well within the model's effective system-prompt context; temperature=0 keeps it deterministic.

**Cost impact:** none — same number of items triaged, same model, same temperature.

**Status:** accepted; deployed in the same workflow_dispatch run that produces PR #4.

---

## 2026-05-18 — RSS cron pinned to 05:00 UTC (= 08:00 Europe/Athens DST)

**Decision:** Daily cron changed from `0 6 * * *` (06:00 UTC) to `0 5 * * *` (05:00 UTC). At today's date (2026-05-18, DST active in Athens, UTC+3) this lands at **08:00 Europe/Athens**. In winter (Athens UTC+2) it will land at 07:00 Athens.

**Why:** User asked for the PR to be ready at 8am their local time. GH Actions cron is UTC-only and does not follow DST — we pin one fixed UTC time and accept the one-hour drift between summer and winter. Picking summer-DST as the anchor was deliberate: the project is in active development now, so "feels right" matters more than the winter-correctness it would have if we picked the winter offset.

**Alternatives considered:**
- 8am UTC fixed (rejected: lands at 11am Athens summer — too late for "PR ready at start of day").
- Use a third-party scheduler that respects timezone (rejected: extra infra for a one-line cron change).
- Run twice (once for winter, once for summer with overlapping disabled) (rejected: over-engineered for a one-hour drift).

**Synced documents:** workflow YAML, CLAUDE.md repo-layout table, SCOPE.md "Editorial cadence" line, SECRETS.md cadence section, project-design.md ASCII diagram + YAML snippet, project-functions.md F1 description. Historical artifacts (refined-requests, phase plans, investigation, integration-verification, code-review, codebase-scans) deliberately left unchanged — they are point-in-time snapshots.

**Status:** accepted; deployed via the same commit as the feed-list pivot below.

---

## 2026-05-18 — RSS feed list pivot + source-group prompt + confidence tuning

**Decision:** Three coupled changes to the RSS pipeline, applied together:

1. **Feed list pivot — 5 → 5 feeds, but a different 5.** Final list:
   - **Reddit group:** r/ClaudeAI (kept), r/ClaudeCode (new)
   - **Major tech / AI news group:** Hacker News frontpage (now unfiltered — replaces the earlier `?q=Claude+OR+...` Claude-keyword variant), Wired AI tag feed, The Verge full firehose.
   - **Dropped:** Anthropic news (RSS feed deleted by Anthropic — returned 404 on the just-completed PR #2 run; no replacement URL discoverable). Claude Code GitHub releases (`releases.atom`). Simon Willison's blog.

2. **Source-group prompt structure.** The SYSTEM_PROMPT in `pipeline/src/triage.ts` no longer enumerates rules per individual feed name — it now enumerates rules per *group*, with member feeds listed in the group header. Two groups:
   - **Reddit group** — same four ACCEPT categories established on 2026-05-18 (tips/tricks, field reports, platform news, professional/enterprise use). Rules apply to both r/ClaudeAI and r/ClaudeCode.
   - **Major tech / AI news group** — new ACCEPT/REJECT criteria for *professional industry news and breakthrough AI developments*. ACCEPT: major model launches from any significant lab; capability breakthroughs (benchmarks, novel architectures, agentic milestones); strategic moves (large acquisitions, partnerships at scale, key personnel moves); regulatory/policy news with concrete industry impact; significant safety/security incidents; new developer-facing platforms from major AI labs. REJECT: consumer gadget reviews, smart-speaker stories, marketing fluff, opinion pieces, vague "AI will change everything" thought leadership, niche/regional news, small-seed startup funding stories, gaming/entertainment/automotive/crypto/political content using AI as keyword, articles where AI is a tangential paragraph, paywalled previews, "Claude" name false positives (Claude Shannon, French given name), pure Ask-HN/Show-HN/poll threads.

3. **Confidence-prompt tuning.** PR #2 returned all 24 admits as `confidence: high` — the prompt didn't give the model strong enough reasons to differentiate. Updated the `editor_confidence` field description to: *"RESERVE 'high' for verdicts where you would stake your reputation. Use 'medium' whenever you have ANY reservation. Use 'low' only when you are essentially guessing. When in doubt about confidence, go LOWER, not higher."* Goal: produce a useful spread across high/medium/low so the editor can focus PR review attention on borderline items.

**Why:**

- The Anthropic feed is a structural loss, not a fixable URL change. The other 4 feeds + HN frontpage will catch most major Anthropic announcements via repost.
- Replacing Claude-keyword-filtered HN with unfiltered HN frontpage shifts filtering responsibility from a string-match `?q=` URL parameter to the LLM. More expensive (more items triaged) but catches breakthroughs that don't mention "Claude" by name (e.g., a new OpenAI model, a major regulatory action, a major acquisition).
- Adding Wired AI and The Verge widens the breakthrough-news net beyond developer-centric sources. Bank colleagues read these too. The Verge firehose is noisy by design — the new REJECT list is built to filter the gadget/gaming/entertainment majority.
- Dropping Claude Code releases (`releases.atom`) and Simon Willison loses two high-signal sources. User direction was explicit ("take what i told u 2reddit + 3 sites"). Documented here so the trade is visible — easy to re-add either if signal loss is felt in subsequent runs.

**Alternatives considered:**
- Keep all old feeds + add the 3 new ones (rejected by user — wanted a clean cutover, not stacking).
- Replace HN firehose with an AI-tag-filtered Verge URL (rejected: user wanted full firehose, LLM filters).
- Drop the confidence field entirely now that it returned all "high" (rejected: tuning the prompt is cheaper than removing the field; if the tuning fails to spread the distribution, revisit later).

**Cost implication:** the Verge firehose + unfiltered HN frontpage will roughly double the daily item count vs. the prior run (66 items → expected ~120-180). Azure OpenAI cost per item ~$0.001 → daily run cost ~$0.10-0.20. Acceptable.

**Status:** accepted; deployed 2026-05-18. Will be validated against the next workflow_dispatch run (PR #3).

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

---

## 2026-05-18 — Astro Starlight site verified operational locally

**Decision:** The web UI workstream is acknowledged **OPERATIONAL (local dev)** following the first successful end-to-end build + serve on 2026-05-18. AC1–AC20 all MET per `docs/reference/integration-verification-astro-site.md`. Production hosting remains open in SCOPE.md.

**Why this entry exists:** Mirror of the RSS pipeline operational marker — distinguishes "site coded" from "site working." Phase 10 verifier produced a per-AC verdict table from build/check/audit output; the subsequent `npm run dev` smoke test confirmed live serving on `http://localhost:4321` with the homepage, sidebar (9 entries), audience filter, dark theme, and Pagefind search all working.

**Evidence:**
- `npx astro check` → 0 errors, 0 warnings, 4 cosmetic Zod-4 hints (deferred to a cosmetic refactor).
- `npm run build` → exit 0, 10 pages emitted to `dist/`, Pagefind index built.
- `npm audit --omit=dev` → 0 vulnerabilities.
- `npm run dev` → `HTTP 200 OK` on `localhost:4321`; `<h1>NbgAiHub</h1>` + tagline + CTAs rendered; sidebar entries Home/Start Here/Day 1/Week 1/News/Skills/Tips/Glossary/Reference/Contribute all served; expected empty-state warnings logged for empty `news/published/`, `skills/`, `tips/` (graceful fallback per F9).
- Astro v6.3.5 + Starlight v0.39.2 (per A1/A2 supersession).
- Bonus `ConfidenceChip.astro` component added beyond the design's 6 components — additive design refinement to surface the `editor_confidence` frontmatter field on news cards.

**Implications going forward:**
- The site rebuilds live whenever any markdown in `news/published/`, `skills/`, `tips/`, `glossary/`, `journeys/` changes (HMR caveat: cross-folder watching may not always fire — manual reload may be needed).
- 5 of 10 planned glossary terms seeded (claudemd, mcp, skill, plugin, agent).
- Day 1 journey page rendered with placeholder content; 6-step content TBD (separate scope item).
- Production hosting decision (Pro Pages vs Vercel/Netlify/Cloudflare vs defer) remains open in SCOPE.md.

**Status:** accepted; operational locally. Production deploy = follow-up workstream.


## 2026-05-19 — Hub plugin (plan-003) shipped

**Decision:** The `/hub` plugin is **OPERATIONAL** as of 2026-05-19. Eleven `/hub-*` commands (`/hub`, `/hub-search`, `/hub-skills`, `/hub-tips`, `/hub-news`, `/hub-glossary`, `/hub-onboard`, `/hub-install`, `/hub-audience`, `/hub-refresh`, `/hub-open`) ship in a sibling workspace at `plugin/` alongside `pipeline/` and `site/`. Marketplace manifest at repo-root `.claude-plugin/marketplace.json` points at `./plugin`; plugin manifest at `plugin/.claude-plugin/plugin.json`. Bundled content snapshot via `npm run build:snapshot`. Compiled entries via `npm run build` (esbuild ESM, `packages: "external"`).

**Why this entry exists:** Promotion-grade demo target ("hub installable in one command" per SCOPE.md demo checklist). Closes the third workstream after RSS pipeline and Astro site. Inside Claude Code, colleagues can now look up a glossary term, search the hub, browse curated news, or walk an onboarding journey without leaving their terminal.

**Architectural calls (resolved during Phase 3a investigation, not negotiable downstream):**

- **Manifest paths.** Plugin manifest at `plugin/.claude-plugin/plugin.json` (not `plugin/plugin.json` — Claude Code spec requires the `.claude-plugin/` subdir). Marketplace manifest at REPO-ROOT `.claude-plugin/marketplace.json` (not inside `plugin/`). `source: "./plugin"`.
- **Commands are filesystem-discovered.** No `commands` array in the manifest — Claude Code reads `plugin/commands/*.md`. Each markdown file is an LLM prompt that pre-executes a bundled Node script via `` !`node "${CLAUDE_PLUGIN_ROOT}/dist/<command>.mjs" $ARGUMENTS` ``. The script's stdout becomes the LLM's context.
- **Per-user state at `${CLAUDE_PLUGIN_DATA}/state.json`.** Falls back to `${XDG_DATA_HOME:-$HOME/.local/share}/claude-code/plugins/nbg-ai-hub/state.json` if env not set. State CANNOT live in the repo — multiple colleagues installing the plugin would clobber each other's audience prefs on every `/hub-refresh`.
- **Plugin config in repo.** `plugin/config.json` (shared) holds default URLs, search weights (title × 5 + topics × 3 + body × 1), snippet length (200), refresh cache path. Travels with the repo across org moves.
- **`/hub-open` defaults to localhost.** `devMode: true` until GH Pages production deploy. `/hub-open` probes `http://localhost:4321` first; instructs user to run `cd site && npm run dev` if dev server isn't up. Flip the flag in `config.json` post-deploy.
- **`/hub-refresh` via `git pull`.** Clones (first run) or `git pull --ff-only --depth 1` (subsequent) into `~/.cache/nbg-ai-hub/snapshot/`. Reuses the user's existing git auth — no separate token needed for the private repo. Atomic update via tmp-clone-then-rename.
- **TS-guard frontmatter validation (not Zod).** Keeps the esbuild bundle small and avoids a runtime dep duplication with the site. The pipeline + site own canonical schema authority; the plugin's validators are 1:1 mirrors that throw `FrontmatterInvalidError` on mismatch.
- **Search: pure TS, no library.** Title × 5 + topics × 3 + body × 1, case-insensitive substring, 200-char snippets centered on first match, ties broken by sourcePath. Upgradeable later if newcomers ask for semantic search.

**Evidence:**

- `cd plugin && npm install` → 210 packages, 0 vulnerabilities.
- `npm test` → **130/130 tests pass** across 13 test files (manifest, errors, snapshot, url-builder, config, state, frontmatter, search, audience, journeys, output, content, plus an end-to-end suite that spawns each compiled `dist/<cmd>.mjs` against the real snapshot).
- `npm run typecheck` → 0 errors.
- `npm run lint` → 0 errors, 0 warnings.
- `npm run build` → 11 bundled entries in `dist/*.mjs` (esbuild ESM, externalized deps).
- `npm run build:snapshot` → bundled 5 glossary + 0 tips + 0 skills + 1 journey + 8 news items into `plugin/snapshot/` with `.snapshot-meta.json`.
- End-to-end smoke against the real snapshot: `/hub` shows the 5-pillar menu with correct counts; `/hub-glossary plugin` returns the definition; `/hub-search claude` returns 13 ranked matches; `/hub-audience advanced` persists to state.json; `/hub-open glossary mcp` resolves to `http://localhost:4321/glossary#mcp`.

**Implications going forward:**

- The hub now has three operational workstreams (pipeline, site, plugin). Promotion demo target met: hub installable from a fresh Claude Code install in one command.
- When new tips/skills land in the repo, `npm run build:snapshot && npm run build` rebuilds the bundled snapshot. The intended release flow: a future GH Action that auto-bumps plugin version on content regeneration.
- `tips/` and `skills/` directories ship empty in this build (per current SCOPE.md). Plugin handles empty pillars gracefully — `/hub-skills` returns "no matching skills" rather than throwing.
- Day-1 journey content is still placeholder; `/hub-onboard day-1` surfaces "[content in progress]" honestly per A20.
- `devMode: true` in `plugin/config.json` remains until GH Pages production deploy. Flip with a one-line edit at deploy time; no plugin republish required if config is read at runtime (current behavior).

**Open follow-ups** (registered in `Issues - Pending Items.md`):
- OQ4: by-role journey slug spellings (`backend`, `data-scientist`, `ml-engineer`) — confirm before authoring content.
- OQ5: confirm Claude Code marketplace install flow against current spec when publishing.
- OQ6: surface `editor_confidence` in `/hub-news` output → DONE (already shipped as `[confidence: high|medium|low]` marker per spec).

**Status:** accepted; operational. Plugin codebase + manifests + snapshot tooling complete.

---

## 2026-05-19 — Personalization + community contributions: PAT-scoped gist + URL-redirect submissions

**Status:** accepted

**Context:** A brainstorm/refine session converged on adding per-user favourites + a marketplace contribution form, both leveraging GitHub as the backend (no servers, no proxies). The original design — favourites synced via OAuth Device Flow + a `gist`-scoped token, submissions via browser-side fork/branch/PR API choreography — hit a hard CORS wall (the investigator's R1 finding: GitHub's OAuth handshake endpoints `github.com/login/device/code` and `/login/oauth/access_token` do not send `Access-Control-Allow-Origin` headers, so a static site cannot complete Device Flow from the browser). The two viable fixes were (a) introduce a Cloudflare Worker proxy or (b) drop OAuth entirely and pivot to a PAT-paste UX for favourites + URL-redirect for submissions. The user picked (b) to keep the project zero-infrastructure.

**Decision:** Use a classic Personal Access Token (PAT) with **`gist` scope only**, pasted into a sign-in modal, for the favourites feature. Favourites are synced via the user's unlisted GitHub gist `nbgaihub-favorites.json` (one file, wrapped JSON shape `{schema_version: 1, favourites: [{type, slug, pinned_at}]}`, read-modify-write protocol with last-write-wins). For skill submissions, use a **GitHub `new file` URL redirect** (`github.com/<owner>/<repo>/new/main/skills?filename=&value=`), not browser-side write APIs — GitHub's own UI handles the fork/branch/PR flow; a CI validator catches malformed entries at PR time.

**Rationale:**
- The original Device Flow + OAuth App design was blocked by R1 (CORS).
- The recommended fix (Cloudflare Worker proxy) was rejected to keep the project zero-deployable-infrastructure. Adding a worker would have been a permanent operational tax for the team.
- PAT-paste reuses GitHub's existing token UI — every user already has a `Settings → Developer settings → Personal access tokens` page they know how to use. The `gist` scope is **narrower** than the OAuth App's `repo` scope; the blast radius of a compromised PAT is "the user's own gists" rather than "everything in every repo they can write to".
- The gists API supports CORS for browser writes (verified in investigation R3).
- The gist is **unlisted, not private** — anyone with the 32-char hex URL can read it, but the URL is never shared and is practically unguessable. The privacy callout in the gist contract is explicit so users understand this isn't auth-protected storage.
- URL-redirect submissions remove an entire class of API-call failure modes (no auth needed; no fork-then-branch-then-PR API sequence to choreograph in the browser); GitHub's web UI gives a much better author UX than any browser-side implementation would.
- The CI validator catches malformed entries deterministically at PR time — same 17 rules run on the client during form fill, so authors see most errors before submitting.

**Reverses:**
- SCOPE.md "Per-user personalization or bookmarking" — was in "Out of scope — NO", now in MVP-IN.
- SCOPE.md "Community contributions (PRs from outside the team)" — was in "Deferred — LATER", now in MVP-IN.

**Alternatives considered:**
- **OAuth App + Cloudflare Worker proxy** — REJECTED. The worker would terminate the OAuth handshake server-side and re-emit a token to the browser. Technically clean; operationally a permanent piece of infrastructure the team would have to own and rotate keys for. Killed on the "zero deployable infrastructure" promise.
- **User-pasted PAT + local-only favourites (no sync)** — REJECTED. Loses cross-device sync entirely; breaks symmetry with the future Claude-side `/hub-*` skill, which is the whole point of having a stored data contract.
- **Browser-side write APIs for submissions** (`POST /repos/.../forks` + `POST /repos/.../git/refs` + `PUT /repos/.../contents/...` + `POST /repos/.../pulls`) — REJECTED. Would have required the `repo` scope on the PAT (much broader than `gist`); fragile against API rate limits; gives a worse author experience than GitHub's own new-file UI; complicates the failure modes (partial submissions, orphan branches).

**Privacy posture (documented verbatim in the gist contract):**
> Your pins live in an unlisted gist on your own GitHub account — unlisted means anyone with the URL can read it, but the URL is a 32-char hex id and is never shared by NbgAiHub. The site uses your `gist`-scoped token only to read/write that one file. NbgAiHub does not see or store your pins. To fully revoke access, delete the token at github.com/settings/tokens.

The gist is owned by the user, not the project. If the user leaves the org, their pins vanish with them. No aggregation. No team-wide stats. (Opt-in aggregation is parked as a low-priority follow-up in `Issues - Pending Items.md`.)

**References:**
- `docs/reference/investigation-personalization.md` — R1 (CORS) + Topic 2 (unlisted vs private) + the Option C historical section.
- `docs/refined-requests/personalization-and-contributions.md` — refined request reflecting Option C end-to-end.
- `docs/design/plan-003-personalization-and-contributions.md` — 23-step plan executed across waves A–E.
- `docs/design/project-design.md §P` — interface contracts, data models, error classes.
- `docs/reference/gist-contract.md` — wire format shared with the future Claude-side `/hub-*` skill.

**Implementation evidence:** commits `c1df291` (Wave A — foundations), `5a08260` (Wave B — core libs incl. `auth.ts`, `gist.ts`, `submission.ts`, validator), `64f83b2` (Wave C — UI: `SignIn.astro`, `PinButton.astro`, `/my-pins/`, `/submit-skill/`, CI workflow). Site 127 tests; pipeline 112 tests (was 93). Anonymous browsing parity verified.

---

## 2026-05-19 — Auto-promotion of high-confidence professional-source news items

**Status:** accepted

**Decision:** Variant C — when a triaged item satisfies BOTH (a) `triage.editor_confidence === "high"` AND (b) the originating feed is marked `auto_promote_eligible: true` in `config/rss-sources.json`, the orchestrator writes it directly to `news/published/` and the workflow commits it to `main` without opening an editorial PR. Every other item still routes to `news/incoming/` and is promoted only after human review.

Per-feed eligibility (initial pin):
- `r/ClaudeAI` → `false`
- `r/ClaudeCode` → `false`
- `Hacker News frontpage` → `true`
- `Wired AI` → `true`
- `The Verge` → `true`

The pipeline now emits four step outputs on `$GITHUB_OUTPUT`: `new_items`, `auto_promote_count`, `review_count`, `mode` (`"auto_only" | "mixed" | "review_only" | "empty"`). The workflow has three conditional branches:
- `mode == 'auto_only'` — `git add news/published && git commit && git push origin main` (no PR).
- `mode == 'mixed' || mode == 'review_only'` — branch + `git add news/incoming news/published` + `gh pr create` with the standard PR body. The body now has two top-level sections, "Auto-promoted (n=N)" and "For review (n=M)", each only rendered when non-empty.
- `mode == 'empty'` — no-op.

**Rationale:** PR #5 surfaced that ~half the editorial-review effort goes into rubber-stamping items where both the triage model and the source had already done the work. Reddit + medium/low confidence items are the genuine judgment calls — those still earn human attention. Auto-promote on the easy-win items shrinks reviewer load without removing the human gate where it matters. Cost of the policy: roughly the next-day's PR shrinks to whatever Reddit + medium/low items remain; auto-promoted items become part of the publish stream immediately, eligible for the site's `glob` loader on the next build.

**Reverses:** nothing. SCOPE.md "Curated RSS, not auto-aggregated" still holds — variant C is *not* unconditional auto-promote; it's auto-promote under a conjunction of structural signals (confidence + source class), each individually documented in the prompt + the config.

**Alternatives considered:**
- **Unconditional auto-promote** (rejected — loses the editorial gate entirely; would surface Reddit field-reports unreviewed).
- **Confidence-only auto-promote** (rejected — model rates Reddit posts "high" plenty often; Reddit posts need a second pair of eyes).
- **Source-only auto-promote** (rejected — even professional sources yield off-topic items the model itself flags as low/medium confidence; those should still go through review).
- **Approval-bot auto-merge of the editorial PR** (rejected — same outcome as auto-promote but doubles the GH-Actions cost and adds a PR-bot to the audit trail with no benefit over committing direct to `main`).

**Implementation evidence:** new module `pipeline/src/auto-promote.ts` + `pipeline/tests/auto-promote.test.ts`; `FeedSource.auto_promote_eligible: boolean` is now a required field with no fallback; `config/rss-sources.json` updated with the per-feed flag; `writeNewsItem` takes a `destination: "incoming" | "published"` parameter; `buildPrBody` takes separate `autoPromoted` and `reviewNeeded` arrays; `.github/workflows/rss-triage.yml` has three conditional steps branching on `mode`. Pipeline tests grow 112 → 124. Build + lint + tests green.

## 2026-05-19 — Unconditional auto-promote (reverses variant C from earlier today)

**Status:** accepted
**Context:** Variant C (added earlier 2026-05-19) gated auto-promote on `editor_confidence: high` AND `auto_promote_eligible: true`. After a single production run, the editor reviewed the resulting PR #6 and decided the gate was overkill — Reddit-sourced items are typically duplicates of HN posts (and the cross-feed title dedup added later in the day catches those) and the cost of letting an occasional off-topic Reddit drama through is small compared to the standing operational cost of having to merge a PR every day.
**Decision:** Drop the `editor_confidence` half of the gate entirely. Flip all feeds to `auto_promote_eligible: true` in `config/rss-sources.json`. Every relevant triaged item now writes directly to `news/published/`; the workflow's `auto_only` branch pushes straight to `main` with no PR. The `auto_promote_eligible` field is retained as a per-feed kill switch so an operator can reintroduce gating on a specific feed by flipping `true → false` without code change.
**Rationale:**
- After deploying variant C, the only items that auto-promoted in test runs were 0 — the Reddit feeds (most of the daily firehose) were all gated, and HN/Wired/Verge happened to produce only medium-confidence items in the sample window.
- Cross-feed title dedup (added earlier in the day in the same conversation thread) is now the load-bearing quality control. If it misses a cross-post, the worst-case is a single near-duplicate on the live site — quickly fixable with a follow-up commit.
- Daily-PR-review friction was identified as a higher product cost than a few "noisy" published items per week.
**Reverses:** The earlier 2026-05-19 entry titled *"Auto-promotion of high-confidence professional-source news items"*. The infrastructure for that variant (per-feed eligibility flag, three-mode workflow branching, PR body splitting) stays in place — only the policy values changed.
**Alternatives considered:**
- Keep variant C and tighten the cross-feed dedup further (rejected — adds complexity to avoid an editorial cost the operator has decided to absorb).
- Confidence-only gate without the feed dimension (rejected — operator wants zero gate, not a narrower one).
**Implementation evidence:** `pipeline/src/auto-promote.ts` lost the `editor_confidence !== "high"` short-circuit; `config/rss-sources.json` Reddit entries flipped to `auto_promote_eligible: true`; orchestrator + config tests adjusted (the "mixed mode" test rewritten as "unconditional auto-promote" coverage). 145 tests still pass.

## 2026-05-19 — Rolling 7-day retention for news/published/

**Status:** accepted
**Context:** With unconditional auto-promote shipping every relevant item straight to `news/published/`, the site accrues stale news indefinitely. Operator wants a one-week window — older items disappear automatically.
**Decision:** Each daily pipeline run prunes any `news/published/<YYYY-MM-DD>-*.md` whose date prefix is strictly older than `today - 7 days` (UTC). Pruning happens in-process via a new module `pipeline/src/retention.ts` and lands in the same commit as the day's new items. The workflow gates the commit on a new `had_changes` step output (true if new items OR pruning occurred).
**Rationale:**
- Bounded site size + freshness — the "news" pillar is by nature ephemeral; old items obsolete fast.
- Same commit semantics — one commit per day with both adds and deletions makes the diff legible and rollback trivial.
- No-fallback rule respected: retention window is a hardcoded `RETENTION_DAYS = 7` constant, not a config value silently defaulted. To change the policy, edit the constant (or surface it as config later).
**Reverses:** nothing.
**Alternatives considered:**
- Separate daily cleanup workflow (rejected — doubles commits, splits a single semantic operation).
- Bash `find -mtime +7 -delete` in the YAML (rejected — operates on mtime not filename date; brittle).
- Date-tag everything and let the site filter at render time (rejected — files keep accumulating, repo bloats; site builds slower over time).
- Configurable retention via a new config file or env var (deferred — YAGNI; revisit if the policy gets renegotiated).
**Implementation evidence:** `pipeline/src/retention.ts` (parseFileDate, isStale, findStalePublished, pruneStalePublished); `pipeline/src/index.ts` calls pruning after the write loop and emits `pruned_count` + `had_changes` step outputs; `.github/workflows/rss-triage.yml` direct-push branch fires on `had_changes == true` (was `mode == auto_only`), and the commit message includes both counts ("N auto-promoted, P pruned"); `pipeline/tests/retention.test.ts` with 16 tests. Pipeline tests grow 145 → 161.

---

## 2026-05-19 — UI redesign: Option 1 hybrid + Linear/Vercel/Stripe aesthetic + portability hedge for Option 2

**Decision:** Keep Starlight as the framework; deeply theme it via a three-tier CSS custom-property token system; build bespoke layouts for the 11 marketing surfaces using Starlight's `splash` template wrapped in a single `MarketingShell.astro`; deep theme override for MDX content detail pages via `--sl-color-*` token aliases that Starlight already pipes through to Pagefind. Aesthetic anchor: **Linear / Vercel / Stripe** — Apple-influenced restraint, dark-mode-first, monospace accents, expressive typography, subtle gradients, scroll-driven motion. Portability hedge: 16 primitives under `site/src/components/primitives/` are Starlight-free (verified by `grep -r '@astrojs/starlight' site/src/components/primitives/` returning zero hits) so an escalation to Option 2 (replace Starlight entirely) only needs to rebuild `MarketingShell.astro`, not the design system underneath.

**Alternatives considered:**
- **Option 2 — replace Starlight with custom Astro pages.** Rejected as first attempt because (a) larger blast radius on iteration, (b) loss of free upstream Starlight upgrades (sidebar, search, dark-mode, a11y, MDX), (c) Option 1's bespoke marketing surfaces under splash-template + deep theme on content pages was judged to satisfy the brief at meaningfully lower cost. Escalation gate after Phase 6 (user evaluation at localhost:4321) — Option 2 remains live if Option 1's output isn't satisfying.
- **Pure CSS theming, no bespoke layouts.** Rejected because the homepage and pillar landings need full-bleed editorial layouts that Starlight's default doc grid resists.
- **Adopt a utility framework (Tailwind / UnoCSS).** Rejected — pure CSS custom properties + Cascade Layers covers the design ceiling without adding a build dependency. See investigation-ui-redesign.md Axis 1.
- **Add a motion library (`motion` / `gsap`).** Rejected — CSS transitions + native `IntersectionObserver` (~50 LOC) deliver the Linear/Vercel-style motion ceiling. See investigation-ui-redesign.md Axis 3.
- **Direct `@fontsource-variable/*` imports.** Rejected in favor of Astro's stable Fonts API (`fontProviders.fontsource()`) — same payload, ~80 fewer lines of boilerplate, free metric-adjusted fallbacks. See docs/research/astro-fonts-api-experimental-stability.md.

**Inputs:**
- docs/refined-requests/ui-redesign.md (39 ACs, 18 assumptions, 14-item DoD)
- docs/reference/investigation-ui-redesign.md (10 execution axes)
- docs/research/astro-fonts-api-experimental-stability.md
- docs/research/pagefind-ui-variant-in-starlight-0-39.md
- docs/design/plan-004-ui-redesign.md
- docs/design/project-design.md §S.13 (the design contract)
- docs/reference/code-review-ui-redesign.md (READY verdict, 3 minor fixes during review)
- docs/reference/integration-verification-ui-redesign.md (39/39 ACs MET, 14/14 DoD met, 174/174 tests, 28 pages built, 0 errors)

**Cost / outcome:**
- 1 new file in `docs/refined-requests/`, 1 new plan, 2 research docs, 1 codebase scan, 1 investigation, 3 test-build reports, 1 code-review report, 1 dependency-validation report, 1 integration-verification report — all under `docs/`.
- 47 site files changed (22 modified, 22+ new, 1 deleted).
- 0 new npm dependencies. 0 deprecations. 0 vulnerabilities.
- Test floor 127 → 174 (zero regressions; only additions).
- Bundle: ~143 KB CSS, ~393 KB woff2.

**Portability evidence (so an escalation to Option 2 isn't wasted work):**
- `grep -r '@astrojs/starlight' site/src/components/primitives/` → zero hits.
- `MarketingShell.astro` is the only file in `site/src/components/` that imports Starlight (the `StarlightPage` outer wrapping the splash template).
- Token system, primitive components, motion utility, content-prose/chrome stylesheets are all Starlight-agnostic in their internals.

---

## 2026-05-19 — Unified header via Starlight `Header` override (supersedes 2026-05-14 §S.13.14.3)

**Decision:** Reverse the 2026-05-14 "Header override rejected as fragile" call. Override Starlight's `Header` component with `site/src/components/SplashAwareHeader.astro`. The override reads `Astro.locals.starlightRoute.entry.data.template`. On `'splash'` (every marketing surface) it renders **one** unified `<nav class="nbg-topnav">` containing brand + section links + Pagefind `<Search />` trigger + `<AuthControls />` (Sign in XOR signed-in chip) + `<ThemeSelect />` + mobile drawer + `<SignInModal />` mount. On non-splash (content-detail) pages it renders the default Starlight Header markup verbatim, keeping `SocialIconsOverride` slotted in.

**Why:** Before this change, MarketingShell rendered its own `nbg-topnav` INSIDE Starlight's content slot. Starlight's chrome header still rendered on top. Result on every marketing page: two stacked navigation bars, with "NbgAiHub" appearing twice, the section links visually disconnected from the search/auth/theme controls, and an auth-state CSS bug (see next entry) showing Sign in + user chip simultaneously. The user flagged this directly: *"the main navi on top as a top pane and then we have additional navi as breadcrumbs ... NBG AI Hub repeated"*. A single coherent header is what Linear/Vercel/Stripe do and is the right target for the redesign's aesthetic anchor.

**Why the 2026-05-14 rejection no longer applies:** the override is *narrow* — one conditional branch, one DOM tree, no behavioral wrappers around Starlight components. It reuses Starlight's own `Search` and `ThemeSelect` via `virtual:starlight/components/*` imports, so Starlight upgrades only break this file if those components' public surface changes (rare and noisy when it does). The fragility cost is real but small; the visual cost of two stacked navs is large.

**Alternatives considered:**
- **Quick CSS fix — drop the brand block from MarketingShell's nav** (rejected: two bars remain, just less visually duplicated).
- **CSS `html:not([data-has-sidebar]) .header { display: none }`** (rejected: indirect, leaves dead DOM, doesn't solve where the section links live).
- **Keep MarketingShell's nav and accept double chrome** (rejected: that's the bug we're fixing).

**Implementation footprint:**
- New: `site/src/components/SplashAwareHeader.astro` (~430 LOC — splash branch + non-splash branch + drawer JS + default-chrome CSS copy + unified-nav CSS).
- New: `site/src/components/AuthControls.astro` (~225 LOC — extracted from SocialIconsOverride; ships with the `[hidden]` CSS fix).
- New: `site/src/env.d.ts` — ambient declarations for five `virtual:starlight/components/*` modules.
- Changed: `site/src/components/MarketingShell.astro` — stripped of its inline `nbg-topnav` markup (was ~430 LOC, now ~145 LOC).
- Changed: `site/src/components/SocialIconsOverride.astro` — reduced to a thin `<AuthControls /> + <SignInModal />` wrapper that short-circuits on splash pages.
- Changed: `site/astro.config.mjs` — added `Header: './src/components/SplashAwareHeader.astro'` override.
- Design contract: §S.13.6 updated; new §S.13.6.1 (unified header) and §S.13.6.2 (auth CSS fix) added in `docs/design/project-design.md`.
- Tests: build-output.test.ts gained 41 assertions (4 per marketing page × 10 surfaces + 1 CSS-rule presence check). 215/215 passing.

**Status:** accepted; in-session implementation 2026-05-19. User verification at localhost:4321 is the final gate.

---

## 2026-05-19 — Auth-state mutual exclusion CSS rule (paired with unified header)

**Decision:** Add a paired CSS rule that forces `[hidden]` to actually hide `.nbg-auth__signin` and `.nbg-auth__chip` when their JS-driven `hidden` attribute is set:

```css
.nbg-auth__signin[hidden],
.nbg-auth__chip[hidden] {
  display: none !important;
}
```

**Why:** Both variants render in the DOM at SSR time; a small client script flips `element.hidden` based on `auth.readToken()` to pick the active one. But the author CSS for both classes was `display: inline-flex`, same specificity as `[hidden]` and later in source order, so author CSS won and the UA's `[hidden] { display: none }` default never fired. Result on every page after a sign-in: both the "Sign in" button AND the "@chomovazuzana | Sign out" chip rendered visible at the same time. User flagged this in the same session as the unified-header issue.

**Where the rule lives:** inside `AuthControls.astro`'s `<style>` block, at `@layer nbg.components`. Build-output test asserts the compiled CSS contains the rule (allowing for Astro's `:where(.astro-XXX)` scope-class wrapping and lightningCSS minification).

**Status:** accepted; verified via test.

---

## 2026-05-21 — Reddit feeds switch to JSON endpoint + engagement floor + later cron

**Decision:** Three coupled changes to the RSS pipeline, scoped to Reddit feeds only:

1. **Endpoint switch.** `r/ClaudeAI` and `r/ClaudeCode` move from `https://www.reddit.com/r/<sub>/.rss` to `https://www.reddit.com/r/<sub>/new.json?limit=25`. HN / Wired / Verge stay on their existing RSS / Atom URLs.
2. **Engagement pre-filter** for `reddit-json` feeds, applied AFTER parse and BEFORE dedup/triage:
   - drop `stickied === true`
   - require `score >= 50`
   - require `num_comments >= 10`
   Both score AND comment floors must clear (AND, not OR). Items below either floor are logged and dropped before any Azure call.
3. **Cron shift.** `.github/workflows/rss-triage.yml` cron from `0 5 * * *` (05:00 UTC = 08:00 Athens DST) to `0 22 * * *` (22:00 UTC = 00:00 Athens winter / 01:00 Athens DST).

**Why:**

- *Atom has no engagement signal.* Reddit's `.rss` carries title / link / body / dates only — no `score`, `num_comments`, `upvote_ratio`, or `stickied` flag. The JSON endpoint exposes all four. There is no way to filter by community engagement without leaving RSS.
- *"Too much Reddit noise per run"* — observed by user 2026-05-21. The community filter (upvotes + replies) is doing free work for us; the LLM triage was carrying load it shouldn't have to. Sampling live feeds at decision time, both subreddits' 25-item windows averaged ~1 surviving post each under (score>=50 AND comments>=10) — a deliberately tight floor.
- *Stickies leak forever.* Reddit pins old posts (e.g. r/ClaudeCode's "Community Feedback" pinned 2025-10-24 was still appearing in the feed at 2026-05-21). Once such a post falls off the 7-day retention window in `news/published/`, our dedup would re-ingest it on the next run. The sticky filter kills this class of leakage at fetch time.
- *Both floors required, not just score.* Score alone catches viral noise; comments alone catch high-engagement announcements without substance. Together they isolate the field-report / discussion pattern the hub wants (substantive + community-validated).
- *Cron shift gives previous-day posts time to ripen.* The strict thresholds favor posts that have accumulated engagement. At 05:00 UTC, most posts in the 25-item window were <12h old and hadn't crossed the floor yet. At 22:00 UTC (Athens midnight wintertime), posts from the previous afternoon/evening have had ~8–12h to accumulate, dramatically increasing the survivor rate without loosening the floor.

**Alternatives considered:**

- *`/top.json?t=day` endpoint* — Reddit pre-sorts by score. Simpler in code, but loses visibility into posts that land late in the day. Rejected: we want our own thresholds, not Reddit's ranking.
- *Score floor only (no comment floor)* — too permissive; lets through high-upvote announcement posts that don't spark discussion. The hub values discussion-grade content.
- *Per-feed volume cap (top N items per Reddit feed)* — orthogonal to engagement; would mask the underlying signal. Rejected per "trust thresholds, no cap" decision.
- *48h age guard* — belt-and-braces against stale leakage. Made redundant by the explicit `stickied === false` check + the fact that `/new.json` is sorted by recency; all non-sticky items are <24h old by definition.
- *Layer engagement onto auto-promote.ts* — would double-gate (engagement → triage → engagement). Rejected: thresholds gate ingestion, triage gates quality, auto-promote gates publishing — three different jobs, three different gates.
- *Hardcoded thresholds vs. per-feed config* — chose hardcoded constants (`REDDIT_MIN_SCORE`, `REDDIT_MIN_COMMENTS` in `pipeline/src/reddit-filter.ts`) over a `reddit_thresholds` config block. Uniform policy across both subs, minimal config surface, trivially liftable to config later if per-sub tuning becomes useful.

**Where the code lives:**

- New: `pipeline/src/parse-reddit.ts` (~90 LOC — JSON listing → `FeedItem[]` with `reddit.{score, num_comments, stickied}` populated).
- New: `pipeline/src/reddit-filter.ts` (~60 LOC — `applyRedditEngagementFilter(items)` + exported `REDDIT_MIN_SCORE = 50`, `REDDIT_MIN_COMMENTS = 10` constants).
- Changed: `pipeline/src/types.ts` — `FeedSource` gains required `type: "rss" | "reddit-json"` (no fallback per global rule); `FeedItem` gains optional `reddit` block.
- Changed: `pipeline/src/config.ts` — validates `type`; rejects missing / unknown values with `ConfigSchemaError`.
- Changed: `pipeline/src/index.ts` — branches on `feed.type` during parse; applies engagement filter per Reddit feed; logs `reddit_engagement_filtered` with `keptCount` / `droppedByReason` so editorial drift is visible in workflow logs.
- Changed: `config/rss-sources.json` — switched 2 Reddit URLs to `/new.json?limit=25`; added `type` to all 5 entries.
- Changed: `.github/workflows/rss-triage.yml` — cron `0 5 * * *` → `0 22 * * *`.
- Tests: new `parse-reddit.test.ts` (11 tests) + `reddit-filter.test.ts` (11 tests) + `reddit-new.json` fixture; updated existing config / orchestrator / auto-promote tests for the new required `type` field. 187/187 passing.

**Status:** accepted; in-session implementation 2026-05-21. Operational effect (Reddit volume drop, sticky leakage gone) visible from the first cron run at 22:00 UTC tonight.

---

## 2026-05-21 — Reddit access via Application-Only OAuth (supersedes JSON-endpoint detail above)

**Decision:** Pull Reddit feeds through Reddit's Application-Only OAuth flow against `https://oauth.reddit.com/r/<sub>/new?limit=25` instead of the public `www.reddit.com` / `old.reddit.com` JSON endpoints.

**Why:** Empirical — when the engagement-floor work landed on `main` and was dispatched via `gh workflow run`, both Reddit JSON endpoints returned **403 Forbidden** from the GitHub Actions runner. The same URLs returned 200 from a residential IP with the same `User-Agent`. Tested in this order on the runner:

1. `https://www.reddit.com/r/<sub>/new.json?limit=25` — 403
2. Same URL with descriptive `User-Agent: NbgAiHub-RSS-Pipeline/1.0 (+...)` — 403
3. `https://old.reddit.com/r/<sub>/new.json?limit=25` with the same UA — 403

All three failed identically. The block is IP-based, applied by Reddit to unauthenticated JSON access from cloud ranges. `.rss` endpoints (the prior pipeline) had been working from the same runners — Reddit applies a tighter rule to JSON because it's effectively their public API.

The pre-flagged "long-term fix" in `SECRETS.md §5` was exactly this scenario. We're now implementing it.

**The OAuth flow we use:**

1. Once per pipeline run, POST to `https://www.reddit.com/api/v1/access_token`:
   - `Authorization: Basic base64(client_id:client_secret)`
   - `User-Agent: NbgAiHub-RSS-Pipeline/1.0 (+https://github.com/chomovazuzana/NbgAiHub)`
   - Body: `grant_type=client_credentials`
2. Reddit returns `{ access_token, expires_in: 86400, token_type: "bearer", scope: "*" }`. Token lives ~24h; we don't cache across runs because the daily cron is well under that lifetime.
3. Subsequent feed fetches: `https://oauth.reddit.com/r/<sub>/new?limit=25` with `Authorization: Bearer <token>` (note: no `.json` suffix on the `oauth.` subdomain).

Application-Only OAuth (the `client_credentials` grant) gives us a read-only token with no user context — sufficient for pulling public subreddit listings, no impersonation risk, no user-account secrets in the codebase.

**Alternatives considered:**

- *`grant_type=password` (user-impersonation script app)* — would have required adding the Reddit user's username + password as secrets. Rejected: bigger blast radius if leaked, no functional advantage for read-only public-listing pulls.
- *Revert Reddit to `.rss` + drop engagement filter* — would have worked immediately (RSS still passes through GH Actions) but lost everything from the earlier 2026-05-21 entry (engagement floor, sticky drop). Rejected as Option B in the user-facing decision flow.
- *Disable Reddit feeds entirely* — clean cut but loses the field-reports content stream. Rejected as Option C.
- *Third-party proxy (r.jina.ai / scrape APIs)* — adds external dependency + reliability risk + cost. Rejected as Option D.

**Where the code lives:**

- New: `pipeline/src/reddit-auth.ts` (~90 LOC) — `getRedditAccessToken(clientId, clientSecret, fetchImpl)` returning `{ accessToken, expiresInSec }`. Throws `RedditAuthError` on 401 / 5xx / network / malformed payload.
- Changed: `pipeline/src/env.ts` — new `readRedditCreds(env)` (~25 LOC). Conditionally required: orchestrator calls it only when an enabled feed has `type: "reddit-json"`. Per project no-fallback rule; `MissingEnvVarError` on the first missing value.
- Changed: `pipeline/src/fetch.ts` — `fetchFeedXml` accepts optional `authToken`; attaches `Authorization: Bearer <token>` when present. UA header stays.
- Changed: `pipeline/src/index.ts` — before the parallel fetch, gate on `enabled.some(f => f.type === "reddit-json")`; if so, acquire token, log `reddit_auth_ok` / `reddit_auth_failed`. Pass `authToken` per Reddit feed during the `Promise.allSettled` mapper. Auth failures are logged as `::warning::` and Reddit feeds fail-soft per AC6 — HN/Wired/Verge still succeed.
- Changed: `config/rss-sources.json` — Reddit URLs from `https://old.reddit.com/r/<sub>/new.json?limit=25` → `https://oauth.reddit.com/r/<sub>/new?limit=25`.
- Changed: `.github/workflows/rss-triage.yml` — `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` added to the pipeline step's `env:` block.
- Changed: `SECRETS.md` — new §1 entries for both secrets including the Reddit-app-creation walkthrough; §5 weak-spot note replaced with the now-implemented architecture; §3 first-time-setup checklist gained two lines.
- Tests: new `reddit-auth.test.ts` (12 tests covering happy path, 401, 5xx, network, malformed JSON, missing fields, empty creds, Basic-auth construction, grant_type body, UA, canonical URL). `env.test.ts` gained 4 `readRedditCreds` tests. Pipeline 188 → 205 passing.

**One-time operator action required:** create a script-type app at <https://www.reddit.com/prefs/apps> and add `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` as GitHub Actions secrets. See `SECRETS.md §1` for the field-by-field walkthrough. Without these, the orchestrator logs the auth failure and Reddit feeds fail-soft — HN / Wired / Verge keep working.

**Status:** accepted; in-session implementation 2026-05-21. Verification gated on operator completing the one-time Reddit-app setup; once secrets are in place, `gh workflow run rss-triage.yml --ref main` should produce 200s from `oauth.reddit.com` and items begin landing in `news/published/` again.

---

## 2026-05-21 — Reddit OAuth path parked; reverting Reddit feeds to `.rss`

**Decision:** Flip `config/rss-sources.json` Reddit feeds back to `type: "rss"` + `https://www.reddit.com/r/<sub>/.rss`. Keep the OAuth scaffolding (`pipeline/src/reddit-auth.ts`, `readRedditCreds`, `fetchFeedXml`'s `authToken` option, the engagement filter, the Reddit JSON parser) in the repo as inert / ready-to-reactivate code.

**Why:** Operator attempted to register a Reddit script-type app per the OAuth-pivot entry above. Reddit's app-creation form silently rejected captcha submissions across two attempts — the reCAPTCHA either failed to validate ("Incorrect response. Try again.") or did not register the click (checkbox stayed empty after submit). Likely causes: browser extension interference with reCAPTCHA's third-party calls, low-trust-account heuristics on Reddit's side, or network-level filtering. None of these are something we can fix from the code side in this session.

Rather than burn more time on captcha forensics, we revert to the proven path: Reddit's `.rss` endpoints. The 08:25 UTC scheduled cron run earlier today (commit `6494b36` — "News triage 2026-05-21: 7 auto-promoted, 0 pruned") confirms `.rss` still works from GitHub Actions runners with whatever default `User-Agent` Node 22's `fetch` sends.

**What this trade-off costs:**

- The engagement floor from the first 2026-05-21 entry (drop stickies, `score>=50`, `num_comments>=10`) is **not active**. Atom doesn't carry those fields. Reddit volume / sticky-leakage / low-engagement-noise concerns from the original conversation are back on the table.
- The pre-LLM-triage cost reduction is gone. We're back to spending Azure tokens on Reddit items that the engagement filter would have rejected at fetch time.
- The 22:00 UTC cron shift from the first 2026-05-21 entry **stays** (it's an independent decision; doesn't depend on JSON-feed access).

**What this trade-off preserves:**

- All other work today: cron shift, type discriminator in config schema, the engagement filter / parser / OAuth client code (parked but not deleted), the LLM-side triage tightening from prior sessions, the rolling-7-day retention.
- A clean reactivation path: if Reddit OAuth ever becomes available to this operator (e.g. captcha resolves on a different browser, account ages enough, or operator switches Reddit accounts), the entire path lights up by flipping `type: "rss"` → `type: "reddit-json"` and `https://www.reddit.com/r/<sub>/.rss` → `https://oauth.reddit.com/r/<sub>/new?limit=25` in two entries of `config/rss-sources.json`. No code change.

**Alternatives considered (this time around):**

- *Disable Reddit feeds entirely* — `enabled: false`. Loses the field-reports content stream; cleaner but harsher. Rejected: the user wanted to retry OAuth later, which is easier with feeds enabled.
- *Keep config pointed at `oauth.reddit.com` and accept that Reddit feeds fail every run* — would clutter logs with `feed_failed` warnings on every cron, with no upside until OAuth is wired. Rejected.

**Code state after this entry:**

- `pipeline/src/reddit-auth.ts`, `pipeline/src/parse-reddit.ts`, `pipeline/src/reddit-filter.ts`, `readRedditCreds`, `fetchFeedXml`'s `authToken` option — all **present but dormant**. Unit tests for all of them still run and pass (205/205). The orchestrator's `enabled.some(f => f.type === "reddit-json")` gate evaluates to `false` with the current config, so the OAuth token-acquisition code path is not exercised at runtime.
- `.github/workflows/rss-triage.yml`'s `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` env passthrough stays. With the secrets unset on GitHub, they pass empty strings — harmless because `readRedditCreds` is never called.
- `SECRETS.md`'s new §1 entries for the Reddit secrets stay; future-operator setup guide is now in the repo. §5 description of the OAuth flow stays — accurate when the path is reactivated.

**Status:** accepted; in-session implementation 2026-05-21. The pipeline is functional again with the same Reddit behavior as before this session, plus the cron shift to 22:00 UTC. If OAuth becomes accessible later, the flip-back is two URLs + two `type` values.

