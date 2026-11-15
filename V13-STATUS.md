# v13 progress checkpoint
As of 2026-11-15: planning and environment handoff only. Existing v12.1 QA and Pages success verified at 32d8b8c99a06e2449c1f5b91963161495d1bfb22. No v13 production graphics deployment claimed.
- [x] 01 inventory and visual baseline (baseline screenshots and source inventories retained)
- [x] 02 asset pipeline and image generation capability validation (actual generated assets and rejection checks)
- [x] 03 home and learning cards (21 primary scenes integrated)
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

## 2026-11-15 / batch 02 — offline query navigation regression fix
Branch: `v13/02-offline-query-navigation`, based on batch 01 commit `586ddfb`. Commit: this checkpoint (resolve with `git log -- V13-STATUS.md`).
- `sw.js`: on offline navigation, look up cached HTML with query ignored before falling back to home. Actual location/query remains intact for existing game/subject selection. Cache version bumped to `hangul-starland-v13-offline-query-20261115`. No storage schema, tracing gate, game timing, mascot or gameplay changes.
- PASS smoke and 67-case original browser suite after fix. PASS 200 story page traversals + 20 previous-page checks; 51 cached requests; offline home/playground/plain learning hall; four query routes (Hangul, math, color sorting, space adventure). Evidence: `docs/v13/behavior-results.json`.
- PASS actual v12 worker→v13 worker update, old cache removal and offline math query navigation after controller change. Evidence: `docs/v13/upgrade-results.json`; test `qa/v13/upgrade.py`. Initial upgrade test raced worker activation; corrected test to await actual controller change, without altering app to mask the race.
- Captured actual post-fix offline math mobile/tablet screens. First-pass baselines stay unchanged as before-state evidence.
- Graphic renewal still blocked on no-additional-cost image generation confirmation or purpose-built authorized raster input; 0 new approved images. No release, merge or environment publication performed.

### Remote checkpoint
- Batch 01 commit: `586ddfb`; batch 02 commit: `2941321`.
- Both development branches pushed successfully through native Git. No push to `main`.
- Draft PR creation attempted with `gh pr create --draft` and rejected: `Post https://api.github.com/graphql: Forbidden`. No PR URL exists. This is an API access blocker, not proof that a new token is required. Exact review text with real screenshot links preserved in `docs/v13/PR-DRAFT.md`.
- Pending external prerequisites: supported GitHub PR API access, and confirmation of a zero-additional-cost image generation route or authorized purpose-built raster inputs. Do not treat the presence of the image tool as proof of free usage or actual generation success.
- Environment configuration was not edited or published. Production `main` remains untouched.

## 2026-11-15 / batch 03 — actual 3D JoYi art and integrated game graphics
Branch: continuing `v13/02-offline-query-navigation` as explicitly requested. Commit: this checkpoint (`git log -- V13-STATUS.md`).
- User explicitly authorized built-in subscription image generation. Earlier cost uncertainty is resolved for that tool; no external paid API called. PR API access remains separate and does not block implementation.
- Actually generated and integrated 10 subject scenes + 11 distinct game scenes, 114 transparent object/animal/vehicle/UI sprites, and four original welcome/playfield backgrounds. Original JoYi embedded WebP was extracted only as the actual reference; original SVGs remain untouched. Source image outputs, semantic task IDs and actual generation records are in `docs/v13/generation` and retained `/workspace/generated_images` outputs. No stock/emoji art replacement was used.
- Home and playground now render large scene art; ten subjects remain directly reachable. Phone inspection prompted a second hero layout and navigation pass. Screenshots: `docs/v13/batch03`, `batch03-revised`, `batch03-final`. Missing images, page errors and horizontal overflow were zero in the selected mobile/tablet checks. Actual screenshots were viewed, including phone home/shadows/rescue and tablet playground/dinosaur/collect.
- Updated real game rendering: matching image-derived animal silhouettes, truthful red/yellow/blue objects, popping mole, actual hatchable dinosaur species, six visually distinct space objects, top-down cars, pickups, rescue truck/helicopter/animals/hydrant/house/fire art. Preserve existing hitboxes, steering, score/storage, finite water, unlimited instant refill, animal tap after extinguishing fires, timer and all writing gates.
- Self-review found overlarge shadow silhouettes and a white sprite-sheet background; bounded silhouette sizing was fixed and UI background removed with image_gen, then transparent corners checked. Source and edit are both recorded.
- PASS original smoke and 67 rendered browser cases. PASS 9 real interaction checks in `qa/v13/gameplay.py`: wrong color blocked, five rounds→writing, partial/missing-last stroke blocked, full strokes→stage 2, exactly one of nine spot-difference objects, six space art choices, finite water/two refills, five simulated minutes. Evidence `docs/v13/gameplay-results.json`. Original `word-gate.js` untouched.
- The refill test exposed an existing gauge defect (water display only changed when another UI update fired). Added `updateWater()` each frame; consumption, refill and acceptance conditions unchanged. RAF test harness also needed to retain multiple callbacks rather than overwrite them; no app assertions or stroke thresholds were weakened.
- Story production continues separately: 200 scene-art target, updated openings/endings, comprehension and narration UI are in progress and NOT marked complete in this checkpoint. Main/production/environment publication unchanged.

