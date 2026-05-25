---
type: journey-step
title: Foundations — what is Claude Code, and why should I care?
audience: beginner
topics: [foundations, onboarding, mental-models]
internal: false
authored: "2026-05-24"
last_reviewed: "2026-05-24"
external_link: null
deeper_link: "https://anthropic.skilljar.com/claude-code-101"
ai_summary: Six foundational explainers for anyone who has never used Claude Code before — what it is, how it differs from ChatGPT, what an LLM actually is, why context windows matter, what makes an agent different from a chatbot, and why we picked Claude Code over the alternatives. Read this first if any of those questions feels uncertain.
---

You don't need Claude Code to do your job. Plenty of people get along fine without it. The hub exists because *we* find it useful enough to want our colleagues on board — and the fastest way to be useful is to be honest about what it is, what it isn't, and where it fits. This page is the "why," before any of the "how" on Day 1.

Read straight through, or skip to the section that matches the question you're sitting on right now.

---

## Step 1 — What is Claude Code?

Claude Code is a tool you install on your laptop. You run it in a terminal — that black-screen-with-blinking-cursor thing — and you talk to it in plain English about the code in front of you. Unlike a chatbot in a browser tab, Claude Code has **hands**: it reads the files in your project, edits them, runs commands, runs tests, watches what breaks, and tries again. You're not copy-pasting code snippets between a browser and your editor. You're working *with* something that's already in the same room as your codebase.

The model doing the thinking is **Claude** — Anthropic's family of large language models. Claude Code is the *agent* wrapping the model: it gives the model permission to look at your files, run shell commands, and iterate on its own work. You stay in control: you approve risky actions, you read the diff before committing, you tell it to back off when it goes sideways.

Think of it as hiring a brilliant junior colleague who happens to know every programming language reasonably well, never sleeps, and forgets everything the moment the session ends. That last part is the catch — but it's also fixable, and that's most of what the rest of this hub is about.

---

## Step 2 — Claude Code vs Claude.ai vs the API vs ChatGPT

This is the question almost every newcomer asks within the first day, and the names don't help. Here's the disambiguation.

**Claude** is the *model* — the actual AI. It's what answers the question, regardless of which interface you use. Anthropic ships several variants: Opus (most powerful), Sonnet (the daily driver), Haiku (fastest). When someone says "Claude said X," they mean a Claude model produced X — but they may have reached it through any of three different surfaces.

| Surface | What it is | When to reach for it | What you pay |
|---------|------------|----------------------|--------------|
| **Claude.ai** | The chatbot at claude.ai (and the desktop/mobile apps). A web tab with a text box. | Quick questions. Drafting text. Brainstorming. "Explain this concept." Doesn't touch your files. | Free tier, then ~$20/month (Pro), ~$100-200/month (Max) |
| **Claude Code** | A CLI tool. Runs in your terminal. Has filesystem access, runs commands, edits code. | Anything that needs to *change* files in a project. Refactors. New features. Debugging. CI/CD. | Included in Claude.ai Pro+. Or pay-per-token via the API |
| **Anthropic API** | Raw programmatic access — your code calls Claude over HTTP. | You're *building* something that uses Claude inside it. Custom tools, internal agents. | Pay-per-token. |
| **Claude Cowork** | A GUI variant of Claude Code aimed at non-developers. Research preview. | Non-technical folks who still want hands-on capability. | Same Claude.ai subscriptions. |

**Compared to other vendors:**
- **ChatGPT** (OpenAI) — chatbot, similar to Claude.ai. Different underlying model (GPT family).
- **Gemini** (Google) — chatbot, similar shape. Google's models.
- **Grok** (xAI) — chatbot, edgier tone, X integration.
- **GitHub Copilot** — code completion inside your editor, not a full agent.
- **Cursor** — an IDE (a VS Code fork) with an AI agent baked in. Visual workflow.
- **Cline / Aider / Codex CLI** — other coding agents, different trade-offs (covered in Step 6).

If you want the short version: **Claude.ai is the browser tab; Claude Code is the terminal agent; the API is for programmers building tools.** They all talk to the same models.

---

## Step 3 — What is a large language model (LLM)?

You don't need to know how an internal combustion engine works to drive a car. You also don't *strictly* need to understand LLMs to use Claude Code. But three insights from the engine room will save you hours of confusion later.

**1. It predicts the next chunk of text. That's it.** Given a prompt, the model produces a *probability distribution* over what the next "token" (roughly: a word-piece) might be, picks one, appends it, and repeats. It does this billions of times during training to learn patterns from text scraped from the public internet, code, books, and conversations. There's no reasoning engine, no logic prover, no internal scratchpad — just very, very good next-token prediction.

**2. It has no memory between sessions.** When you close the terminal and reopen it tomorrow, the model has zero recollection of yesterday. Everything Claude "knows" about your project, your conventions, your past conversations is what's *currently in its context window* (next step). Anything outside that, it cannot see.

**3. It's pre-trained.** The knowledge baked into the model was frozen at some point in the past — its "training cutoff." Ask it about events after that date and it'll either say it doesn't know, or — worse — make something up that *sounds* right. This is one of the main reasons hallucinations happen.

This is a wildly compressed summary. If you want to actually *understand* this, the resources at the end of this section are some of the best free explanations ever produced.

---

## Step 4 — Context windows — why memory has a limit

