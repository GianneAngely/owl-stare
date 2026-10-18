import { test } from "node:test";
import assert from "node:assert/strict";
import { createJudge } from "../src/face/judge.js";
import { calibrate, DEFAULTS } from "../src/face/calibrate.js";

const calm = { face: true, blinkL: 0.1, blinkR: 0.1, smile: 0.05, jaw: 0.05, yaw: 0, pitch: 0 };
// feed one signal per 33 ms; returns [timeOfVerdict, verdict] or null
function run(judge, frames) {
  for (const [t, over] of frames) { const v = judge.update({ ...calm, ...over, t }); if (v) return [t, v]; }
  return null;
}
const frames = (from, to, over) => { const a = []; for (let t = from; t < to; t += 33) a.push([t, over]); return a; };

test("calm face never loses", () => {
  assert.equal(run(createJudge(DEFAULTS), frames(0, 10000, {})), null);
});

test("a one-frame flicker is not a blink, two frames in a row are", () => {
  const closed = { blinkL: 0.9, blinkR: 0.9 };
  assert.equal(run(createJudge(DEFAULTS), [...frames(0, 500, {}), [500, closed], ...frames(533, 2000, {})]), null);
  const r = run(createJudge(DEFAULTS), [...frames(0, 500, {}), [500, closed], [533, closed], ...frames(566, 2000, {})]);
  assert.deepEqual(r, [533, "blink"]);
});

test("a one-eye wink counts as a blink, either eye (Angel, 18 Oct)", () => {
  assert.equal(run(createJudge(DEFAULTS), frames(0, 2000, { blinkL: 0.9, blinkR: 0.05 }))?.[1], "blink");
  assert.equal(run(createJudge(DEFAULTS), frames(0, 2000, { blinkL: 0.1, blinkR: 0.85 }))?.[1], "blink");
});

test("squinting or a smile that narrows both eyes is not a wink", () => {
  // both eyes half shut, below the two-eye threshold: no blink
  assert.equal(run(createJudge(DEFAULTS), frames(0, 2000, { blinkL: 0.45, blinkR: 0.4 })), null);
  // one eye a bit more closed than the other, neither past its own threshold + margin
  assert.equal(run(createJudge(DEFAULTS), frames(0, 2000, { blinkL: 0.62, blinkR: 0.3 })), null);
  // a smiling squint: smile is judged as smile, never as a blink
  assert.equal(run(createJudge(DEFAULTS), frames(0, 2000, { blinkL: 0.48, blinkR: 0.44, smile: 0.7 }))?.[1], "smile");
  const low = { ...DEFAULTS, blink: 0.42, blinkL: 0.42, blinkR: 0.42 };   // a typical calibrated line
  assert.equal(run(createJudge(low), frames(0, 2000, { blinkL: 0.5, blinkR: 0.46, smile: 0.7 }))?.[1], "smile");
  assert.equal(run(createJudge(low), frames(0, 2000, { blinkL: 0.5, blinkR: 0.46, smile: 0.35 })), null);   // a grin starting: not a blink
});

test("the wink uses each eye's own calibrated threshold", () => {
  const th = { ...DEFAULTS, blink: 0.5, blinkL: 0.3, blinkR: 0.6 };
  assert.equal(run(createJudge(th), frames(0, 2000, { blinkL: 0.55, blinkR: 0.2 }))?.[1], "blink");   // past 0.3 + 0.2
  assert.equal(run(createJudge(th), frames(0, 2000, { blinkL: 0.1, blinkR: 0.75 })), null);           // right eye needs 0.8
});

test("smile and open-mouth laugh", () => {
  assert.equal(run(createJudge(DEFAULTS), frames(0, 1000, { smile: 0.7 }))?.[1], "smile");
  assert.equal(run(createJudge(DEFAULTS), frames(0, 1000, { smile: 0.35, jaw: 0.5 }))?.[1], "smile");
  assert.equal(run(createJudge(DEFAULTS), frames(0, 1000, { jaw: 0.6 })), null);   // gasping is fine
});

test("look away: turned head or no face for 0.5 s", () => {
  const r = run(createJudge(DEFAULTS), [...frames(0, 300, {}), ...frames(300, 2000, { yaw: 40 })]);
  assert.equal(r[1], "away");
  assert.ok(r[0] >= 800 && r[0] < 870);
  assert.equal(run(createJudge(DEFAULTS), frames(0, 2000, { face: false }))?.[1], "away");
  assert.equal(run(createJudge(DEFAULTS), [...frames(0, 300, { face: false }), ...frames(300, 2000, {})]), null);
});

test("look away is measured from the calibrated resting pose", () => {
  assert.equal(run(createJudge({ ...DEFAULTS, yaw0: 20 }), frames(0, 2000, { yaw: 35 })), null);
});

