// The ladder (GDD §3). seconds = match length, tricks = picked at random (repeat a name to make it likelier),
// gap = ms between one owl's tricks, overlap = next trick starts on time even if the last one is still going,
// short = name on the "Next" button, size = how big it stands, twins = two owls on screen.
// art: assets/owls/<id>-<pose>.webp, drawn in Google Flow from concept/lineup.jpg (see report/owls/compare.jpg)
// the owl on the title, camera and calibration screens: the cream twin, the closest to the key art owl
export const GUIDE = { id: "guide", name: "Owl", art: "twins" };

export const OWLS = [
  { id: "hoot", name: "Hoot", who: "The beginner", line: "I never blink. Ever. Probably.", seconds: 10,
    tricks: ["face", "feathers"], gap: [1800, 3200], size: 0.8 },
  { id: "plume", name: "Professor Plume", short: "Plume", who: "Pompous", line: "Allow me to read you something hilarious.", seconds: 15,
    tricks: ["joke", "joke", "face"], gap: [2400, 3600], size: 0.86 },
  { id: "twitchy", name: "Twitchy", who: "Can't sit still", line: "Is that a fly? IS THAT A FLY?", seconds: 20,
    tricks: ["fly", "feathers", "popup"], gap: [1800, 3000], size: 0.9 },
  { id: "boomer", name: "Boomer", who: "Loud", line: "HELLO. I AM USING MY INDOOR VOICE.", seconds: 20,
    tricks: ["hoot", "hoot", "squeak", "face"], gap: [2000, 3400], size: 0.92 },
  { id: "grandma", name: "Grandma Owlbert", short: "Grandma", who: "Sweet, then sneaky", line: "Come sit, dear. Have a biscuit.", seconds: 25,
    tricks: ["knit", "knit", "surprise"], gap: [3500, 5500], size: 0.92 },
  { id: "dj", name: "DJ Night", who: "Party owl", line: "Drop the beat. Not your eyelids.", seconds: 25,
    tricks: ["dance", "dance", "face"], gap: [2200, 3400], size: 0.98 },
  { id: "twins", name: "The Twins", who: "Double trouble", line: "Two of us. One of you.", seconds: 30,
    tricks: ["face", "joke", "hoot", "fly"], gap: [2600, 4200], size: 0.9, twins: true },
  { id: "boss", name: "Great Horned Hootington", short: "Hootington", who: "The boss", line: "No one has ever out-stared me.", seconds: 45,
    tricks: ["face", "feathers", "joke", "fly", "popup", "hoot", "squeak", "surprise", "dance"], gap: [1500, 2600], overlap: true,
    size: 1.1 },
];

export const byId = (id) => (id === GUIDE.id ? GUIDE : OWLS.find((o) => o.id === id) ?? OWLS[0]);
// an owl is open once the one before it is beaten
export const unlocked = (i, beaten = []) => i === 0 || beaten.includes(OWLS[i - 1].id);
export const nextOwl = (id) => OWLS[OWLS.findIndex((o) => o.id === id) + 1] ?? null;
