// Decides when the player has lost. Pure: feed it signals with timestamps (ms), it answers null or the reason.
// Each condition must hold for a while so single noisy frames never end a match.
// A real blink is only above threshold for ~70-130 ms (2-4 frames at 30 fps), so blink needs two frames in a row (>= 30 ms apart).
export const HOLD = { blink: 30, smile: 150, away: 500 };
export const WINK = 0.2;   // how far past its own threshold one eye must go to count alone

export function createJudge(th) {
  const since = { blink: null, smile: null, away: null };

  function hold(key, on, t) {
    if (!on) return (since[key] = null), false;
    since[key] ??= t;
    return t - since[key] >= HOLD[key];
  }

  return {
    update(sig) {
      const t = sig.t;
      const away = !sig.face || Math.abs(sig.yaw - th.yaw0) > th.yaw || Math.abs(sig.pitch - th.pitch0) > th.pitch;
      if (hold("away", away, t)) return "away";
      if (!sig.face) return (since.blink = since.smile = null), null;
      // both eyes closing together, OR one eye shut on its own (a wink counts, Angel 18 Oct). The one-eye path needs
      // that eye clearly past its own calibrated threshold and the other eye still open, so squinting or smiling
      // (both eyes narrow a little) never trips it.
      const thL = th.blinkL ?? th.blink, thR = th.blinkR ?? th.blink;
      const wink = (sig.blinkL > Math.min(0.92, thL + WINK) && sig.blinkR < thR) || (sig.blinkR > Math.min(0.92, thR + WINK) && sig.blinkL < thL);
      // a smile pushes the cheeks up and narrows both eyes: while smiling, the two-eye line moves up so it's judged a smile
      const lift = sig.smile > th.smile * 0.6 ? 0.15 : 0;
      const blink = (sig.blinkL + sig.blinkR) / 2 > th.blink + lift || wink;
      const smile = sig.smile > th.smile || (sig.jaw > th.jaw && sig.smile > th.smile * 0.6);
      if (hold("blink", blink, t)) return "blink";
      if (hold("smile", smile, t)) return "smile";
      return null;
    },
    reset() { since.blink = since.smile = since.away = null; },
  };
}
