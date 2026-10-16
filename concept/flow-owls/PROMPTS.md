# Owl sprites from Google Flow: pose list and prompts

Angel (via the manager, 16 Oct): the owls may be made in Google Flow so they match the GDD art exactly.
Flow: Google account /u/2, project "Oct 13 - 02:21", model Nano Banana. Raw downloads go in `raw/` here,
finished sprites in `assets/owls/` (transparent WebP, about 640 px tall, budget about 2.2 MB in total so the itch zip stays under 10 MB).

## Poses the game needs
Every face the code swaps in maps to one full-body image per owl. "idle" and "stare" use the rest pose; Grandma's "sweet" is her rest pose.

| Pose | Used for |
|---|---|
| rest | the lineup look; staring during a match, ladder, the start of a joke |
| blink | owl blinking (title, ladder idle) |
| laugh | the owl wins; joke punchline; dance |
| shock | the owl loses; beaten owls on the ladder; result card when you win |
| tongue | funny-face trick, squeak, surprise, dance |
| cross | funny-face trick, fly, surprise, dance |
| shout | HOOT! trick, surprise, dance (only owls that use them) |

| # | Owl (lineup, left to right) | Poses | Count |
|---|---|---|---|
| 1 | Hoot, the fluffy baby | rest, blink, laugh, shock, tongue, cross | 6 |
| 2 | Professor Plume, cream, round glasses, book | rest, blink, laugh, shock, tongue, cross | 6 |
| 3 | Twitchy, speckled grey, shaking | rest, blink, laugh, shock, tongue, cross | 6 |
| 4 | Boomer, grey, megaphone | rest, blink, laugh, shock, tongue, cross, shout | 7 |
| 5 | Grandma Owlbert, cream, shawl, knitting, yarn ball | rest, blink, laugh, shock, tongue, cross, shout | 7 |
| 6 | DJ Night, grey, headphones | rest, blink, laugh, shock, tongue, cross, shout | 7 |
| 7 | The Twins, cream (one twin, drawn twice) | rest, blink, laugh, shock, tongue, cross, shout | 7 |
| 8 | Great Horned Hootington, big white, yellow crown | rest, blink, laugh, shock, tongue, cross, shout | 7 |
| – | Guide owl from keyart.jpg (title, camera, calibration) | rest, blink, laugh, shock | 4 |
| | | **Total** | **57** |

## File names
Owl ids: `guide`, `hoot`, `plume`, `twitchy`, `boomer`, `grandma`, `dj`, `twins`, `boss`. Pose ids: `rest`, `blink`, `laugh`, `shock`, `tongue`, `cross`, `shout`.

| Stage | Path | Example |
|---|---|---|
| Flow download, renamed | `concept/flow-owls/raw/<owl>-<pose>.png` | `concept/flow-owls/raw/plume-tongue.png` |
| Finished sprite (transparent, trimmed) | `assets/owls/<owl>-<pose>.webp` | `assets/owls/plume-tongue.webp` |
| Phaser texture key | `owl-<owl>-<pose>` | `owl-plume-tongue` |

Every face name in the code maps to a pose file:

| Face in code | Pose file |
|---|---|
| `idle`, `stare`, `dots`, `specs`, `wide`, `sweet`, `sleepy` (rest faces) | `rest` |
| `blink` | `blink` |
| `laugh` | `laugh` |
| `shock` | `shock` |
| `tongue` | `tongue` |
| `cross` | `cross` |
| `shout` | `shout` (only boomer, grandma, dj, twins, boss use it) |

The full list of 57 files: `guide-{rest,blink,laugh,shock}`, `{hoot,plume,twitchy}-{rest,blink,laugh,shock,tongue,cross}`,
`{boomer,grandma,dj,twins,boss}-{rest,blink,laugh,shock,tongue,cross,shout}`.

The code-drawn SVG owls stay on branch `owls-svg` (commit 65db5aa) as a backup.

## How (one owl at a time)
1. **rest:** ingredient `concept/lineup.jpg` (+ Search assets, Add to prompt), rest prompt below. Generate, pick the closest one, download.
2. **other poses:** ingredient = that owl's chosen rest image, pose prompt below, so the body, props and position stay identical and only the face changes. Swapping poses then doesn't jump.
3. Locally: cut the off-white background to transparent (flood fill from the edges), trim to the same canvas per owl, export WebP, check the poses line up (overlay test), then build `report/owls/compare.jpg`.

## Rest prompt (per owl)
> Use the attached lineup image as the exact character and style reference. Draw ONLY {OWL} from the lineup, alone. Full body from the top of the head to the feet, standing straight, facing the viewer, centred, filling about 85% of the image height. Keep exactly the same shape, proportions, colours, props and thick uneven black brush-pen outlines as in the lineup. Plain flat off-white background (#f8f8f4), no ground line, no shadow, no text, no other owls. Square 1:1 image.

{OWL}:
1. the tiny fluffy grey-white baby owl on the far left, with two black dot eyes and a dot beak
2. the round cream owl with round black glasses, holding an open book (second from left)
3. the speckled light-grey owl with big round white eyes and shaking lines around it (third from left)
4. the grey owl holding a white megaphone, but calm: yellow eyes open, beak closed, megaphone held in its wing (fourth from left)
5. the cream grandma owl wearing a cream shawl, knitting with two needles, a grey yarn ball at its feet, eyes closed in a happy smile (fifth from left)
6. the grey owl wearing black headphones, yellow eyes (sixth from left)
7. ONE of the two cream twin owls with yellow eyes (seventh from left)
8. the big white owl with the small yellow crown floating above its head and half-closed, unimpressed yellow eyes (far right)

Guide owl: ingredient `concept/keyart.jpg` instead: "Draw the same cream owl as in the attached image, alone…" (rest of the prompt the same).

## Pose prompt (ingredient: the owl's rest image)
> Same owl, same drawing style, same body, same pose, same props, same size and position in the frame, same plain off-white background. Change ONLY the face: {FACE}. Square 1:1 image.

{FACE}:
- **blink:** both eyes fully closed, drawn as two short curved ink lines; beak unchanged
- **laugh:** eyes squeezed shut in happy upside-down arcs, beak wide open laughing with a small pink tongue, two tiny light-blue sweat drops
- **shock:** eyes huge, round and white with tiny black pupils, beak open in a small "o", light-blue sweat drops
- **tongue:** one eye winking shut, the other eye huge, round and white; beak open with a pink tongue sticking out (silly face)
- **cross:** big white cross-eyed eyes looking at the beak, cheeks puffed with pink blush, wobbly mouth line
- **shout:** eyes squeezed shut like > and <, beak wide open shouting

## Risks
- Flow may change the body or props between poses. If an owl's poses don't line up, keep the code-drawn owl for that owl and say so in REPORT.md.
- 57 generations (more with retries) use Angel's Flow credits.
- Each image is a download from Flow to this Mac.
