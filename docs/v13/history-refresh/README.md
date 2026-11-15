# History scene renewal

Six original built-in image_gen storybook scenes replace the small object clusters for Shin Saimdang, Sejong, Yi Sun-sin, Jang Yeong-sil, Heo Jun and Yu Gwan-sun. Shin Saimdang paints plants and insects; the other figures demonstrate their historical work. These are interpretive children's illustrations rather than documentary portraits. Source atlas retained at `/workspace/generated_images/exec-130acc8a-59df-4425-be1d-68142e41774f.png`.

Both journey learning and classic history quiz rendering resolve the actual question answer to the scene. Existing question, explanation, progress and answer handlers are retained. Match/order activities keep their existing choice interaction. Full scenes fit within the picture area and remain large on phone and tablet.

`qa/v13/history_scenes.py` passed twelve real Chrome scene/viewport scenarios with decoded images, large picture dimensions, accessible continue controls and no horizontal overflow. Mobile and tablet Shin Saimdang screenshots were visually inspected. Test fixtures choose the target historical question while retaining the application's actual render and click handlers. No physical-device or public-site visual verification is claimed.
