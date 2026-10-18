// One FaceLandmarker result -> the few numbers the game cares about.
const DEG = 180 / Math.PI;
// eye aspect ratio from the face mesh: lid gap over eye width, per eye. The blink blendshapes move both eyes together
// (a wink reads ~0.6 on both), the mesh lids move on their own, so winks are judged from this.
const EYES = { L: [362, 385, 387, 263, 373, 380], R: [33, 160, 158, 133, 153, 144] };   // subject's left / right
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const ear = (p, [a, b, c, d, e, f]) => (dist(p[b], p[f]) + dist(p[c], p[e])) / (2 * dist(p[a], p[d]));

export function toSignals(result, t) {
  const shapes = result.faceBlendshapes?.[0]?.categories;
  if (!shapes) return { t, face: false };
  const s = {};
  for (const c of shapes) s[c.categoryName] = c.score;
  // 4x4 column-major face pose; element (row r, col c) is m[c * 4 + r]
  const m = result.facialTransformationMatrixes?.[0]?.data;
  const p = result.faceLandmarks?.[0];
  return {
    t,
    face: true,
    blinkL: s.eyeBlinkLeft,
    blinkR: s.eyeBlinkRight,
    smile: (s.mouthSmileLeft + s.mouthSmileRight) / 2,
    jaw: s.jawOpen,
    earL: p ? ear(p, EYES.L) : null,
    earR: p ? ear(p, EYES.R) : null,
    yaw: m ? Math.atan2(m[8], m[10]) * DEG : 0,
    pitch: m ? Math.asin(Math.max(-1, Math.min(1, -m[9]))) * DEG : 0,
  };
}
