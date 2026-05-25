---
type: glossary
title: CLAUDE.md
audience: beginner
topics: [conventions, setup]
internal: false
authored: "2026-05-18"
last_reviewed: "2026-05-18"
external_link: null
deeper_link: null
ai_summary: A markdown file at the root of a repo (or in ~/.claude/) where you tell Claude Code the rules, conventions, and context it should follow when working in that scope.
tldr: "A markdown file at a repo's root (or in ~/.claude/) where you tell Claude Code the rules, conventions, and context to follow in that scope."
aliases: ["CLAUDE.md"]
---

A `CLAUDE.md` is the file Claude Code reads automatically when you open a session in its directory. Put project-specific rules in the repo's `CLAUDE.md`, and personal preferences that apply to every project in `~/.claude/CLAUDE.md`. The rule of thumb: if you'd repeat the instruction in three different sessions, it belongs in a `CLAUDE.md`.
