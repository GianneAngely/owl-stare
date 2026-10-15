// Decides when the player has lost. Pure: feed it signals with timestamps (ms), it answers null or the reason.
// Each condition must hold for a while so single noisy frames never end a match.
// A real blink is only above threshold for ~70-130 ms (2-4 frames at 30 fps), so blink needs two frames in a row (>= 30 ms apart).
export const HOLD = { blink: 30, smile: 150, away: 500 };

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
      const blink = (sig.blinkL + sig.blinkR) / 2 > th.blink;
      const smile = sig.smile > th.smile || (sig.jaw > th.jaw && sig.smile > th.smile * 0.6);
      if (hold("blink", blink, t)) return "blink";
      if (hold("smile", smile, t)) return "smile";
      return null;
    },
    reset() { since.blink = since.smile = since.away = null; },
  };
}
