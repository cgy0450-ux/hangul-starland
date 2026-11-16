# 별빛 새총

Original pull/release forest toy game, linked from the playground. Eight generated original raster exports (forest/menu, turquoise creature, wood plank/pillar, crystal, sling and reward); actual source atlases viewed and exported to WebP, registered with hashes/provenance. The first sprite atlas showed a pale rectangle; regenerated with transparent background and inspected in actual gameplay. Original JoYi remains the header guide. No franchise assets or paid external API.

Matter.js 0.20.0 is pinned locally with full MIT license. It simulates dynamic blocks, projectile/target contacts, gravity and rotation. Five shots, retry/next, twelve distinct stable layouts and local stage persistence. Five-minute limit cannot be reset by retrying or changing stages. Pointer cancel and short pull do not consume shots; angle/fire buttons provide an alternative input.

PASS actual phone/tablet pointer cancellation, natural first-shot win, drag launch, stage progression, retry retaining exact session start, twelve distinct in-bounds layouts and five-minute disable. Tests use a read-only state probe inserted only into the browser test response, never production. Offline playground entry, actual shot and win pass with locally cached physics/artwork. 72 existing browser cases, thirteen strict-game regressions, smoke, 718 asset checks and six negative validator cases pass. The playground uniqueness check now requires all thirteen distinct cards including the new route. Actual screenshots inspected; physical-device or public-site visual testing not claimed. Offline worker includes 4146 URLs.

Server-side release evidence is recorded in deployment.json after Pages and JavaScript QA both succeed and the deployed SHA is confirmed.
