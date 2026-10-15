# Owl Stare — Game Design Document (v0.1, 2026-10-13)

## 1. Overview
| | |
|---|---|
| Pitch | A webcam staring contest against owls who cheat. Don't blink, don't laugh, don't look away. |
| Genre | Comedy party game / reaction challenge |
| Platform | Web browser (itch.io), desktop + phone with a front camera |
| Engine | Phaser 3 + MediaPipe Face Landmarker (runs in the browser) |
| Language | English |
| Camera | **Required** (no non-camera mode) |
| Visual style | Big expressive cartoon, owl face in close-up |
| Share | Result card with no photo of the player |

## 2. Core loop
1. Pick the next owl on the ladder.
2. Countdown "3, 2, 1, STARE!" starts the match.
3. The owl tries tricks to make you blink, smile or look away.
4. You last X seconds and win, or you break and lose, which plays a funny owl reaction.
5. Result card, then retry or go to the next owl.

## 3. Opponent ladder (6–8 owls, plus a boss)
Each owl has its own personality and trick set; difficulty rises.

Example roster (names are working names):
1. **Hoot**, the beginner: only funny faces, short matches (10 s).
2. **Professor Plume**: reads bad jokes on screen.
3. **Twitchy**: on-screen distractions (feathers, a fly crossing).
4. **Boomer**: sudden "HOOT!" sounds.
5. **Grandma Owlbert**: slow, sweet, then a surprise face.
6. **DJ Night**: silly music plus a dance.
7. **The Twins**: two owls, double tricks.
8. **Boss: Great Horned Hootington**: mixes every trick, long match.

## 4. Lose conditions (all three on)
- **Blink:** eyeBlinkLeft/Right blendshape stays above threshold for at least ~120 ms (filters noise).
- **Smile or laugh:** mouthSmile above threshold, or jaw open combined with smile.
- **Look away:** no face detected, or head yaw/pitch beyond a limit for more than 0.5 s.

All thresholds are tuned per player with a 5-second calibration at first launch: relax, then blink, then smile.

## 5. Owl tricks (all four types)
- Funny or ugly faces (big animation set; this is the core of the art).
- On-screen distractions: feathers, screen shake, a bug walking across, a fake pop-up.
- Surprise sounds: "HOOT!", a squeaky toy, a ticklish tune.
- Jokes and text: one-line jokes appear that the player has to read.

Tricks are scheduled at random within each owl's set; later owls overlap them.

## 6. Privacy
- The camera feed is processed only in the browser; no video or image ever leaves the device. Say this clearly before asking for camera access.
- The player can see a small preview of themselves, with a toggle to hide it.
- The result card contains no face: "You out-stared Professor Plume for 42 s", the owl illustration, and the itch link.

## 7. UI flow
1. Title screen.
2. Camera permission explainer, then the browser prompt.
3. Calibration.
4. Owl ladder map.
5. Match.
6. Result card with Save / Share.

If the camera is denied, show a friendly screen explaining it is required, plus a retry button.

## 8. Art & audio
- Big, expressive cartoon owls with thick outlines and squash-and-stretch faces; the screen is mostly the owl's face.
- The palette stays soft so it fits Angel's Desk (lavender night sky, warm feathers).
- Audio: tense ticking during matches, comedy stings on lose, a fanfare on win.

## 9. Tech notes
- MediaPipe Tasks Vision `FaceLandmarker` with `outputFaceBlendshapes: true`, running video mode in a requestAnimationFrame loop at about 30 fps.
- itch.io camera:
  - itch's HTML embed iframe includes `allow="... camera ..."`, as seen on the Cake Tower page, so getUserMedia should work.
  - Test on the real itch page early (milestone 1).
- Phones: use the front camera, `facingMode: "user"`, portrait layout.
- Save ladder progress in localStorage.

## 10. Scope / milestones
1. Tech spike: blink, smile and look-away detection plus calibration, tested on desktop, phone and inside itch.
2. Prototype: 1 owl with 2 tricks and the full match loop.
3. Ladder: all 8 owls and their tricks.
4. Result card, polish, itch page, promo video.

## 11. Open questions
- Final owl names and personalities.
- Match length per owl.
- Are glasses-wearers OK for blink detection? (Test; calibration should help.)
