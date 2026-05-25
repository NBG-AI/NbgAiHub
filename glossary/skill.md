---
type: glossary
title: Skill
audience: both
topics: [skills, automation]
internal: false
authored: "2026-05-18"
last_reviewed: "2026-05-18"
external_link: null
deeper_link: null
ai_summary: A reusable unit of Claude Code capability packaged as a directory of instructions, scripts, and metadata that gets surfaced as a slash command or invoked by name.
tldr: "A reusable unit of Claude Code capability — a folder with instructions, scripts, and metadata, surfaced as a slash command or invoked by name."
aliases: ["skills"]
---

A skill is a folder with a `SKILL.md` (the instructions Claude follows) plus any supporting scripts, prompts, or assets. Drop it into `~/.claude/skills/` and Claude will pick it up. Skills are how you stop pasting the same 200-line prompt and instead say "use the X skill." They're the boring-but-good answer to "how do I scale this?"
