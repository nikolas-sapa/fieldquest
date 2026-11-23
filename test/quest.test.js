import assert from "node:assert/strict";
import test from "node:test";

import { ALLOWED_MINUTES, ALLOWED_MOODS, cleanObservation, composeQuest, extractText, makeMessages } from "../src/quest.js";

test("extractText reads the last chat message and strips role prefix and quotes", () => {
  const output = [{ generated_text: [
    { role: "user", content: "prompt" },
    { role: "assistant", content: "  assistant: \"sunlight moves across leaves\"  " },
  ] }];
  assert.equal(extractText(output), "sunlight moves across leaves");
});

test("extractText accepts plain string output", () => {
  assert.equal(extractText([{ generated_text: "'wind bends tall grass'" }]), "wind bends tall grass");
});

test("extractText returns empty string for missing or malformed output", () => {
  assert.equal(extractText(undefined), "");
  assert.equal(extractText([]), "");
  assert.equal(extractText([{ generated_text: [{ content: 42 }] }]), "");
});

test("cleanObservation normalizes a valid fragment", () => {
  assert.equal(cleanObservation("Notice how  Sunlight\nmoves across leaves."), "sunlight moves across leaves");
});

test("cleanObservation enforces 2 to 7 words", () => {
  assert.equal(cleanObservation("leaves"), "");
  assert.equal(cleanObservation(""), "");
  assert.equal(cleanObservation("birds sing"), "birds sing");
  assert.equal(cleanObservation("one two three four five six seven"), "one two three four five six seven");
  assert.equal(cleanObservation("one two three four five six seven eight"), "");
});

test("cleanObservation rejects unsafe places and activities", () => {
  for (const text of ["water rushes over the cliff", "cars move along the road", "you climb the old tree", "Traffic hums nearby"]) {
    assert.equal(cleanObservation(text), "", text);
  }
});

test("cleanObservation rejects location requests", () => {
  assert.equal(cleanObservation("please share your exact location"), "");
  assert.equal(cleanObservation("tell me your gps coordinates"), "");
});

test("cleanObservation does not block safe words containing blocked substrings", () => {
  assert.equal(cleanObservation("broad leaves catch rain"), "broad leaves catch rain");
});

test("composeQuest builds a quest for every allowed time and mood", () => {
  for (const minutes of ALLOWED_MINUTES) {
    for (const mood of ALLOWED_MOODS) {
      const quest = composeQuest("wind bends tall grass", minutes, mood);
      assert.match(quest, /notice how wind bends tall grass\. /);
      assert.match(quest, /pocket your phone\.$/);
      assert.doesNotMatch(quest, /undefined/);
    }
  }
});

test("makeMessages includes recent quests only when present", () => {
  const fresh = makeMessages("10", "calm", []);
  assert.equal(fresh.length, 2);
  assert.doesNotMatch(fresh[1].content, /recent ones/);
  assert.match(fresh[1].content, /10-minute calm/);
  const repeat = makeMessages("5", "curious", ["birds sing", "clouds drift"]);
  assert.match(repeat[1].content, /recent ones: birds sing \| clouds drift/);
});
