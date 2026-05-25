---
type: glossary
title: Terminal
audience: beginner
topics: [foundations, tools]
internal: false
authored: "2026-05-25"
last_reviewed: "2026-05-25"
external_link: null
deeper_link: null
ai_summary: A terminal is the text window where you type commands and read their output. On Mac it's Terminal.app or iTerm2; on Windows it's Windows Terminal or PowerShell; on Linux any of dozens. Underneath each one runs a shell (bash, zsh, fish) that actually interprets what you type. Claude Code lives here — you launch it by typing `claude` in a terminal inside your project folder.
tldr: "The text window where you type commands and read their output. Claude Code runs here — you launch it with `claude` in a terminal inside your project."
aliases: ["terminals"]
---

A **terminal** is the text window where you type commands. On Mac it's `Terminal.app` (built in) or `iTerm2` (the popular replacement). On Windows it's `Windows Terminal` or `PowerShell`. On Linux it's whatever your distro ships. They all do the same job: give you a place to type, and show you what the computer typed back.

Underneath every terminal runs a *shell* — bash, zsh, fish, PowerShell — the program that actually reads your commands, runs them, and prints the output. The terminal is the window; the shell is the brain.

For Claude Code purposes you only need to know three things:

1. Open a terminal.
2. `cd` into the folder of the project you want to work on.
3. Type `claude` and hit return.

That's the door in. Everything Claude Code does — reading your files, running tests, editing code — happens from inside that terminal session. If someone says "open a terminal" or "drop into the shell" or "run it on the command line," they all mean the same thing: this window.
