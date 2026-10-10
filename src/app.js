import "../styles.css";

const MODEL_ID = "onnx-community/SmolLM2-360M-Instruct-ONNX";
const MODEL_REVISION = "fe7c7db4c8921c9e3fa1c65cfd296fb3b1b1a8f9";
const MODEL_SIZE = "272 MB";
const ALLOWED_MINUTES = new Set(["5", "10", "20"]);
const ALLOWED_MOODS = new Set(["calm", "curious", "energetic"]);
const UNSAFE_TERMS = /\b(?:cliff|ledge|railway|railroad|train tracks|highway|motorway|traffic|trespass|restricted area|private property|construction site|climb|swim|waterfall|river|road|street)\b/i;
const LOCATION_REQUEST = /\b(?:share|enter|provide|tell|send)\b.{0,32}\b(?:address|gps|location|coordinates|postcode)\b/i;

const loadButton = document.querySelector("#load-model");
const generateButton = document.querySelector("#generate-quest");
const statusElement = document.querySelector("#model-status");
const progressWrap = document.querySelector("#progress-wrap");
const progressFill = document.querySelector("#progress-fill");
const modelDescription = document.querySelector("#model-description");
const resultElement = document.querySelector("#result");
const questText = document.querySelector("#quest-text");
const questTime = document.querySelector("#quest-time");
const doneButton = document.querySelector("#done-button");
const completeNote = document.querySelector("#complete-note");

let generatorPromise;
let generator;
let isGenerating = false;
const recentQuests = [];

function setStatus(message, state = "idle") {
  statusElement.textContent = message;
  statusElement.dataset.state = state;
}

function progressMessage(progress) {
  if (progress.status === "progress" && Number.isFinite(progress.progress)) {
    const percent = Math.max(0, Math.min(100, Math.round(progress.progress)));
    progressFill.style.width = `${percent}%`;
    progressWrap.setAttribute("aria-valuenow", String(percent));
    setStatus(`Loading local model · ${percent}% · ${MODEL_SIZE} weights, plus runtime assets`, "loading");
    return;
  }

  if (progress.status === "initiate" && progress.file) {
    setStatus(`Preparing ${progress.file} · model files stay in your browser cache`, "loading");
  }
}

async function loadModel() {
  if (generator) return generator;
  if (!generatorPromise) {
    loadButton.disabled = true;
    loadButton.textContent = "Loading…";
    progressWrap.hidden = false;
    progressFill.style.width = "2%";
    setStatus(`Starting the open model · ${MODEL_SIZE} weights, plus runtime assets`, "loading");

    generatorPromise = import("@huggingface/transformers").then(({ pipeline }) => pipeline("text-generation", MODEL_ID, {
      dtype: "q4f16",
      revision: MODEL_REVISION,
      progress_callback: progressMessage,
    }));
  }

  try {
    generator = await generatorPromise;
    progressFill.style.width = "100%";
    loadButton.textContent = "Model ready";
    modelDescription.textContent = "Runs on this device · no account";
    generateButton.disabled = false;
    setStatus("Model ready. Choose your time and mood, then make a quest.", "ready");
    return generator;
  } catch (error) {
    generatorPromise = undefined;
    loadButton.disabled = false;
    loadButton.textContent = "Try loading again";
    progressWrap.hidden = true;
    progressFill.style.width = "0%";
    setStatus("The local model did not load. Check your connection and available memory, then try again.", "error");
    throw error;
  }
}

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value;
}

function makeMessages(minutes, mood) {
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

function extractText(output) {
  const generated = output?.[0]?.generated_text;
  const content = Array.isArray(generated) ? generated.at(-1)?.content : generated;
  return typeof content === "string" ? content.trim().replace(/^assistant\s*:?\s*/i, "").replace(/^['"`]+|['"`]+$/g, "") : "";
}

function cleanObservation(text) {
  const normalized = text.replace(/\s+/g, " ").trim().replace(/^notice how\s+/i, "");
  const observation = normalized.replace(/[.!?]+$/, "").trim();
  const words = observation.split(" ");
  if (words.length < 2 || words.length > 7 || UNSAFE_TERMS.test(observation) || LOCATION_REQUEST.test(observation)) return "";
  return observation.replace(/^[A-Z]/, (letter) => letter.toLowerCase());
}

function composeQuest(observation, minutes, mood) {
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

async function generateQuest() {
  if (!generator || isGenerating) return;
  const minutes = selectedValue("duration");
  const mood = selectedValue("mood");
  if (!ALLOWED_MINUTES.has(minutes) || !ALLOWED_MOODS.has(mood)) {
    setStatus("Choose one of the listed times and moods, then try again.", "error");
    return;
  }

  isGenerating = true;
  generateButton.disabled = true;
  generateButton.querySelector("span").textContent = "Dreaming it up…";
  setStatus("Finding one small detail on your device…", "loading");
  resultElement.hidden = true;
  completeNote.hidden = true;

  try {
    const activeGenerator = await loadModel();
    let observation = "";
    for (let attempt = 0; attempt < 3 && !observation; attempt += 1) {
      const output = await activeGenerator(makeMessages(minutes, mood), {
        max_new_tokens: 24,
        do_sample: true,
        temperature: 0.6,
        top_p: 0.85,
        repetition_penalty: 1.1,
      });
      observation = cleanObservation(extractText(output));
      if (!observation && attempt < 2) setStatus("Shaping that into a tiny nature detail…", "loading");
    }
    if (!observation) {
      throw new Error("The model did not return a usable observation after three tries.");
    }
    const quest = composeQuest(observation, minutes, mood);

    questText.textContent = quest;
    questTime.textContent = `${minutes} minute${minutes === "1" ? "" : "s"} · ${mood}`;
    recentQuests.push(observation);
    if (recentQuests.length > 3) recentQuests.shift();
    resultElement.hidden = false;
    setStatus("Quest ready. Read it once, then pocket the phone.", "ready");
  } catch (error) {
    setStatus("No quest was made. Try again, or change your time or mood.", "error");
  } finally {
    isGenerating = false;
    generateButton.disabled = false;
    generateButton.querySelector("span").textContent = "Make my quest";
  }
}

loadButton.addEventListener("click", () => {
  loadModel().catch(() => {});
});
generateButton.addEventListener("click", generateQuest);
doneButton.addEventListener("click", () => {
  resultElement.hidden = true;
  completeNote.hidden = false;
  setStatus("Quest tucked away. Enjoy the outside.", "ready");
});

if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    const base = document.querySelector('link[rel="manifest"]')?.href ?? window.location.href;
    const workerUrl = new URL("sw.js", base);
    navigator.serviceWorker.register(workerUrl).catch(() => {
      setStatus("Offline app-shell setup failed. The local quest generator still works while this page is open.", "error");
    });
  });
}
