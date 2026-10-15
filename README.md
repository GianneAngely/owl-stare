# Owl Stare

A webcam staring contest against owls who cheat. Don't blink, don't laugh, don't look away.
Everything runs in the browser: the camera video never leaves the device.

Work in progress — see `GDD.md` (design) and `PLAN.md` (build plan).

## Run locally

```bash
npm run serve      # http://localhost:8080/  (ES modules + wasm need http, not file://)
npm test           # detection rules, calibration, replay of real footage
```

- `index.html` — the game
- `spike.html` — detection meters and calibration (tech spike)

Headless checks use Chrome's fake camera: `tools/fetch-fixtures.sh`, `tools/fake-cam.sh cam.y4m`, then
`node tools/check.mjs "spike.html?auto" 960x640 27000 shot.png 'JSON.stringify(spike.events)' --cam=cam.y4m`.

## Built with

Phaser 3 (MIT) · MediaPipe Tasks Vision / Face Landmarker (Apache 2.0) · Gaegu font (SIL OFL)
