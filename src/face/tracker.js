// Camera + MediaPipe FaceLandmarker. Everything runs on this device; no frame is ever sent anywhere.
import { FaceLandmarker, FilesetResolver } from "../../lib/mediapipe/vision_bundle.mjs";
import { toSignals } from "./signals.js";

// the itch build ships only the SIMD wasm (upload limit 10 MB): Chrome 91+, Firefox 89+, Safari / iOS 16.4+
export const simdSupported = () => FilesetResolver.isSimdSupported();

export async function openCamera(video) {
  if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("no camera api"), { kind: "unsupported" });
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } });
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
  });
  try {
    return await FaceLandmarker.createFromOptions(files, options("GPU"));
  } catch {
    return await FaceLandmarker.createFromOptions(files, options("CPU"));
  }
}

// Calls onSignal(sig) for every new camera frame (at most ~30 per second).
export function track(video, landmarker, onSignal) {
  let raf = 0, lastFrame = -1, lastRun = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    if (video.readyState < 2 || video.currentTime === lastFrame || now - lastRun < 30) return;
    lastFrame = video.currentTime;
    lastRun = now;
    onSignal(toSignals(landmarker.detectForVideo(video, now), now));
  };
  loop();
  return () => cancelAnimationFrame(raf);
}
