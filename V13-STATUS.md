# v13 progress checkpoint
As of 2026-11-15: planning and environment handoff only. Existing v12.1 QA and Pages success verified at 32d8b8c99a06e2449c1f5b91963161495d1bfb22. No v13 production graphics deployment claimed.
- [ ] 01 inventory and visual baseline
- [ ] 02 asset pipeline and image generation capability validation
- [ ] 03 home and learning cards
- [ ] 04 action games
- [ ] 05 mini games and adventures
- [ ] 06 learning illustrations
- [ ] 07 twenty stories
- [ ] 08 full regression, review and deployment
For every batch append branch, commit, files, actual assets, tests, screenshots, known limitations, next task. Read this on every new session. Do not mark incomplete work done.

## 2026-11-15 / batch 01 — actual baseline and asset preparation
Branch: `v13/01-visual-audit`. Baseline parent: `1c24aeb7000c2679f8e19e3b4dd83205350dfd95`. Commit: this checkpoint (resolve with `git log -- V13-STATUS.md`).
- Read AGENTS, roadmap, status and kickoff. No production graphics changes or deployment.
- Added `docs/v13/README.md`, existing asset inventory (25 image files with SVG symbol inventories), semantic creation plan (221 pending, **0 generated/approved**), screenshot/behavior capture tools and asset validator.
- Actual Chrome captures: 54 targets × 4 sizes (360×800, 390×844, 800×1280, 1280×800) = **216 screenshots**, plus four contact sheets. Targets include all 16 root HTML pages, 10 subjects, all 11 game entries, each story's first page. Zero observed page errors, HTTP errors and horizontal overflow during capture. These metrics are not full gameplay validation.
- Visually inspected mobile360 contact sheet, tablet home, mobile390 story 19 and landscape differences. Detailed aesthetic review of every screenshot and every story page remains outstanding. Screenshots expose common generic story scenes and inconsistent mascot/icon art.
- PASS `node qa/smoke.cjs`; PASS `node qa/browser-smoke.cjs` (67 rendered cases); PASS 6 negative asset-validator tests; PASS registry consistency (221 pending is not art completion).
- Behavioral traversal: 200 story pages + previous-page navigation for 20 books passed; 51 cache entries; offline home, playground and plain learning route passed. **FAIL** offline `journey.html?subject=hangul`: service worker falls back to home. Evidence: `docs/v13/baseline/behavior-before.json`. Next independent fix: preserve query-bearing offline navigation.
- Confirmed wrong existing semantic mappings (fox→cat, pig/cow→bear, corn→banana, etc.). Do not substitute more generic graphics.
- Image tool listed; no call made because no zero-additional-cost guarantee is exposed. Actual image generation/reference editing/export remains unverified. No paid API called. Real purpose-built raster art remains required before graphics integration.
- Git remote read passed. GitHub CLI reports invalid API authentication; PR capability not established. No merge/publication authorized or attempted.
- Next: fix and retest offline query navigation on a separate branch; then generation cost/access prerequisite, original JoYi reference validation, first game/subject scene production and visual review. Roadmap boxes remain unchecked because full audit and image capability validation are incomplete.