test("calibration puts thresholds between rest and peak", () => {
  const relax = frames(0, 2000, {}).map(([t]) => ({ ...calm, t, blinkL: 0.2, blinkR: 0.3, yaw: 8 }));
  const blink = [...relax.slice(0, 10), { ...calm, blinkL: 0.85, blinkR: 0.75 }];
  const smile = [{ ...calm, smile: 0.8 }];
  const { ok, th } = calibrate({ relax, blink, smile });
  assert.ok(ok);
  assert.ok(th.blink > 0.3 && th.blink < 0.8, `blink ${th.blink}`);
  assert.ok(th.smile > 0.05 && th.smile < 0.8, `smile ${th.smile}`);
  assert.equal(Math.round(th.yaw0), 8);
});

test("calibration flags a missed blink and keeps a safe default", () => {
  const relax = frames(0, 2000, {}).map(([t]) => ({ ...calm, t }));
  const r = calibrate({ relax, blink: relax, smile: [{ ...calm, smile: 0.8 }] });
  assert.equal(r.problem, "blink");
  assert.equal(r.th.blink, DEFAULTS.blink);
  assert.equal(calibrate({ relax: [], blink: [], smile: [] }).problem, "noface");
});

// The same footage with the face shrunk to ~50 px in a 720p frame (a player far from the camera), through the
// game's tracker with its zoom-on-small-faces window (test/probe-video.html). Old pipeline: no face for the first
// 17 s and none of the first 9 blinks.
test("real video, face far from the camera: still found, blinks still caught", async () => {
  const { frames: rows } = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("fixtures/far-signals.json", import.meta.url)));
  const BLINKS = [19, 51, 98, 163, 221, 259, 302, 402, 438, 524, 551, 574, 645, 677, 801];
  assert.ok(rows.filter(Boolean).length >= 850, `face in ${rows.filter(Boolean).length}/900 frames`);
  const judge = createJudge({ ...DEFAULTS, blink: 0.4, blinkL: 0.4, blinkR: 0.4 });   // what calibration gives this face (below)
  const hits = [];
  rows.forEach((r, i) => {
    const t = (i * 1001) / 30;
    const v = judge.update(r ? { t, face: true, blinkL: r[0], blinkR: r[1], smile: r[2], jaw: r[3], yaw: r[4], pitch: r[5] } : { t, face: false });
    if (v) { hits.push([i + 1, v]); judge.reset(); }
  });
  const near = (f) => BLINKS.some((b) => Math.abs(b - f) <= 4);
  const caught = BLINKS.filter((b) => hits.some(([f]) => Math.abs(b - f) <= 4));
  assert.deepEqual(hits.filter(([f, v]) => v === "blink" && !near(f)), [], "false blink alarms");
  assert.ok(caught.length >= 12, `caught ${caught.length}/${BLINKS.length}`);
});

test("calibration sets a blink line real quick blinks reach (rest 0.27, deliberate blink 0.85 -> ~0.44)", () => {
  const relax = frames(0, 2000, {}).map(([t]) => ({ ...calm, t, blinkL: 0.27, blinkR: 0.27 }));
  const { th } = calibrate({ relax, blink: [{ ...calm, blinkL: 0.85, blinkR: 0.85 }], smile: [{ ...calm, smile: 0.8 }] });
  assert.ok(th.blink > 0.38 && th.blink < 0.47, `blink ${th.blink}`);
  assert.ok(Math.abs(th.blinkL - th.blink) < 0.01 && Math.abs(th.blinkR - th.blink) < 0.01);
});

// Real footage: 30 s of a public-domain talking-head video at 30 fps, run through FaceLandmarker by test/probe.html.
// Blinks were labelled by eye from the frames (frame numbers, 1-based). Talking makes it harder than a staring player.
test("real video: catches most real blinks and nothing else", async () => {
  const { frames: rows } = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("fixtures/address-signals.json", import.meta.url)));
  const BLINKS = [19, 51, 98, 163, 221, 259, 302, 402, 438, 524, 551, 574, 645, 677, 801];
  const SMILES = [865, 876];   // the closing "thank you" smile
  const judge = createJudge({ ...DEFAULTS, blink: 0.45 });
  const hits = [];
  rows.forEach((r, i) => {
    const t = (i * 1001) / 30;
    const sig = r ? { t, face: true, blinkL: r[0], blinkR: r[1], smile: r[2], jaw: r[3], yaw: r[4], pitch: r[5] } : { t, face: false };
    const v = judge.update(sig);
    if (v) { hits.push([i + 1, v]); judge.reset(); }
  });
  const near = (list, f) => list.some((b) => Math.abs(b - f) <= 4);
  const wrong = hits.filter(([f, v]) => !(v === "blink" ? near(BLINKS, f) : v === "smile" && near(SMILES, f)));
  const caught = BLINKS.filter((b) => hits.some(([f]) => Math.abs(b - f) <= 4));
  assert.deepEqual(wrong, [], "false alarms");
  assert.ok(caught.length >= 11, `caught ${caught.length}/${BLINKS.length}: ${caught}`);
  assert.ok(hits.some(([, v]) => v === "smile"), "missed the smile");
});
