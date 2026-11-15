# v13.6 — helicopter and live vehicle switching

User-authorized built-in image_gen created an original turquoise/yellow helicopter with JoYi's original goggles, scarf and tiger identity. Source PNG retained at `/workspace/generated_images/exec-7165f118-a163-4271-a3bd-00fedf4f1d53.png`; three technical cell crops provide preview, overhead body and separate rotor. No external paid API, stock art, emoji replacement or hand-built illustration.

Both `car-dodge.html` and `car-collect.html` offer five free vehicles. The persistent **탈것 바꾸기** button pauses active play and opens the same selector. Choosing and continuing do not reset scores, lives, level, lane, elapsed time or in-flight obstacles/items. The selected matching body is used by the actual Canvas renderer; only its separate rotor rotates. Existing collision envelope, steering, progress keys, strict optional writing gate and five-minute cap are preserved.

Validation:
- `qa/v13/vehicles.py`: eight viewport/route regression scenarios; real pickups, collisions, steering and existing garage progress preservation. Current captures in `regression/`; earlier release screenshots remain intact in `../fixes/vehicles`.
- `qa/v13/vehicle_switch.py`: six route/viewport scenarios: all five choices, actual body/rotor draw calls, exact paused state across 30 simulated seconds, five consecutive choices, exact resume state, persisted selection, no early trophy and actual five-minute stop after switching. Mobile, portrait tablet and landscape tablet screenshots actually inspected.
- `qa/v13/vehicle_activity_offline.py`: actual production worker installation followed by offline lesson images, both helicopter games and switching.
- Existing strict writing/rescue/game regression: `qa/v13/gameplay.py`, PASS 13. Full browser smoke: PASS 72. Registered artwork: 504 actual WebP (221 main + 283 supporting), all integrity and offline checks pass. Production cache: 1431 requests.

Tests use real Chrome with emulated viewports and a deterministic animation clock. Physical phone/tablet testing and public-site visual verification are not claimed.
