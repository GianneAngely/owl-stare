// Owl #1. The beginner: short match, only pulls faces (GDD §3), plus feathers in the prototype.
export default {
  id: "hoot",
  name: "Hoot",
  seconds: 10,
  tricks: ["face", "feathers"],
  gap: [1800, 3200],   // ms between tricks
  taunts: ["Don't blink.", "I never blink. Ever. Probably.", "Look at my face.", "Hoo-hoo."],
  wins: { blink: "You blinked!", smile: "You smiled!", away: "You looked away!" },
};
