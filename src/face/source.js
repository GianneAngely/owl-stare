// The one face feed the game listens to: the real camera + FaceLandmarker, or (?fake) signals a test script sets on window.fakeFace.
import { openCamera, loadLandmarker, track, simdSupported } from "./tracker.js";

const listeners = new Set();
export const face = { latest: null, ready: false, fake: new URLSearchParams(location.search).has("fake"), video: null };
const debug = new URLSearchParams(location.search).has("debug") ? (await import("./debug.js")).showDebug : null;
const emit = (s) => { face.latest = s; listeners.forEach((f) => f(s)); debug?.(s); };
export const onFace = (f) => (listeners.add(f), () => listeners.delete(f));

// step 1: the browser permission prompt. Throws with e.kind = nosimd | denied | nocamera | busy | unsupported | error
export async function startCamera(video) {
  face.video = video;
  if (face.fake) {
    if (window.fakeFace?.nosimd) throw Object.assign(new Error("nosimd"), { kind: "nosimd" });
    if (window.fakeFace?.deny) throw Object.assign(new Error("denied"), { kind: "denied" });
    return;
  }
  // checked before the camera prompt, so nobody allows the camera for a game that can't run
  if (!(await simdSupported())) throw Object.assign(new Error("no wasm simd"), { kind: "nosimd" });
  await openCamera(video);
}

// phones pause the camera video when the tab or app goes to the background; start it again on return
document.addEventListener("visibilitychange", () => { if (!document.hidden && face.video?.srcObject && face.video.paused) face.video.play().catch(() => {}); });

// step 2: load the model and start emitting signals
export async function startTracking() {
  if (face.ready) return;
  if (face.fake) {
    window.fakeFace ??= {};
    setInterval(() => emit({ face: true, blinkL: 0.08, blinkR: 0.08, smile: 0.03, jaw: 0.05, yaw: 0, pitch: 0, ...window.fakeFace, t: performance.now() }), 33);
  } else {
    track(face.video, await loadLandmarker(), emit);
  }
  face.ready = true;
}
