// ?debug: live numbers in the corner, so a player whose blinks or winks aren't caught can send a screenshot.
// Each eye: blendshape (0 open .. 1 shut) and mesh opening as a share of the calibrated rest (shut under 0.5).
import { load } from "../store.js";
import { SHUT } from "./judge.js";

const box = Object.assign(document.createElement("pre"), { id: "debug" });
Object.assign(box.style, { position: "fixed", left: "8px", bottom: "8px", margin: 0, padding: "6px 8px", zIndex: 10, pointerEvents: "none",
  font: "12px/1.35 ui-monospace, Menlo, monospace", color: "#fff", background: "rgba(0,0,0,.65)", borderRadius: "6px" });
document.body.append(box);
let last = 0;
const f = (x, d = 2) => (x == null || Number.isNaN(x) ? "-" : x.toFixed(d));

export function showDebug(s) {
  if (s.t - last < 100) return;
  last = s.t;
  if (!s.face) return (box.textContent = "no face");
  const th = load().th ?? {};
  const eye = (k) => {
    const r = th[`ear${k}`] ? s[`ear${k}`] / th[`ear${k}`] : null;
    return `eye ${k}  blend ${f(s[`blink${k}`])} / ${f(th[`blink${k}`])}   open ${f(r)}${r != null && r < SHUT ? "  SHUT" : ""}`;
  };
  box.textContent = [
    `face ${f((s.size ?? 0) * 100, 1)}% of picture`,
    eye("L"), eye("R"),
    `smile ${f(s.smile)} / ${f(th.smile)}   jaw ${f(s.jaw)}`,
    `yaw ${f(s.yaw, 0)} (rest ${f(th.yaw0, 0)})   pitch ${f(s.pitch, 0)} (rest ${f(th.pitch0, 0)})`,
  ].join("\n");
}
