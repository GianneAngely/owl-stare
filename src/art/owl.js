// Doodle owls drawn as SVG, matched one by one to the concept lineup (concept/lineup.jpg, Angel 16 Oct 2026):
// thick uneven black brush-pen lines, flat cream / light grey / grey / white fills, a pale facial disc,
// small heart-shaped chest marks, dark stick legs. A displacement filter wobbles every line like a brush pen.
export const INK = "#1f1b18", PAPER = "#f7f3e8", CREAM = "#ede4c6", BELLY = "#fbf8ee", GREY = "#6f665f", YELLOW = "#f0c75a", BLUE = "#b9d0e6", PINK = "#ee9aa0";
const BEAK = "#eec872";

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
  `<defs><filter id="brush" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7"/>` +
  `<feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>` +
  `<g filter="url(#brush)" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" fill="none">${body}</g></svg>`;

// a brush-pen line: one stroke with a small break, plus thicker dabs along it so the width swells and thins
const ink = (d, w = 9, color = INK) => `<path d="${d}" stroke="${color}" stroke-width="${w}" pathLength="100" stroke-dasharray="47 1.6 51.4"/>` +
  `<path d="${d}" stroke="${color}" stroke-width="${w * 1.5}" pathLength="100" stroke-dasharray="0 9 20 17 24 30"/>`;
const darker = (c, k = 0.9) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(c.slice(i, i + 2), 16) * k).toString(16).padStart(2, "0")).join("");
const fill = (d, color) => `<path d="${d}" fill="${color}" stroke="none"/>`;

// tiny seeded random, so the fluff and speckles come out the same every load
const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// An owl is three stacked textures on the same 400x440 canvas: body (per owl), face (shared, swapped by tricks)
// and front (per-owl props over the face). Eyes always sit at (150,170) and (250,170), the beak at (200,200).
// look: { body, disc, wing, shade, hw (half width), top, bottom, fluffy, speckles, twitch, crown, shawl,
//         headphones, glasses, book, megaphone, knitting }
const bean = (hw, top, bottom) => {
  const H = bottom - top, r = (k) => 200 + hw * k, l = (k) => 200 - hw * k, y = (k) => top + H * k;
  return `M200 ${top} C${r(0.5)} ${top} ${r(0.86)} ${y(0.05)} ${r(0.9)} ${y(0.3)} C${r(1.05)} ${y(0.6)} ${r(0.92)} ${bottom} 200 ${bottom} ` +
    `C${l(0.92)} ${bottom} ${l(1.05)} ${y(0.6)} ${l(0.9)} ${y(0.3)} C${l(0.86)} ${y(0.05)} ${l(0.5)} ${top} 200 ${top} Z`;
};
// pale heart-shaped face: notch between the brows, round under the eyes
const disc = (dw) => `M200 122 C182 100 ${200 - dw} 96 ${196 - dw} 150 C${194 - dw} 206 150 250 200 244 C250 250 ${206 + dw} 206 ${204 + dw} 150 C${200 + dw} 96 218 100 200 122 Z`;
const brows = (dw) => `M${194 - dw} 166 C${198 - dw} 98 182 98 200 122 C218 98 ${202 + dw} 98 ${206 + dw} 166`;
const wing = (sx, sy, tx, ty, side) => {   // hangs from the shoulder, tip flicks out at the bottom
  const s = side;
  return `M${sx} ${sy} C${sx - 22 * s} ${sy + 60} ${tx - 26 * s} ${ty - 40} ${tx - 10 * s} ${ty + 12} C${tx + 34 * s} ${ty - 24} ${sx + 44 * s} ${sy + 80} ${sx} ${sy}`;
};
const heart = (x, y, s = 1) => `M${x - 11 * s} ${y - 8 * s} L${x} ${y + 6 * s} L${x + 11 * s} ${y - 8 * s}`;
const marks = (y, rows = [3, 2, 1], gap = 46) => rows.map((n, i) => Array.from({ length: n }, (_, j) => heart(200 + (j - (n - 1) / 2) * gap, y + i * 34))
  .join(" ")).join(" ");
