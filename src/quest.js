export const ALLOWED_MINUTES = new Set(["5", "10", "20"]);
export const ALLOWED_MOODS = new Set(["calm", "curious", "energetic"]);
const UNSAFE_TERMS = /\b(?:cliff|ledge|railway|railroad|train tracks|highway|motorway|traffic|trespass|restricted area|private property|construction site|climb|swim|waterfall|river|road|street)\b/i;
const LOCATION_REQUEST = /\b(?:share|enter|provide|tell|send)\b.{0,32}\b(?:address|gps|location|coordinates|postcode)\b/i;

export function makeMessages(minutes, mood, recentQuests) {
  const recent = recentQuests.length > 0
    ? `Choose a different detail from these recent ones: ${recentQuests.join(" | ")}`
    : "";

  return [
    {
      role: "system",
      content: "You notice small things in nature. Complete the phrase after 'Notice how'. Return exactly one concrete present-tense observation fragment of 2 to 7 common words, with a subject and verb. No task, place, person, brand, story, or extra words. Example: 'sunlight moves across leaves'.",
    },
    {
      role: "user",
      content: `Complete this phrase for someone taking a ${minutes}-minute ${mood} outdoor break: "Notice how ___." Choose an everyday nature detail someone can observe where they are. ${recent} Return only the missing words.`,
    },
  ];
}

export function extractText(output) {
  const generated = output?.[0]?.generated_text;
  const content = Array.isArray(generated) ? generated.at(-1)?.content : generated;
  return typeof content === "string" ? content.trim().replace(/^assistant\s*:?\s*/i, "").replace(/^['"`]+|['"`]+$/g, "") : "";
}

export function cleanObservation(text) {
  const normalized = text.replace(/\s+/g, " ").trim().replace(/^notice how\s+/i, "");
  const observation = normalized.replace(/[.!?]+$/, "").trim();
  const words = observation.split(" ");
  if (words.length < 2 || words.length > 7 || UNSAFE_TERMS.test(observation) || LOCATION_REQUEST.test(observation)) return "";
  return observation.replace(/^[A-Z]/, (letter) => letter.toLowerCase());
}

export function composeQuest(observation, minutes, mood) {
  const openings = {
    calm: "Pause for a moment and notice how",
    curious: "Look twice and notice how",
    energetic: "Move at a comfortable pace and notice how",
  };
  const endings = {
    "5": "Find one more small detail, then pocket your phone.",
    "10": "Look for one more sign of it, then pocket your phone.",
    "20": "Stay a little longer and notice a second detail, then pocket your phone.",
  };
  return `${openings[mood]} ${observation}. ${endings[minutes]}`;
}
