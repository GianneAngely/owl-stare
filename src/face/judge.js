// Decides when the player has lost. Pure: feed it signals with timestamps (ms), it answers null or the reason.
// Each condition must hold for a while so single noisy frames never end a match.
// A real blink is only above threshold for ~70-130 ms (2-4 frames at 30 fps), so blink needs two frames in a row (>= 30 ms apart).
export const HOLD = { blink: 30, smile: 150, away: 500, lost: 1500 };   // lost: no face when it was last seen far away
export const WINK = 0.2;   // how far past its own threshold one eye must go to count alone (blendshapes only)
export const SHUT = 0.5;   // an eye under half its resting opening (face mesh) is shut
const FAR = 0.12;          // a face narrower than this share of the picture is far from the camera

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export function createJudge(th) {
  const since = { blink: null, smile: null, away: null };
  // where the head rests: starts at the calibrated pose and follows slowly (a player who steps back faces the camera
  // from a new angle), never more than 15 degrees from calibration, so turning away still counts
  const base = { yaw: th.yaw0, pitch: th.pitch0, t: null };
  let lastSize = 1;

  function hold(key, on, t, ms = HOLD[key]) {
    if (!on) return (since[key] = null), false;
    since[key] ??= t;
    return t - since[key] >= ms;
  }

  return {
    update(sig) {
      const t = sig.t;
      if (sig.face && sig.size) lastSize = sig.size;
      // small far faces give noisier head angles: up to 1.6x the room at a face 5% of the picture wide
      const loose = 1 + 0.6 * clamp((0.15 - (sig.size || 1)) / 0.1, 0, 1);
      const turned = sig.face && (Math.abs(sig.yaw - base.yaw) > th.yaw * loose || Math.abs(sig.pitch - base.pitch) > th.pitch * loose);
      if (sig.face && !turned) {
        const k = base.t == null ? 0 : clamp((t - base.t) / 4000, 0, 1);
        base.yaw = clamp(base.yaw + (sig.yaw - base.yaw) * k, th.yaw0 - 15, th.yaw0 + 15);
        base.pitch = clamp(base.pitch + (sig.pitch - base.pitch) * k, th.pitch0 - 15, th.pitch0 + 15);
      }
      base.t = t;
      // a far face drops out for a few frames while the tracker finds it again: give it longer before "away"
      if (hold("away", !sig.face || turned, t, !sig.face && lastSize < FAR ? HOLD.lost : HOLD.away)) return "away";
      if (!sig.face) return (since.blink = since.smile = null), null;
      // a smile pushes the cheeks up and narrows both eyes: while smiling, the eye lines move so it's judged a smile
      const smiling = sig.smile > th.smile * 0.6;
      // EITHER eye shut loses (a wink counts, Angel 18 + 19 Oct). The blink blendshapes move both eyes together
      // (a wink reads ~0.6 on both), so one eye is judged from the face mesh: lid gap against its resting gap.
      const shut = (ear, rest) => ear != null && rest > 0 && ear / rest < SHUT - (smiling ? 0.15 : 0);
      const thL = th.blinkL ?? th.blink, thR = th.blinkR ?? th.blink;
      const wink = shut(sig.earL, th.earL) || shut(sig.earR, th.earR) ||
        (sig.blinkL > Math.min(0.92, thL + WINK) && sig.blinkR < thR) || (sig.blinkR > Math.min(0.92, thR + WINK) && sig.blinkL < thL);
      const blink = (sig.blinkL + sig.blinkR) / 2 > th.blink + (smiling ? 0.15 : 0) || wink;
      const smile = sig.smile > th.smile || (sig.jaw > th.jaw && smiling);
      if (hold("blink", blink, t)) return "blink";
      if (hold("smile", smile, t)) return "smile";
      return null;
    },
    reset() { since.blink = since.smile = since.away = null; },
  };
}
