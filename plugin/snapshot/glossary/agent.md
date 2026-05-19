---
type: glossary
title: Agent
audience: both
topics: [agents, orchestration]
internal: false
authored: "2026-05-18"
last_reviewed: "2026-05-18"
external_link: null
deeper_link: null
ai_summary: A scoped instance of Claude running with its own context window, system prompt, and tool set — used to delegate a sub-task without polluting the main session.
---

An agent (often "subagent" in Claude Code) is a fresh Claude session you spawn from inside your main session to handle one focused job. The parent agent collects the result and discards the agent's working context. This is the cleanest way to run long, exploratory tasks (research, deep file searches, parallel work) without burning through your main session's tokens.
