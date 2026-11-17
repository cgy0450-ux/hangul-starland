# Fix opening replay races and natural subject guidance

Rapid skip/replay previously let an older image decode change the newly opened sequence. Invalidate stale work, reset readiness/visibility on every replay and describe image-load failure accurately. Subject titles now match their activities, and compact portrait styling keeps longer titles and status text clear of Skip. Parent settings distinguish the learning-record name from the screen nickname and report English-preview errors.

Preserves original JoYi art, progress, daily rotation, lessons and stroke scoring. Validation: responsive titles/bounds, delayed-decode race and recovery, voice-error dispatch, existing nickname/offline/regression checks. Requested character coloring atlas was rejected by image-tool output moderation and remains unfinished; no workaround or paid API. Physical-device validation remains pending. Final evidence docs/v13/natural-opening.