const legs = (bottom, w = 7) => [168, 232].map((x) => `M${x} ${bottom - 6} V${bottom + 16} M${x} ${bottom + 16} l-12 9 M${x} ${bottom + 16} v12 M${x} ${bottom + 16} l12 9`).join(" ");

function fluffBall() {   // Hoot: a fluffy baby, grey at the edges, spiky ink fluff all round, stick legs
  const R = rnd(11), cx = 200, cy = 236, r = 150;
  let fluff = "";
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2 + R() * 0.05, len = 12 + R() * 20, rr = r - 8 + R() * 14;
    const x1 = cx + Math.cos(a) * (rr - len * 0.4), y1 = cy + Math.sin(a) * (rr - len * 0.4), x2 = cx + Math.cos(a + (R() - 0.5) * 0.12) * (rr + len * 0.6), y2 = cy + Math.sin(a) * (rr + len * 0.6);
    fluff += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${R() < 0.35 ? "#8d8b85" : INK}" stroke-width="${(2.5 + R() * 3.5).toFixed(1)}" opacity="${(0.65 + R() * 0.35).toFixed(2)}"/>`;
  }
  let wisps = "";
  for (let i = 0; i < 40; i++) {
    const a = R() * Math.PI * 2, d = r * (0.62 + R() * 0.3), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    wisps += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(a) * 14).toFixed(1)} ${(Math.sin(a) * 14).toFixed(1)}" stroke="#a9a8a1" stroke-width="5"/>`;
  }
  return `<defs><radialGradient id="fz" cx="0.48" cy="0.42" r="0.6"><stop offset="0.45" stop-color="#f6f6f2"/><stop offset="1" stop-color="#b9b8b1"/></radialGradient></defs>` +
    `<path d="M178 372 L172 432 M222 372 L228 432" stroke-width="6"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#fz)" stroke="none"/>${wisps}${fluff}`;
}

