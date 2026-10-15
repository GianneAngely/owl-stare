// Doodle owls (style A: chubby egg body, thick ink brush lines, cream feathers, small yellow eyes) drawn as SVG.
// Placeholder art until the final drawings exist; every face is a separate texture so tricks just swap them.
export const INK = "#2b2622", PAPER = "#f7f3e8", CREAM = "#f3edd9", BELLY = "#fbf8ee", GREY = "#6f665d", YELLOW = "#f2c94c", BLUE = "#b9d0e6", PINK = "#ee9aa0";

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
  `<g stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" fill="none">${body}</g></svg>`;

const BODY = `
  <path d="M86 300 C70 330 74 360 98 372 L104 340 Z" fill="${CREAM}" stroke-width="7"/>
  <path d="M314 300 C330 330 326 360 302 372 L296 340 Z" fill="${CREAM}" stroke-width="7"/>
  <path d="M200 44 C296 42 356 128 358 246 C360 360 292 414 200 414 C108 414 40 360 42 246 C44 128 104 46 200 44 Z" fill="${CREAM}" stroke="none"/>
  <ellipse cx="200" cy="300" rx="112" ry="100" fill="${BELLY}" stroke="none"/>
  <path d="M196 44 C294 40 356 126 358 242 C360 330 326 388 262 408" stroke-width="10"/>
  <path d="M244 412 C218 416 186 416 160 412 C90 400 40 350 42 246 C44 150 90 64 170 48" stroke-width="10"/>
  <path d="M64 230 C46 270 56 318 92 344 C104 310 98 262 64 230 Z" fill="${CREAM}" stroke-width="8"/>
  <path d="M336 230 C354 270 344 318 308 344 C296 310 302 262 336 230 Z" fill="${CREAM}" stroke-width="8"/>
  <g stroke="${GREY}" stroke-width="7">
    <path d="M150 276 l10 12 l10 -14"/><path d="M190 266 l10 12 l10 -14"/><path d="M230 276 l10 12 l10 -14"/>
    <path d="M168 318 l9 11 l9 -12"/><path d="M214 318 l9 11 l9 -12"/><path d="M190 356 l9 11 l9 -12"/>
  </g>
  <g stroke-width="6"><path d="M156 414 l-8 14 M164 416 v16 M172 414 l8 14"/><path d="M228 414 l-8 14 M236 416 v16 M244 414 l8 14"/></g>`;

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
};

export const OWL_FACES = Object.keys(FACES);
export const owlSVG = (face) => svg(400, 440, BODY + FACES[face]);

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

export const dataURL = (s) => "data:image/svg+xml;base64," + btoa(s);
