// One FaceLandmarker result -> the few numbers the game cares about.
const DEG = 180 / Math.PI;

export function toSignals(result, t) {
  const shapes = result.faceBlendshapes?.[0]?.categories;
  if (!shapes) return { t, face: false };
  const s = {};
  for (const c of shapes) s[c.categoryName] = c.score;
  // 4x4 column-major face pose; element (row r, col c) is m[c * 4 + r]
  const m = result.facialTransformationMatrixes?.[0]?.data;
  return {
    t,
    face: true,
    blinkL: s.eyeBlinkLeft,
    blinkR: s.eyeBlinkRight,
    smile: (s.mouthSmileLeft + s.mouthSmileRight) / 2,
    jaw: s.jawOpen,
    yaw: m ? Math.atan2(m[8], m[10]) * DEG : 0,
    pitch: m ? Math.asin(Math.max(-1, Math.min(1, -m[9]))) * DEG : 0,
  };
}
