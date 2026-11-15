# Consistent recorded Korean speech

The reported reading lesson used the device voice because its question was absent from the original exact-text audio manifest. The same gap affected other curriculum questions, composed story/remember prompts, numbers, and the separate curated history/coding question bank.

The recorded adapter now handles Korean text even when an English page supplies an English language tag. Old device-mode settings cannot switch Korean back to the system voice. Missing clips and playback errors emit a diagnosable error instead of silently changing speaker; autoplay rejection waits for a gesture. Cancel, pause, resume and story lifecycle callbacks remain supported. English learning pronunciation still uses device English speech.

The requests playground now loads the audio adapter for shared trophy announcements. Personalized praise retains the child's written name and uses a recorded friendly phrase. Parent settings show the active recorded Korean voice and reserve device selection for English pronunciation.

Corpus generation includes the 440-lesson curriculum, composed narration, classic academy and curated question banks, finance variants and numbers. All new clips use the existing free local Supertonic 3 M4 preset, 8 inference steps and original quality settings, without a paid API. Parallel synthesis uses separate temporary WAV files for each worker; new clips are regenerated with that isolation before final decode checks.

Validation results and deployment evidence are recorded after they pass. Browser viewport tests do not constitute physical-device listening or subjective voice-quality approval.