function bodyLayer({ body = CREAM, disc: dc, wing: wc, shade, hw = 150, top = 48, bottom = 400, ...k } = {}) {
  if (k.fluffy) return fluffBall();
  const H = bottom - top, shape = bean(hw, top, bottom), dw = Math.min(hw * 0.78, 112);
  const sh = top + H * 0.36, wx = hw * 0.86, tx = hw * 0.86, ty = bottom - 34;
  const wings = [wing(200 - wx, sh, 200 - tx, ty, 1), wing(200 + wx, sh, 200 + tx, ty, -1)];
  const R = rnd(5);
  const speckles = k.speckles ? Array.from({ length: 80 }, (_, i) => {
    const x = 200 - hw * 0.85 + (i % 8 + (Math.floor(i / 8) % 2) * 0.5) * hw * 0.22 + (R() - 0.5) * 12, y = top + 18 + Math.floor(i / 8) * H * 0.095 + (R() - 0.5) * 12;
    const inBody = Math.abs(x - 200) < hw * (y < top + H * 0.2 ? 0.7 : 0.88) && y < bottom - 24;
    return !inBody || Math.hypot((x - 200) / 118, (y - 172) / 80) < 1 ? "" : `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="4.5" ry="6.5" fill="${GREY}" stroke="none" opacity=".8"/>`;
  }).join("") : "";
  return `${shade ? `<defs><linearGradient id="sh" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0.45" stop-color="${body}"/><stop offset="1" stop-color="${shade}"/></linearGradient></defs>` : ""}
  <path d="${legs(bottom)}" stroke-width="7"/>
  ${fill(shape, shade ? "url(#sh)" : body)}
  ${dc ? fill(disc(dw), dc) + `<path d="${brows(dw)}" stroke-width="4" opacity=".75"/>` : ""}
  ${speckles}
  <path d="${marks(top + H * 0.6)}" stroke="${GREY}" stroke-width="6"/>
  ${wings.map((w) => `<path d="${w} Z" fill="${wc ?? darker(body)}" stroke="none"/>` + ink(w, 6)).join("")}
  ${ink(shape, 9)}
  ${k.twitch ? `<path d="M30 200 q-14 34 0 68 M14 186 q-20 48 0 96 M370 200 q14 34 0 68 M386 186 q20 48 0 96 M196 22 q8 -10 14 0" stroke-width="5"/>` : ""}
  ${k.crown ? `<g transform="rotate(12 272 22)"><path d="M244 40 L238 8 L258 24 L272 2 L286 24 L306 8 L300 40 Z" fill="${YELLOW}" stroke-width="5"/></g>` : ""}`;
}

function frontLayer(k = {}) {
  const hw = k.hw ?? 150, top = k.top ?? 48, dw = Math.min(hw * 0.78, 112);
  return [
    k.shawl && `<path fill-rule="evenodd" d="M200 262 C172 252 ${190 - dw} 214 ${190 - dw} 150 C${190 - dw} 108 160 86 200 86 C240 86 ${210 + dw} 108 ${210 + dw} 150 C${210 + dw} 214 228 252 200 262 Z ` +
      `M200 ${top - 6} C${200 + hw * 0.66} ${top - 6} ${200 + hw * 1.06} ${top + 90} ${200 + hw * 1.04} 316 L${200 + hw * 0.42} 344 L200 262 L${200 - hw * 0.42} 344 L${200 - hw * 1.04} 316 C${200 - hw * 1.06} ${top + 90} ${200 - hw * 0.66} ${top - 6} 200 ${top - 6} Z" fill="#f6f0e1" stroke-width="7"/>` +
      `<path d="${Array.from({ length: 6 }, (_, i) => { const t = (i + 0.5) / 6, x = 200 - hw * (1.04 - 0.62 * t), y = 316 + 28 * t; return `M${x.toFixed(0)} ${y.toFixed(0)} l-2 14`; }).join(" ")} ` +
      `${Array.from({ length: 6 }, (_, i) => { const t = (i + 0.5) / 6, x = 200 + hw * (1.04 - 0.62 * t), y = 316 + 28 * t; return `M${x.toFixed(0)} ${y.toFixed(0)} l2 14`; }).join(" ")}" stroke-width="3"/>` +
      `<circle cx="200" cy="262" r="11" fill="#f6f0e1" stroke-width="5"/>`,
    k.knitting && `<path d="M150 284 L262 350 M250 284 L138 350" stroke-width="5"/><circle cx="148" cy="283" r="5" fill="${INK}" stroke="none"/><circle cx="252" cy="283" r="5" fill="${INK}" stroke="none"/>` +
      `<path d="M172 314 L228 314 L232 352 Q214 362 200 354 Q184 364 168 352 Z" fill="#fff" stroke-width="5"/>` +
      `<path d="M226 350 C268 380 300 420 336 412" stroke-width="3"/><circle cx="352" cy="410" r="24" fill="#f4f2ee" stroke-width="6"/>` +
      `<path d="M334 400 q18 -10 38 4 M330 414 q22 -8 44 4 M342 428 q14 -18 30 -34" stroke-width="3"/>`,
    k.glasses && `<circle cx="150" cy="170" r="32" stroke-width="6"/><circle cx="250" cy="170" r="32" stroke-width="6"/><path d="M182 168 Q200 158 218 168 M118 166 L74 156 M282 166 L326 156" stroke-width="6"/>`,
    k.book && `<path d="M200 266 L142 252 L138 316 L200 330 Z" fill="#dcdad4" stroke-width="6"/><path d="M200 266 L258 252 L262 316 L200 330 Z" fill="#e9e7e2" stroke-width="6"/>` +
      `<path d="M154 272 L190 280 M154 288 L190 296 M210 280 L246 272 M210 296 L246 288" stroke="${GREY}" stroke-width="3"/>` +
      `<path d="M${200 - hw * 0.95} 236 C${200 - hw * 0.8} 310 160 330 140 300 M${200 + hw * 0.95} 236 C${200 + hw * 0.8} 310 240 330 260 300" stroke-width="7"/>`,
    k.megaphone && `<path d="M${200 + hw * 0.92} 250 C${200 + hw * 1.1} 236 316 236 300 214" fill="${k.body}" stroke-width="7"/>` +
      `<path d="M256 206 L356 146 L372 236 L262 234 Z" fill="#efeeea" stroke-width="7"/><ellipse cx="364" cy="191" rx="14" ry="46" fill="#d8d6d0" stroke-width="6" transform="rotate(-8 364 191)"/>` +
      `<path d="M370 128 l8 -14 M386 160 l12 -4 M388 214 l10 6" stroke-width="4"/>`,
    k.headphones && `<path d="M70 176 C58 ${top - 40} 342 ${top - 40} 330 176" stroke-width="16"/><path d="M70 176 C58 ${top - 40} 342 ${top - 40} 330 176" stroke="#a5a098" stroke-width="7"/>` +
      `<rect x="54" y="140" width="36" height="74" rx="17" fill="#9b968f" stroke-width="6"/><rect x="310" y="140" width="36" height="74" rx="17" fill="#9b968f" stroke-width="6"/>` +
      `<rect x="82" y="152" width="14" height="50" rx="6" fill="#6a655f" stroke-width="5"/><rect x="304" y="152" width="14" height="50" rx="6" fill="#6a655f" stroke-width="5"/>`,
  ].filter(Boolean).join("");
}

