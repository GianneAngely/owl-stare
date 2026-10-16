// Shareable result card (GDD §6): the owl, what happened and the game's name. Drawn from the owl sprites and text only,
// never from the camera, so no face can end up in it.
import { INK, PAPER, BELLY, YELLOW } from "./art/owl.js";
import { FONT } from "./ui.js";

// the itch page the share text and card point to
export const PLAY_URL = "https://gianneangely.itch.io/owl-stare";   // from the manager, 16 Oct; Angel still to confirm
const WHY = { blink: "I blinked", smile: "I smiled", away: "I looked away" };

export function cardText(o, r, champion) {
  const head = champion ? "I out-stared every owl!" : r.won ? `I out-stared ${o.name}!` : `${o.name} out-stared me`;
  const line = r.won ? `${o.seconds} s without a blink, a smile or a peek away.` : `${r.seconds.toFixed(1)} s, then ${WHY[r.reason]}.`;
  return { head, line, share: `${head} ${line} Can you out-stare an owl?${PLAY_URL ? " " + PLAY_URL : ""}` };
}

const image = (src) => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; });

// fit text on one line, shrinking from size down
function fitText(g, str, x, y, size, maxW, weight = 700) {
  for (; size > 20; size -= 2) { g.font = `${weight} ${size}px ${FONT}`; if (g.measureText(str).width <= maxW) break; }
  g.fillText(str, x, y);
}

export async function cardBlob(o, r, champion) {
  const W = 1080, H = 1080, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d"), { head, line } = cardText(o, r, champion);
  await document.fonts?.load(`700 64px ${FONT}`).catch(() => {});
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.strokeStyle = INK; g.lineWidth = 10; g.lineJoin = g.lineCap = "round";
  g.fillStyle = BELLY; g.beginPath(); g.roundRect(60, 60, W - 120, H - 120, 48); g.fill(); g.stroke();
  const owl = await image(`assets/owls/${o.id}-${r.won ? "shock" : "laugh"}.webp`);
  const n = o.twins ? 2 : 1, k = Math.min((n > 1 ? 470 : 560) / owl.height, (W - 220) / n / owl.width), ow = owl.width * k, oh = owl.height * k;
  for (let i = 0; i < n; i++) g.drawImage(owl, W / 2 - ow / 2 + (i - (n - 1) / 2) * ow * 0.95, 670 - oh, ow, oh);
  g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
  fitText(g, head, W / 2, 750, 84, W - 200);
  fitText(g, line, W / 2, 840, 46, W - 220, 400);
  // footer: yellow tag with the game's name
  g.fillStyle = YELLOW; g.beginPath(); g.roundRect(W / 2 - 170, 905, 340, 76, 38); g.fill(); g.lineWidth = 7; g.stroke();
  g.fillStyle = INK; fitText(g, PLAY_URL ? "Owl Stare · itch.io" : "Owl Stare", W / 2, 940, 50, 320);
  return new Promise((ok) => c.toBlob(ok, "image/png"));
}

const fileName = (o) => `owl-stare-${o.id}.png`;

export async function saveCard(o, r, champion) {
  const url = URL.createObjectURL(await cardBlob(o, r, champion));
  const a = Object.assign(document.createElement("a"), { href: url, download: fileName(o) });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "saved";
}

// share sheet with the image when the browser can, else text only, else copy the text. Returns what happened.
export async function shareCard(o, r, champion) {
  const { share } = cardText(o, r, champion);
  try {
    const file = new File([await cardBlob(o, r, champion)], fileName(o), { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text: share }); return "shared"; }
    if (navigator.share) { await navigator.share({ text: share }); return "shared"; }
  } catch (e) { if (e.name === "AbortError") return "cancelled"; }
  try { await navigator.clipboard.writeText(share); return "copied"; } catch { return "failed"; }
}
