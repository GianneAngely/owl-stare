// Turns calibration samples into per-player thresholds.
// relax: signals while looking at the camera with a straight face; blink / smile: signals while asked to do that.
export const DEFAULTS = { blink: 0.5, smile: 0.5, jaw: 0.35, yaw: 25, pitch: 20, yaw0: 0, pitch0: 0 };

const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const pct = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// threshold sits between the player's resting level and their peak, never too close to either
function between(rest, peak, fallback, lo, hi, k, floor = 0) {
  if (peak - rest < 0.15) return { value: clamp(Math.max(fallback, rest + 0.15), lo, hi), ok: false };
  return { value: clamp(Math.max(rest + floor, rest + (peak - rest) * k), lo, hi), ok: true };
}
// Blinks: the calibration blink is slow and deliberate and peaks high, a real blink mid-stare is quick and peaks much
// lower (more so when the face is far from the camera), so the line sits 30% of the way up, at least 0.12 over rest.
const BLINK_K = 0.3, BLINK_FLOOR = 0.12;

export function calibrate({ relax, blink, smile }) {
  const faces = (a) => a.filter((s) => s.face);
  relax = faces(relax); blink = faces(blink); smile = faces(smile);
  if (relax.length < 5) return { ok: false, problem: "noface", th: { ...DEFAULTS } };
  const eye = (s) => (s.blinkL + s.blinkR) / 2;
  const b = between(pct(relax.map(eye), 0.9), blink.length ? Math.max(...blink.map(eye)) : 0, DEFAULTS.blink, 0.25, 0.8, BLINK_K, BLINK_FLOOR);
  // each eye's own threshold too (a wink is judged per eye; eyes rest and close at different levels, more so far away)
  const one = (k) => between(pct(relax.map((s) => s[k]), 0.9), blink.length ? Math.max(...blink.map((s) => s[k])) : 0, DEFAULTS.blink, 0.25, 0.8, BLINK_K, BLINK_FLOOR).value;
  const m = between(pct(relax.map((s) => s.smile), 0.9), smile.length ? Math.max(...smile.map((s) => s.smile)) : 0, DEFAULTS.smile, 0.2, 0.75, 0.45);
  const th = {
    ...DEFAULTS,
    blink: b.value,
    blinkL: one("blinkL"),
    blinkR: one("blinkR"),
    smile: m.value,
    jaw: clamp(pct(relax.map((s) => s.jaw), 0.9) + 0.25, 0.25, 0.6),
    yaw0: avg(relax.map((s) => s.yaw)),
    pitch0: avg(relax.map((s) => s.pitch)),
  };
  return { ok: b.ok && m.ok, problem: !b.ok ? "blink" : !m.ok ? "smile" : null, th };
}
