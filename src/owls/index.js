// The ladder (GDD §3). seconds = match length, tricks = picked at random (repeat a name to make it likelier),
// gap = ms between one owl's tricks, overlap = next trick starts on time even if the last one is still going,
// short = name on the "Next" button, rest = the face the owl stares with, size = how big it stands, twins = two owls on screen.
// looks follow concept/lineup.jpg, left to right (see report/owls/compare.jpg)
const TWIN = { body: "#e3dccb", disc: "#f5efe3", hw: 124, top: 52, bottom: 400 };
// the cream owl from the key art and the concept match screen: title, camera and calibration screens
export const GUIDE = { id: "guide", name: "Owl", look: { body: "#f1ecd9", hw: 160, top: 44, bottom: 396 } };

export const OWLS = [
  { id: "hoot", name: "Hoot", who: "The beginner", line: "I never blink. Ever. Probably.", seconds: 10,
    tricks: ["face", "feathers"], gap: [1800, 3200], look: { fluffy: true }, size: 0.8, rest: "dots" },
  { id: "plume", name: "Professor Plume", short: "Plume", who: "Pompous", line: "Allow me to read you something hilarious.", seconds: 15,
    tricks: ["joke", "joke", "face"], gap: [2400, 3600], look: { body: "#ede4c6", disc: "#f6f0de", hw: 170, top: 78, bottom: 394, glasses: true, book: true }, size: 0.86, rest: "specs" },
  { id: "twitchy", name: "Twitchy", who: "Can't sit still", line: "Is that a fly? IS THAT A FLY?", seconds: 20,
    tricks: ["fly", "feathers", "popup"], gap: [1800, 3000], look: { body: "#bdbab1", disc: "#f4f0e4", hw: 130, top: 50, speckles: true, twitch: true }, size: 0.9, rest: "wide" },
  { id: "boomer", name: "Boomer", who: "Loud", line: "HELLO. I AM USING MY INDOOR VOICE.", seconds: 20,
    tricks: ["hoot", "hoot", "squeak", "face"], gap: [2000, 3400], look: { body: "#c7c3b8", disc: "#ece8dc", hw: 132, top: 50, megaphone: true, body: "#c7c3b8" }, size: 0.92, rest: "stare" },
  { id: "grandma", name: "Grandma Owlbert", short: "Grandma", who: "Sweet, then sneaky", line: "Come sit, dear. Have a biscuit.", seconds: 25,
    tricks: ["knit", "knit", "surprise"], gap: [3500, 5500], look: { body: "#ede3c6", disc: "#f6f0e2", hw: 148, top: 48, shawl: true, knitting: true }, size: 0.92, rest: "sweet" },
  { id: "dj", name: "DJ Night", who: "Party owl", line: "Drop the beat. Not your eyelids.", seconds: 25,
    tricks: ["dance", "dance", "face"], gap: [2200, 3400], look: { body: "#c3beb4", disc: "#f4f0e4", hw: 126, top: 52, headphones: true }, size: 0.98, rest: "idle" },
  { id: "twins", name: "The Twins", who: "Double trouble", line: "Two of us. One of you.", seconds: 30,
    tricks: ["face", "joke", "hoot", "fly"], gap: [2600, 4200], look: TWIN, size: 0.9, twins: true, rest: "idle" },
  { id: "boss", name: "Great Horned Hootington", short: "Hootington", who: "The boss", line: "No one has ever out-stared me.", seconds: 45,
    tricks: ["face", "feathers", "joke", "fly", "popup", "hoot", "squeak", "surprise", "dance"], gap: [1500, 2600], overlap: true,
    look: { body: "#f6f7f8", shade: "#dde2e8", hw: 152, top: 44, bottom: 402, crown: true }, size: 1.1, rest: "sleepy" },
];

export const byId = (id) => (id === GUIDE.id ? GUIDE : OWLS.find((o) => o.id === id) ?? OWLS[0]);
// an owl is open once the one before it is beaten
export const unlocked = (i, beaten = []) => i === 0 || beaten.includes(OWLS[i - 1].id);
export const nextOwl = (id) => OWLS[OWLS.findIndex((o) => o.id === id) + 1] ?? null;
