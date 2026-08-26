# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A single self-contained static HTML file (`index.html`) that renders a personal daily health/training dashboard ("Meu Painel") for one user, Kleber, a runner training toward a half marathon (Meia de São Paulo, Santander — 15/11/2026). There is no build system, no dependencies, no server-side code, and no other source files — the entire app is `index.html`: inline `<style>`, inline data-filled markup, and a small inline `<script>` for tab switching and expand/collapse cards.

The dashboard has two tabs, toggled client-side (no page reload, no routing):
- **Hoje** (`data-p="hoje"`): today's readiness score (gauge SVG), today's/tomorrow's workout cards (expandable via `data-toggle`), key signals grid (sleep, HRV/heart balance, resting HR, body battery), sleep phases breakdown, this week's plan, and the daily priority/goal summary.
- **Pos-treino** (`data-p="pos"`): post-workout detail for the day's run (splits table, HR avg/max, time, calories), race goal card, Garmin race-time predictions (5K/10K/half/marathon), PR history, and recent runs.

## Update workflow (how this repo is actually used)

This repo is updated on a near-daily cadence by regenerating `index.html` with fresh data pulled from Garmin (and periodically from nutrition/body-composition exams). Git history is a sequence of `Atualiza painel DD/MM/YYYY` commits, each a content-only diff against the existing HTML/CSS structure — not a full rewrite. When updating the dashboard:

- **Preserve the existing HTML structure, class names, and inline CSS.** Edit the data values, labels, colors, and SVG gauge parameters in place rather than restructuring the page.
- Numbers embedded in the markup (readiness score, sleep score/duration, HR, body battery, pace, splits, PR times, predictions) are meant to be replaced with the latest values, typically sourced from the Garmin MCP connector (see the `checkin-diario` and `painel-garmin` skills) and, less frequently, from the `acompanhamento-nutricao` skill for body-composition updates.
- The readiness gauge is a hand-computed SVG arc: `stroke-dasharray="263.9"` is the full circle (2π·42), and `stroke-dashoffset` encodes the score (`offset = 263.9 × (1 − score/100)`). Update both the offset and the displayed score/color together (color follows the same red/yellow/green semantic used elsewhere: `#C0392B` poor, `#4E7D1B`/greens good).
- Sleep phase bars (`.fase-fill` width %) and comparison deltas ("+12% vs sua media", etc.) are precomputed percentages baked directly into inline `style="width:...%"` — update the width alongside the displayed duration/value.
- The footer timestamp ("Atualizado automaticamente em DD/MM as HH:MM") and the header date line should be updated to match the commit date.
- Commit messages follow the pattern `Atualiza painel DD/MM/YYYY` (Portuguese, matching the date being reflected).

## Conventions

- All user-facing text is Portuguese (pt-BR); keep new copy consistent with the existing tone (concise, coach-like observations tied to metrics, e.g. "O corpo pede descanso... (-54% vs sua media dos ultimos 7 dias.)").
- Styling is plain CSS with a fixed, minimal color palette (dark navy `#132A44` header/goal cards, cream `#F5F5F2` background, semantic red/green for good/bad deltas) — no CSS framework, no external stylesheet besides the Google Fonts (Inter) link.
- JavaScript is vanilla, unminified, and limited to two behaviors: tab switching (`.tab` buttons toggle `[data-p]` sections via `hide` class) and card expand/collapse (`[data-toggle]` buttons toggle a target element's `hide` class). Keep any additions in this same minimal, dependency-free style.
- There is no test suite, linter, or build/deploy tooling in this repo — changes are validated by opening `index.html` directly in a browser.