// eyes: yellow with an ink ring (lineup), or white and wide (Twitchy, shocked faces)
const eye = (x, y, r = 24, look = [0, 0]) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${YELLOW}" stroke-width="5"/><circle cx="${x + look[0]}" cy="${y + look[1]}" r="${r * 0.44}" fill="${INK}" stroke="none"/>` +
  `<circle cx="${x + look[0] - r * 0.18}" cy="${y + look[1] - r * 0.2}" r="${r * 0.13}" fill="#fff" stroke="none"/>`;
const bigEye = (x, y, r, look) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke-width="5"/><circle cx="${x + look[0]}" cy="${y + look[1]}" r="${r * 0.32}" fill="${INK}" stroke="none"/>`;
// half-shut yellow eye under a flat, slanted lid (the boss)
const lidEye = (x, y, r, tilt) => `<path d="M${x - r} ${y - tilt} A${r} ${r} 0 0 0 ${x + r} ${y + tilt} Z" fill="${YELLOW}" stroke-width="5"/>` +
  `<circle cx="${x}" cy="${y + r * 0.35}" r="${r * 0.36}" fill="${INK}" stroke="none"/><path d="M${x - r - 4} ${y - tilt - 1} L${x + r + 4} ${y + tilt + 1}" stroke-width="8"/>`;
const beak = `<path d="M189 192 L211 192 L200 218 Z" fill="${BEAK}" stroke-width="5"/>`;
const drop = (x, y, s = 1) => `<path d="M${x} ${y} c-8 12 -10 20 0 22 c10 -2 8 -10 0 -22 Z" fill="${BLUE}" stroke-width="${4 * s}" transform="rotate(-20 ${x} ${y})"/>`;

const FACES = {
  // looking at you, calm (DJ, the twins)
  idle: eye(150, 170) + eye(250, 170) + beak,
  // the stare: heavy lids
  stare: eye(150, 172) + eye(250, 172) + `<path d="M120 160 Q150 148 180 160 M220 160 Q250 148 280 160" stroke-width="7"/>` + beak,
  blink: `<path d="M124 172 Q150 188 176 172 M224 172 Q250 188 276 172" stroke-width="8"/>` + beak,
  // Hoot, the fluffy baby: two dot eyes and a dot beak
  dots: `<circle cx="158" cy="176" r="13" fill="${INK}" stroke="none"/><circle cx="244" cy="170" r="13" fill="${INK}" stroke="none"/><circle cx="196" cy="206" r="10" fill="${INK}" stroke="none"/>`,
  // Plume: small dark eyes behind the glasses
  specs: `<circle cx="152" cy="172" r="10" fill="${INK}" stroke="none"/><circle cx="252" cy="172" r="10" fill="${INK}" stroke="none"/>` +
    `<circle cx="148" cy="168" r="3" fill="#fff" stroke="none"/><circle cx="248" cy="168" r="3" fill="#fff" stroke="none"/>` + beak,
  // Twitchy: big white jittery eyes, tiny worried mouth
  wide: bigEye(150, 168, 34, [6, 2]) + bigEye(252, 166, 34, [-4, 6]) + beak + `<path d="M194 230 q6 6 12 0" stroke-width="4"/>`,
  // the boss: half-shut, unimpressed
  sleepy: lidEye(150, 176, 26, 2.5) + lidEye(250, 176, 26, -2.5) + `<path d="M194 196 L206 196 L201 222 Z" fill="${INK}" stroke-width="4"/>`,
  // trick: wink + giant eye + tongue (concept screen)
  tongue: `<path d="M120 170 Q146 160 176 176 M124 182 Q148 178 172 180" stroke-width="7"/>` + bigEye(254, 166, 42, [10, 4]) +
    `<path d="M186 196 L216 194 L204 214 Z" fill="${BEAK}" stroke-width="5"/><path d="M186 206 Q200 252 216 210 Z" fill="${INK}" stroke-width="5"/>` +
    `<path d="M192 216 C190 246 214 250 212 220" fill="${PINK}" stroke-width="5"/>` + drop(112, 120) + drop(300, 118),
  // trick: cross-eyed puffed cheeks
  cross: bigEye(150, 170, 32, [14, 6]) + bigEye(250, 170, 32, [-14, 6]) +
    `<circle cx="112" cy="222" r="20" fill="${PINK}" stroke="none" opacity=".7"/><circle cx="288" cy="222" r="20" fill="${PINK}" stroke="none" opacity=".7"/>` +
    `<path d="M178 214 q8 -10 16 0 q8 10 16 0 q8 -10 14 0" stroke-width="7"/><path d="M190 196 L210 196 L200 208 Z" fill="${BEAK}" stroke-width="5"/>`,
  // owl won: laughing
  laugh: `<path d="M122 178 Q150 146 178 178 M222 178 Q250 146 278 178" stroke-width="8"/>` +
    `<path d="M180 196 L220 196 L200 206 Z" fill="${BEAK}" stroke-width="5"/><path d="M182 208 Q200 262 218 208 Z" fill="${PINK}" stroke-width="6"/>` + drop(112, 190) + drop(292, 190),
  // owl lost: shocked
  shock: bigEye(150, 168, 30, [0, 0]) + bigEye(250, 168, 30, [0, 0]) + `<path d="M192 194 L208 194 L200 206 Z" fill="${BEAK}" stroke-width="4"/><ellipse cx="200" cy="222" rx="10" ry="14" fill="${INK}" stroke-width="4"/>` +
    drop(98, 128) + drop(304, 124) + drop(318, 176),
  // Grandma: kind closed-eye smile, little crow's feet
  sweet: `<path d="M126 176 Q150 156 174 176 M226 176 Q250 156 274 176" stroke-width="8"/><path d="M110 168 l-12 -4 M112 182 l-12 4 M290 168 l12 -4 M288 182 l12 4" stroke-width="3"/>` +
    `<circle cx="116" cy="208" r="14" fill="${PINK}" stroke="none" opacity=".5"/><circle cx="284" cy="208" r="14" fill="${PINK}" stroke="none" opacity=".5"/>` + beak,
  // Boomer's HOOT! (lineup pose): squeezed eyes, beak wide open
  shout: `<path d="M122 154 L170 170 L122 186 M278 154 L230 170 L278 186" stroke-width="8"/>` +
    `<path d="M172 190 L228 190 L200 202 Z" fill="${BEAK}" stroke-width="5"/><path d="M174 204 Q200 280 226 204 Z" fill="${INK}" stroke-width="6"/><path d="M186 238 Q200 266 214 238 Z" fill="${PINK}" stroke="none"/>`,
};

export const OWL_FACES = Object.keys(FACES);
export const faceSVG = (face) => svg(400, 440, FACES[face]);
export const bodySVG = (look) => svg(400, 440, bodyLayer(look));
export const frontSVG = (look) => { const f = frontLayer(look); return f && svg(400, 440, f); };
// whole owl in one image (art sheet, result card, cover)
export const owlSVG = (face, look) => svg(400, 440, bodyLayer(look) + FACES[face] + frontLayer(look));


export const featherSVG = () => svg(60, 150,
  `<path d="M30 10 C54 40 56 96 30 132 C6 96 6 40 30 10 Z" fill="${BELLY}" stroke-width="5"/><path d="M30 24 V146" stroke-width="4"/>` +
  `<path d="M30 60 l-12 -10 M30 84 l14 -12 M30 104 l-12 -10" stroke="${GREY}" stroke-width="3"/>`);

export const clockSVG = () => svg(80, 84,
  `<path d="M14 22 a14 14 0 0 1 20 -12 M66 22 a14 14 0 0 0 -20 -12" fill="${YELLOW}" stroke-width="5"/>` +
  `<circle cx="40" cy="46" r="28" fill="${BELLY}" stroke-width="6"/><path d="M40 46 V28 M40 46 L52 54" stroke-width="5"/>` +
  `<path d="M22 72 l-8 8 M58 72 l8 8" stroke-width="5"/>`);

export const zapSVG = () => svg(120, 110,
  `<path d="M14 40 L60 30 L44 58 L106 48 L60 92 L70 66 L20 74 Z" fill="${YELLOW}" stroke="none" opacity=".85"/>` +
  `<path d="M10 36 L58 26 L40 56 L104 44 L62 86" stroke-width="6"/>`);

export const bangSVG = () => svg(60, 110, `<path d="M30 10 L26 72" stroke-width="10"/><circle cx="25" cy="94" r="6" fill="${INK}" stroke="none"/>`);

export const flySVG = () => svg(90, 70,
  `<ellipse cx="30" cy="22" rx="18" ry="16" fill="${BLUE}" stroke-width="4" opacity=".9" transform="rotate(-25 30 22)"/>` +
  `<ellipse cx="58" cy="20" rx="18" ry="16" fill="${BLUE}" stroke-width="4" opacity=".9" transform="rotate(25 58 20)"/>` +
  `<ellipse cx="44" cy="44" rx="16" ry="14" fill="${INK}" stroke-width="4"/><circle cx="58" cy="40" r="5" fill="#fff" stroke="none"/>` +
  `<path d="M32 54 l-8 10 M44 58 v10 M56 54 l8 10" stroke-width="4"/>`);

export const duckSVG = () => svg(130, 110,
  `<path d="M20 62 C20 96 110 100 112 64 C114 44 88 40 74 52 C78 20 40 8 30 34 C28 44 34 50 38 52 C24 50 20 56 20 62 Z" fill="${YELLOW}" stroke-width="6"/>` +
  `<path d="M28 36 L8 40 L28 46 Z" fill="#f0a35e" stroke-width="5"/><circle cx="42" cy="32" r="4" fill="${INK}" stroke="none"/><path d="M60 70 q16 10 32 -4" stroke-width="5"/>`);

export const noteSVG = () => svg(60, 80, `<path d="M22 64 V12 L50 6 V54" stroke-width="6"/><ellipse cx="14" cy="64" rx="12" ry="9" fill="${INK}" stroke-width="4"/><ellipse cx="42" cy="56" rx="12" ry="9" fill="${INK}" stroke-width="4"/>`);

export const yarnSVG = () => svg(80, 80, `<circle cx="40" cy="40" r="32" fill="${PINK}" stroke-width="6"/><path d="M14 30 q26 -12 52 6 M10 46 q30 -10 60 8 M24 66 q20 -30 44 -44" stroke-width="4"/>`);

export const dataURL = (s) => "data:image/svg+xml;base64," + btoa(s);