## 2026-11-15 / batch 04 — 221 planned illustrations implemented, twenty illustrated books
Continuing branch `v13/02-offline-query-navigation`; previous graphical checkpoint `417b1e5` pushed. Commit: this checkpoint (`git log -- V13-STATUS.md`).
- Actual approved main art: **221/221** = 11 game scenes + 10 subject scenes + 200 distinct story scene files, all linked to actual screens. Generated with built-in user-authorized image tool, never an external paid API. Some scenes were generated as multi-panel sheets and technically extracted; do not misreport file count as call count.
- Additional actual art: 232 supporting exports (228 sprites/facades + 4 welcome/playfield backgrounds), total **453 unique WebP exports**. Some supporting props are deliberately retained for later reuse. Source outputs and generation/correction records retained. Original JoYi SVGs and `word-gate.js` unchanged.
- All 20 stories have revised openings/endings, scene-specific images and three-choice comprehension with feedback/replay. Added narration pause/resume/repeat, optional auto-turn, parent voice selection and cancellation guards, using device Korean speech only. Book order/links and existing storage format preserved.
- Every ten-scene book contact was visually inspected. Re-generated transformed-ox panels to remove simultaneous human/ox, including the epilogue; re-generated car ending so rescued puppy stays with family. Adjusted text where scene meaning differed. Retained original and corrected source references.
- PASS 400 actual story renders (200 pages × mobile/tablet), text/image consistency and all 20 comprehension activities in both sizes. PASS 68 route/size screenshots with no observed page errors, image failures or horizontal overflow; 20 additional size checks covered 360×800, 390×844, 800×1280 and 1280×800. Actual running-game/reading/learning screenshots also inspected. Snapshot folders identify their respective stages; source-art contact sheets are not presented as app screenshots.
- Actual screen review prompted another fix: learning images inherited mascot absolute positioning and were tiny in a corner; corrected to central image layout. Removed washed-out fade and made captures wait for final animation state. Moved timer into header flow to stop covering scores. Replaced remaining flat rescue trees and generic buildings with stage-appropriate 3D facades.
- PASS 13 interaction scenarios, including full positive rescue: extinguish fires → tap animal → finish every stroke of 소방차 → persist one rescue. Partial/missing-final strokes remain blocked. Finite water, repeated instant refills and five simulated minutes passed. PASS narration state/race fixtures; actual audible Korean device quality remains unverified.
- PASS 453 actual WebP files, unique content, SHA-256 and offline inclusion. Actual raster decode/dimensions and six rejection cases checked. Existing Node smoke now includes CI-compatible image integrity validation. PASS original 67 rendered cases. Offline/cache upgrade evidence records 507 core requests and successful v12→new worker transition.
- One-time deployment export optimization saved **9,067,636 bytes** while retaining original PNG outputs. Added a guard against repeated lossy recompression. Current exact payload and counts: `docs/v13/artifact-results.json`.
- Remaining: real iPad/Android touch and audible voice checks, exhaustive completion of every lesson/game state, PR review and production deployment. No claim these have passed. No main merge, Pages deploy or environment publication.

### Final local verification and reproducibility
- Cold-run gameplay helper now derives stage coordinates from the repository rather than depending on a temporary file. A quoting error in that helper was corrected; the final self-contained run passed all 13 scenarios. No app acceptance criterion was reduced.
- Final Node smoke, 453-file image integrity check, Python decode/metadata validation and six rejection cases pass. Final Chrome suite: 67 rendered cases pass. Final story evidence contains 400 unique mobile/tablet page records; corrected books were recaptured.
- Final offline run also opens all ten pages of book 19 and decodes their scene images with networking disabled. 507 cached core requests and v12-to-current worker upgrade pass. Narration fixtures pass; audible physical-device quality remains explicitly unverified.
- Actual artwork payload is approximately 40 MB (exact bytes in artifact-results.json). This includes the complete offline story library; it is not a mobile network speed measurement.
- Review summary and actual screenshot links rewritten in PR-DRAFT.md around the implemented result. Native Git push is used; no blocked PR API retry, main merge or environment publication.
