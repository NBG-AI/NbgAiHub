---
description: Show curated AI-triaged news (default last 7 days)
argument-hint: "[--today|--week]"
---

Present the news items below verbatim, in the order shown (newest first). Include the `[confidence: …]` markers — they're the editor's read on the item, not noise. If a user wants to open one, suggest `/hub-open news` for the full feed in the browser.

!`node "${CLAUDE_PLUGIN_ROOT}/dist/hub-news.mjs" $ARGUMENTS`
