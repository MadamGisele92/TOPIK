# TOPIK Quest: Blush Academy

A production-ready, game-styled web app for TOPIK 1-6 preparation with cutesy visuals (blush/white/gold/cream), an adorable mascot, and separate pages for each game mode.

## What changed

- Reworked into a **video game style interface** with:
  - HUD stats (XP, coins, streak, hearts)
  - World map screen for TOPIK worlds 1-6
  - Separate pages for lesson hub, flash arena, memory temple, blank forge, and scenario theater
- Maintained a full curriculum of **6 levels × 15 lessons** (90 lessons total).
- Added reward loop mechanics and penalties to increase interaction.
- Preserved lesson completion + profile persistence with `localStorage`.

## Features

- **World Map page**: view progress per TOPIK world and jump into the next quest.
- **Lesson Hub page**: browse all 90 lessons and pick your active quest.
- **Flash Arena page**: reveal and cycle vocabulary cards.
- **Memory Temple page**: match Korean/English pairs for bonus rewards.
- **Blank Forge page**: fill in missing Korean answers.
- **Scenario Theater page**: choose best contextual phrases.

## Run locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.
