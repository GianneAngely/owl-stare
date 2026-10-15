import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { OWLS, unlocked, nextOwl, byId } from "../src/owls/index.js";

test("eight owls, boss last, match lengths from the GDD", () => {
  assert.equal(OWLS.length, 8);
  assert.deepEqual(OWLS.map((o) => o.seconds), [10, 15, 20, 20, 25, 25, 30, 45]);
  assert.equal(OWLS.at(-1).id, "boss");
  assert.deepEqual(byId("hoot").tricks, ["face", "feathers"]);   // Angel, 16 Oct: Hoot keeps these two
});

test("each owl opens when the one before it is beaten", () => {
  assert.deepEqual(OWLS.map((_, i) => unlocked(i, [])), [true, false, false, false, false, false, false, false]);
  assert.deepEqual(OWLS.map((_, i) => unlocked(i, ["hoot", "plume"])), [true, true, true, false, false, false, false, false]);
  assert.equal(nextOwl("hoot").id, "plume");
  assert.equal(nextOwl("boss"), null);
});

test("every trick an owl uses exists", async () => {
  const src = await readFile(new URL("../src/tricks/index.js", import.meta.url), "utf8");
  const known = src.match(/TRICKS = \{([^}]*)\}/)[1].split(",").map((s) => s.trim());
  for (const o of OWLS) for (const t of o.tricks) assert.ok(known.includes(t), `${o.id}: ${t}`);
});
