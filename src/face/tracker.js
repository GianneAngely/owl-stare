// Camera + MediaPipe FaceLandmarker. Everything runs on this device; no frame is ever sent anywhere.
import { FaceLandmarker, FilesetResolver } from "../../lib/mediapipe/vision_bundle.mjs";
import { toSignals } from "./signals.js";

// the itch build ships only the SIMD wasm (upload limit 10 MB): Chrome 91+, Firefox 89+, Safari / iOS 16.4+
export const simdSupported = () => FilesetResolver.isSimdSupported();

export async function openCamera(video) {
  if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("no camera api"), { kind: "unsupported" });
  let stream;
  try {
    // 720p when the camera has it: a face 1 m away is then big enough for the blink blendshapes (Angel, 18 Oct)
    stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } });
  } catch (e) {
    const kind = { NotAllowedError: "denied", SecurityError: "denied", NotFoundError: "nocamera", OverconstrainedError: "nocamera", NotReadableError: "busy" }[e.name] ?? "error";
    throw Object.assign(e, { kind });
  }
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();
  return stream;
}

export async function loadLandmarker() {
  const files = await FilesetResolver.forVisionTasks(new URL("../../lib/mediapipe/wasm", import.meta.url).href);
  const options = (delegate) => ({
    baseOptions: { modelAssetPath: new URL("../../models/face_landmarker.task", import.meta.url).href, delegate },
    runningMode: "VIDEO", numFaces: 1, outputFaceBlendshapes: true, outputFacialTransformationMatrixes: true,
    // lower than the 0.5 defaults so small, far-away faces are still found and kept
    minFaceDetectionConfidence: 0.3, minFacePresenceConfidence: 0.3,
  });
  try {
    return await FaceLandmarker.createFromOptions(files, options("GPU"));
  } catch {
    return await FaceLandmarker.createFromOptions(files, options("CPU"));
  }
}

// One frame -> signals. Far-away faces are small in the frame, so once a face is found the next frames look at a
// square crop around it (zoomed to SIZE px) instead of the whole picture: the detector and the landmark model
// both see a bigger face. state keeps the last face box (normalised to the source) between frames.
const SIZE = 640;
const TILES = [[0.5, 0.4], [0, 0], [1 / 3, 0], [2 / 3, 0], [1, 0], [0, 1], [1 / 3, 1], [2 / 3, 1], [1, 1]];   // x, y as fractions of the free range
let canvas = null;
export function analyze(landmarker, source, t, state) {
  const sw = source.videoWidth ?? source.naturalWidth ?? source.width, sh = source.videoHeight ?? source.naturalHeight ?? source.height;
  canvas ??= Object.assign(document.createElement("canvas"), { width: SIZE, height: SIZE });
  const g = canvas.getContext("2d", { willReadFrequently: false });
  // the crop only moves when the face nears its edge or changes size a lot: the landmarker tracks from frame to
  // frame and a jumping window would throw it off
  const b = state.box;
  let crop = state.crop;
  if (b && b.w < 0.28) {                         // a small face: zoom on it
    const want = Math.min(Math.max(b.w * sw, b.h * sh) * 3, Math.min(sw, sh));
    const fx = b.cx * sw, fy = b.cy * sh;
    const stale = !crop || crop.full || want / crop.side < 0.3 || want / crop.side > 1.1 ||
      fx < crop.x + crop.side * 0.3 || fx > crop.x + crop.side * 0.7 || fy < crop.y + crop.side * 0.3 || fy > crop.y + crop.side * 0.7;
    if (stale) crop = { x: Math.max(0, Math.min(sw - want, fx - want / 2)), y: Math.max(0, Math.min(sh - want, fy - want / 2)), side: want };
  } else if (!b && crop && !crop.full && (state.miss ?? 0) < 20) {
    // just lost a zoomed face: keep looking in the same window for ~0.7 s before scanning again (far faces drop out for a few frames)
  } else if (b) {                                // a big face: the whole picture, letterboxed into the square
    const side = Math.max(sw, sh); crop = { x: (sw - side) / 2, y: (sh - side) / 2, side, full: true };
  } else {                                       // no face yet: the whole picture, then overlapping zoomed tiles in turn
    state.scan = ((state.scan ?? -1) + 1) % (TILES.length + 1);
    const side = Math.max(sw, sh);
    if (state.scan === 0) crop = { x: (sw - side) / 2, y: (sh - side) / 2, side, full: true };
    else { const [tx, ty] = TILES[state.scan - 1], ts = Math.min(sw, sh) * 0.6; crop = { x: tx * (sw - ts), y: ty * (sh - ts), side: ts }; }
  }
  state.crop = crop;
  g.fillStyle = "#000"; g.fillRect(0, 0, SIZE, SIZE);
  if (crop.full) { const k = SIZE / crop.side; g.drawImage(source, 0, 0, sw, sh, -crop.x * k, -crop.y * k, sw * k, sh * k); }
  else g.drawImage(source, crop.x, crop.y, crop.side, crop.side, 0, 0, SIZE, SIZE);
  const result = landmarker.detectForVideo(canvas, t);
  const pts = result.faceLandmarks?.[0];
  if (pts) {
    let x0 = 1, x1 = 0, y0 = 1, y1 = 0;
    for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    const k = crop.side;   // canvas-normalised -> source-normalised
    state.box = { cx: (crop.x + (x0 + x1) / 2 * k) / sw, cy: (crop.y + (y0 + y1) / 2 * k) / sh, w: (x1 - x0) * k / sw, h: (y1 - y0) * k / sh };
    state.miss = 0;
  } else { state.box = null; state.miss = (state.miss ?? 0) + 1; }   // lost it: retry the window, then scan again
  return { ...toSignals(result, t), size: state.box?.w ?? 0 };   // size: face width as a share of the camera picture
}

// Calls onSignal(sig) for every new camera frame (at most ~30 per second).
export function track(video, landmarker, onSignal) {
  let raf = 0, lastFrame = -1, lastRun = 0;
  const state = {};
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    if (video.readyState < 2 || video.currentTime === lastFrame || now - lastRun < 30) return;
    lastFrame = video.currentTime;
    lastRun = now;
    onSignal(analyze(landmarker, video, now, state));
  };
  loop();
  return () => cancelAnimationFrame(raf);
}