If you remember one mechanical fact from this whole page, make it this: **the model can only see what fits in its context window, and once it's full, things start falling out**.

A context window is the model's working memory for one session. Everything you type, everything the model writes back, every file it reads, every tool output — all of it counts against a fixed budget measured in *tokens* (think: ~3-4 characters of text per token, or about ¾ of a word on average). Modern Claude models hold ~200,000 tokens, which sounds like a lot until you realise a 500-line source file might cost you 2,000 tokens, and a session that reads ten files plus a long stack trace plus your back-and-forth chat can fill 50,000 before you notice.

**Two failure modes happen when context fills up:**

1. **Older content gets quietly dropped or compressed.** The model loses the early instructions, your project conventions, the constraint you set up an hour ago. From your side it looks like Claude "forgot" what you said — because it literally did.
2. **Hallucinations spike.** Lost in long contexts, the model leans more on its pre-trained instincts and less on the actual file in front of it. It starts inventing function names that don't exist, importing modules that don't ship, "remembering" rules you never wrote. Researchers call this the *"lost in the middle"* effect: even when the relevant info IS in the window, if it's buried under noise, the model often skips over it.

**Practical implications:**
- **`/compact`** — summarises the conversation so far, freeing up tokens. Use it between unrelated tasks.
- **`/clear`** — wipes the context entirely. Cheaper context = better answers. Don't be precious about it.
- **`CLAUDE.md`** — a file you write at the project root that gets loaded *every session*. The persistent memory, paid for in tokens once per session instead of repeated every turn.
- **Skills** — small, scoped instruction bundles loaded on demand, not always. Saves context when not in use.

Trust nothing past the 70% context-fill mark without a review. If you start seeing the model invent things — that's the signal. `/compact` or `/clear` and start fresh.

---

## Step 5 — Agent vs chatbot — what tool-use changes

You've used ChatGPT. You typed a question, it typed an answer. That's a chatbot loop. One in, one out. The model is a brain in a jar — it can produce text but it can't *do* anything in your world.

An **agent** is the same model with **hands**. Specifically: it's been given a set of *tools* (read a file, write a file, run a shell command, fetch a URL, query a database…) and it's wrapped in a loop that lets it decide which tool to call, call it, read the output, decide again, and continue — until it thinks the task is done or you stop it.

What changes when you flip from chatbot to agent:

- **Errors compound visibly.** A chatbot's mistake is a paragraph you can ignore. An agent's mistake is a deleted file. Always review changes before accepting.
- **The model now has a stake in being right.** Chatbots can be hand-wavy. Agents discover the hand-waving the moment they try to compile the code.
- **Iteration is automatic.** You don't need to copy/paste an error message back — the agent already saw it, already tried again, already (usually) fixed it.
- **You delegate the boring parts AND own the consequences.** "Make all those tests pass" is now a single sentence. So is "delete every file in this folder," which is why the supervision matters.

Karpathy has a memorable framing: think of the agent as a new kind of operating system, with the LLM as the kernel orchestrating tools, files, and processes. We're not all the way there yet, but Claude Code is one of the products closest to that pattern.

---

## Step 6 — Why Claude Code, specifically?

Honest answer: there isn't a single "best" coding agent. There's a constellation of tools with overlapping capabilities, and we picked Claude Code because it's the strongest fit for what we do. Some context.

| Tool | What it is | Why you might pick it | Why you might not |
|------|------------|----------------------|-------------------|
| **Claude Code** | Anthropic's CLI agent, Claude models. | Deepest reasoning. 200K context delivered reliably. Strong autonomous multi-step. Terminal-first composes with any editor. | Locked to Claude (no GPT/Gemini switching). Subscription cost can climb on heavy use. |
| **Cursor** | VS Code fork with built-in agent. | Visual IDE feel. Can switch between models. Fast inline edits. | Reports of context truncation under hood. IDE lock-in if you preferred your existing setup. |
| **Cline** | VS Code extension, full agent loop. | Lives inside your existing VS Code. Step-by-step approval mode. Open source. | Pay your own model bills. Less "deeply integrated" feel. |
| **Aider** | Terminal pair-programmer. Model-agnostic. | Git-native (every edit is a commit). Token-efficient. Works with any model. | No visual interface. Smaller blast radius — less autonomous than Claude Code on big tasks. |
| **GitHub Copilot** | Inline completion + a separate chat. | Already on most dev machines. Tight VS Code integration. | Completion-shaped, not agent-shaped. Less suited to multi-file refactors. |

**Why we landed on Claude Code at NBG specifically:**
1. The strongest results we've seen on hard, multi-file work — refactors that touch 10+ files, complex debug sessions, "build me this feature end-to-end."
2. Terminal-first means it doesn't dictate your editor. You can use VS Code, Neovim, JetBrains, whatever.
3. Skills + plugin marketplace mean we can ship team-specific capabilities (deploy scripts, internal tools) without forking the tool itself.
4. The single-model lock-in is *also* a feature — fewer knobs to tune, more focus on the actual workflow.

Many teams end up running two tools side-by-side: Claude Code for hard problems, Cursor or Copilot for fast inline edits. That's a sensible end state. The hub is opinionated about Claude Code as the *primary* tool here, not the only one allowed to exist.

---

You're now equipped with the mental models. Move on to **Day 1** when you're ready to actually install Claude Code and run your first session — six concrete steps, about thirty minutes, you'll be productive by the end of it.
