# Test footage (not committed; `tools/fetch-fixtures.sh` downloads it)

All public domain, CC0 or Pexels License, used only for the headless detection checks, never shipped in the game.

| File | Source | License |
|---|---|---|
| address.webm | Wikimedia Commons, "2017-01-07 President Obama's Weekly Address.webm" (480p transcode) | Public domain (US federal government work) |
| portrait.jpg | MediaPipe test asset `portrait.jpg` (official White House portrait, 2012) | Public domain |
| Pexels 6976944 | "A woman winking her eyes", pexels.com/video/a-woman-winking-her-eyes-6976944 | Pexels License (free to use) |
| Pexels 6708674 | "Woman in blue long sleeve shirt winking", pexels.com/video/woman-in-blue-long-sleeve-shirt-winking-6708674 | Pexels License (free to use) |
| turn2.jpg | Wikimedia Commons, "Portrait of HB Herrick's wife, Elizabeth Herrick, looking away, between 1903 and 1908 (PORTRAITS 2593).jpg" | Public domain |

`address-signals.json` (committed) is FaceLandmarker output for 10-40 s of address.webm at 30 fps, made with test/probe.html.

`eye-signals.json` (committed) is the game tracker's output with the face mesh eye opening (test/probe-video.html, mode `ear`) for address.webm near and far and the two Pexels wink clips near and far; only the numbers are committed, not the footage.
