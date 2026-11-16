# Meaningful matching and explicit app updates

All matching modes now hide the source answer scene and ask the actual curriculum question. Illustrated options retain original answer values; six offline matching flows and completion pass. Historical figure choices use their proper existing contextual portraits. Phone/tablet screenshots were captured and inspected.

Home compares the loaded page release, active service worker and freshly fetched server version. It shows checking, available, current, applying, completed and connection/error messages, and handles a worker that activated before the user pressed Apply. Progress is preserved. Browser tests verify installed-worker current state and controlled future-version/offline states at phone/tablet sizes; full upgrade on a physical phone is not claimed. Seventy-two browser cases and smoke pass.

The initial future-version route interception test failed because the service worker handled that request. The test was corrected to control the remote-version fetch response and passed; the failed test was not counted as successful. Actual deployment SHA and workflows are recorded separately.
