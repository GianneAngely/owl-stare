// Doodle owls (style A: chubby egg body, thick ink brush lines, cream feathers, small yellow eyes) drawn as SVG.
// Angel chose this style as the final art (16 Oct 2026).
export const INK = "#2b2622", PAPER = "#f7f3e8", CREAM = "#f3edd9", BELLY = "#fbf8ee", GREY = "#6f665d", YELLOW = "#f2c94c", BLUE = "#b9d0e6", PINK = "#ee9aa0";

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
  `<g stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" fill="none">${body}</g></svg>`;

// An owl is three stacked textures on the same 400x440 canvas: body (per owl), face (shared, swapped by tricks)
// and front (per-owl props that sit over the face, like glasses or a megaphone).
// look: { body, belly, wing, speckles, twitch, tufts, crown, shawl, headphones, glasses, book, megaphone, knitting }
const bodyLayer = ({ body = CREAM, belly = BELLY, wing = body, ...k } = {}) => `
  ${k.tufts ? `<path d="M96 120 L82 34 L150 72 Z M304 120 L318 34 L250 72 Z" fill="${body}" stroke-width="9"/>` : ""}
  <path d="M86 300 C70 330 74 360 98 372 L104 340 Z" fill="${wing}" stroke-width="7"/>
  <path d="M314 300 C330 330 326 360 302 372 L296 340 Z" fill="${wing}" stroke-width="7"/>
  <path d="M200 44 C296 42 356 128 358 246 C360 360 292 414 200 414 C108 414 40 360 42 246 C44 128 104 46 200 44 Z" fill="${body}" stroke="none"/>
  <ellipse cx="200" cy="300" rx="112" ry="100" fill="${belly}" stroke="none"/>
  ${k.speckles ? `<g fill="${GREY}" stroke="none" opacity=".75">${[[120, 96], [160, 76], [240, 76], [280, 96], [104, 132], [296, 132], [86, 200], [314, 200], [96, 250], [304, 250]]
    .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4"/>`).join("")}</g>` : ""}
  <path d="M196 44 C294 40 356 126 358 242 C360 330 326 388 262 408" stroke-width="10"/>
  <path d="M244 412 C218 416 186 416 160 412 C90 400 40 350 42 246 C44 150 90 64 170 48" stroke-width="10"/>
  <path d="M64 230 C46 270 56 318 92 344 C104 310 98 262 64 230 Z" fill="${wing}" stroke-width="8"/>
  <path d="M336 230 C354 270 344 318 308 344 C296 310 302 262 336 230 Z" fill="${wing}" stroke-width="8"/>
  <g stroke="${GREY}" stroke-width="7">
    <path d="M150 276 l10 12 l10 -14"/><path d="M190 266 l10 12 l10 -14"/><path d="M230 276 l10 12 l10 -14"/>
    <path d="M168 318 l9 11 l9 -12"/><path d="M214 318 l9 11 l9 -12"/><path d="M190 356 l9 11 l9 -12"/>
  </g>
  ${k.shawl ? `<path d="M52 226 C110 262 290 262 348 226 C340 290 270 330 200 352 C130 330 60 290 52 226 Z" fill="${BLUE}" stroke-width="8"/>
    <path d="M150 300 l-6 22 M180 318 l-4 22 M220 318 l4 22 M250 300 l6 22" stroke-width="5"/>` : ""}
  <g stroke-width="6"><path d="M156 414 l-8 14 M164 416 v16 M172 414 l8 14"/><path d="M228 414 l-8 14 M236 416 v16 M244 414 l8 14"/></g>
  ${k.twitch ? `<path d="M22 180 q-12 30 0 60 M10 166 q-18 44 0 88 M378 180 q12 30 0 60 M390 166 q18 44 0 88" stroke-width="6"/>` : ""}
  ${k.crown ? `<path d="M162 52 L156 8 L182 30 L200 2 L218 30 L244 8 L238 52 Z" fill="${YELLOW}" stroke-width="7"/>` : ""}`;

const frontLayer = (k = {}) => [
  k.glasses && `<circle cx="150" cy="170" r="36" stroke-width="7"/><circle cx="250" cy="170" r="36" stroke-width="7"/><path d="M186 166 Q200 156 214 166 M114 164 L66 150 M286 164 L334 150" stroke-width="7"/>`,
  k.book && `<path d="M200 330 L120 314 L120 382 L200 398 Z M200 330 L280 314 L280 382 L200 398 Z" fill="#fff" stroke-width="7"/>
    <path d="M136 334 L184 344 M136 352 L184 362 M216 344 L264 334 M216 362 L264 352" stroke="${GREY}" stroke-width="4"/>`,
  k.megaphone && `<path d="M222 236 L330 204 L344 296 L230 258 Z" fill="${YELLOW}" stroke-width="8"/><ellipse cx="337" cy="250" rx="12" ry="47" fill="${BELLY}" stroke-width="7" transform="rotate(-8 337 250)"/>
    <path d="M262 268 L256 300" stroke-width="9"/>`,
  k.knitting && `<path d="M130 300 L270 360 M270 300 L130 360" stroke-width="7"/><rect x="168" y="318" width="64" height="44" rx="6" fill="${PINK}" stroke-width="6"/>
    <path d="M176 330 h48 M176 342 h48 M176 354 h48" stroke="#fff" stroke-width="3"/>
    <circle cx="340" cy="402" r="26" fill="${PINK}" stroke-width="6"/><path d="M322 392 q18 -8 36 6 M318 408 q20 -6 40 6 M232 352 C280 380 300 410 316 404" stroke-width="4"/>`,
  k.headphones && `<path d="M68 150 C56 -4 344 -4 332 150" stroke-width="20"/><path d="M68 150 C56 -4 344 -4 332 150" stroke="${GREY}" stroke-width="7"/><rect x="46" y="140" width="44" height="84" rx="18" fill="${INK}" stroke-width="6"/><rect x="310" y="140" width="44" height="84" rx="18" fill="${INK}" stroke-width="6"/>
    <rect x="58" y="160" width="20" height="44" rx="8" fill="${YELLOW}" stroke="none"/><rect x="322" y="160" width="20" height="44" rx="8" fill="${YELLOW}" stroke="none"/>`,
].filter(Boolean).join("");

const eye = (x, y, r = 25, look = [0, 0]) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${YELLOW}" stroke-width="6"/><circle cx="${x + look[0]}" cy="${y + look[1]}" r="${r * 0.42}" fill="${INK}" stroke="none"/>` +
  `<circle cx="${x + look[0] - r * 0.18}" cy="${y + look[1] - r * 0.2}" r="${r * 0.12}" fill="#fff" stroke="none"/>`;
const bigEye = (x, y, r, look) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke-width="6"/><circle cx="${x + look[0]}" cy="${y + look[1]}" r="${r * 0.3}" fill="${INK}" stroke="none"/>`;
const beak = `<path d="M188 196 L212 196 L200 224 Z" fill="${INK}" stroke-width="5"/>`;
const drop = (x, y, s = 1) => `<path d="M${x} ${y} c-8 12 -10 20 0 22 c10 -2 8 -10 0 -22 Z" fill="${BLUE}" stroke-width="${4 * s}" transform="rotate(-20 ${x} ${y})"/>`;

const FACES = {
  // looking at you, calm
  idle: eye(150, 170) + eye(250, 170) + beak,
  // the stare: heavy lids
  stare: eye(150, 172, 25) + eye(250, 172, 25) + `<path d="M120 160 Q150 146 180 160 M220 160 Q250 146 280 160" stroke-width="8"/>` + beak,
  blink: `<path d="M124 172 Q150 188 176 172 M224 172 Q250 188 276 172" stroke-width="8"/>` + beak,
  // trick: wink + giant eye + tongue (concept screen)
  tongue: `<path d="M120 170 Q146 160 176 176 M124 182 Q148 178 172 180" stroke-width="7"/>` + bigEye(254, 166, 42, [10, 4]) +
    `<path d="M186 196 L216 194 L204 214 Z" fill="${INK}" stroke-width="5"/><path d="M186 206 Q200 252 216 210 Z" fill="${INK}" stroke-width="5"/>` +
    `<path d="M192 216 C190 246 214 250 212 220" fill="${PINK}" stroke-width="5"/>` + drop(112, 120) + drop(300, 118),
  // trick: cross-eyed puffed cheeks
  cross: bigEye(150, 170, 32, [14, 6]) + bigEye(250, 170, 32, [-14, 6]) +
    `<circle cx="112" cy="222" r="20" fill="${PINK}" stroke="none" opacity=".7"/><circle cx="288" cy="222" r="20" fill="${PINK}" stroke="none" opacity=".7"/>` +
    `<path d="M178 214 q8 -10 16 0 q8 10 16 0 q8 -10 14 0" stroke-width="7"/><path d="M190 196 L210 196 L200 208 Z" fill="${INK}" stroke-width="5"/>`,
  // owl won: laughing
  laugh: `<path d="M122 178 Q150 146 178 178 M222 178 Q250 146 278 178" stroke-width="8"/>` +
    `<path d="M180 196 L220 196 L200 206 Z" fill="${INK}" stroke-width="5"/><path d="M182 208 Q200 262 218 208 Z" fill="${PINK}" stroke-width="6"/>` + drop(112, 190) + drop(292, 190),
  // owl lost: shocked
  shock: bigEye(150, 168, 30, [0, 0]) + bigEye(250, 168, 30, [0, 0]) + `<ellipse cx="200" cy="216" rx="10" ry="14" fill="${INK}" stroke-width="4"/>` +
    drop(98, 128) + drop(304, 124) + drop(318, 176),
  // Grandma's resting face: kind closed-eye smile
  sweet: `<path d="M124 176 Q150 156 176 176 M224 176 Q250 156 276 176" stroke-width="8"/>` +
    `<circle cx="112" cy="210" r="16" fill="${PINK}" stroke="none" opacity=".6"/><circle cx="288" cy="210" r="16" fill="${PINK}" stroke="none" opacity=".6"/>` + beak,
  // Boomer's HOOT!: squeezed eyes, beak wide open
  shout: `<path d="M122 154 L172 172 L122 188 M278 154 L228 172 L278 188" stroke-width="8"/>` +
    `<path d="M178 192 L222 192 L200 204 Z" fill="${INK}" stroke-width="5"/><path d="M176 206 Q200 280 224 206 Z" fill="${INK}" stroke-width="6"/><path d="M188 236 Q200 262 212 236 Z" fill="${PINK}" stroke="none"/>`,
};

export const OWL_FACES = Object.keys(FACES);
export const faceSVG = (face) => svg(400, 440, FACES[face]);
export const bodySVG = (look) => svg(400, 440, bodyLayer(look));
export const frontSVG = (look) => { const f = frontLayer(look); return f && svg(400, 440, f); };
// whole owl in one image (art sheet)
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
