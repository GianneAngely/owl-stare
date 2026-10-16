// Doodle props drawn as SVG (feathers, fly, duck, clock, ...) in the concept style: thick uneven brush-pen lines,
// flat colours. The owls themselves are Google Flow drawings (assets/owls/, see owl-sprite.js); the old code-drawn
// owls are on branch owls-svg.
export const INK = "#1f1b18", PAPER = "#f7f3e8", CREAM = "#ede4c6", BELLY = "#fbf8ee", GREY = "#6f665f", YELLOW = "#f0c75a", BLUE = "#b9d0e6", PINK = "#ee9aa0";

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
  `<defs><filter id="brush" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7"/>` +
  `<feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>` +
  `<g filter="url(#brush)" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" fill="none">${body}</g></svg>`;

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
