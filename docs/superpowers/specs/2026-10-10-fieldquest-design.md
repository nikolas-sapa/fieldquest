# FieldQuest Design

## Goal

Build a tiny outdoor quest generator for people who want a reason to step away from a screen. The user chooses available time and an energy level; an open-weight model running in the browser creates one safe, screen-free outdoor prompt.

## User flow

1. Open FieldQuest on a phone or desktop.
2. Choose 5, 10, or 20 minutes and a calm, curious, or energetic mood.
3. Start the local model. The first run downloads model assets; later runs use browser cache.
4. The local model creates a brief nature detail matched to the selected mood and time. FieldQuest places it into a short, fixed-format outdoor quest, which the user reads once and then leaves in a pocket.
5. Optionally mark the quest complete when back.

## Architecture

- Static mobile-first PWA: semantic HTML, CSS, and JavaScript modules.
- Transformers.js runs `onnx-community/SmolLM2-360M-Instruct-ONNX` in the browser with `dtype: "q4f16"` (272 MB weight file), pinned to revision `fe7c7db4c8921c9e3fa1c65cfd296fb3b1b1a8f9`. Expose download/inference status and describe runtime assets separately.
- No server, account, GPS, camera, telemetry, or user-content persistence.
- App shell is cached by a service worker. Model downloads are managed by Transformers.js browser cache; clear instructions explain that model files need one successful online load before offline use.
- If model loading or inference fails, show a clear retry path. Do not fabricate an AI result or send user input to a remote service.
- Prompt asks for only a 2-7-word nature observation. App supplies the activity and duration wording from fixed templates. It discards model text outside the expected short phrase or matching the safety filter. Safety copy tells users to stay in public, familiar places, respect access rules, and stop if conditions feel unsafe.

## Success criteria

- User can generate distinct outdoor quests for all 9 combinations of time and mood; at least 6/9 quest strings differ.
- After model assets load once, quest generation works with network disabled in a supported browser.
- All 9 acceptance combinations return a quest under 20 seconds on the reference laptop; hard failures remain clearly reported.
- At least 8/9 observation phrases are natural, concrete, and grammatically fit the fixed quest wrapper; all quest texts are under 45 words and contain no location request or instruction to enter restricted/unsafe areas.
- App shell renders at 360px viewport width without horizontal scrolling.

## Non-goals

- Species identification, route planning, maps, weather, or location-based recommendations.
- Hosted inference, analytics, login, social features, or user profiles.
- Native app packaging or promises of offline model execution before the first model download.
- Partner prize category claims.

## Open innovation rationale

Local, swappable open weights make the prompt generation private and usable after a one-time model download. Users can inspect the model choice and change the weights without entrusting location or preference data to a closed API.

## Known constraints

The quantized model weight file is 272 MB; the app also loads runtime and tokenizer assets. First inference may be slow. Browser cache eviction can require downloading again. The PWA must communicate these constraints before users start.

## Submission

Publish a DEV post using the challenge-provided template and required `devchallenge` and `hf26challenge` tags. Include a live demo, public source code, actual model/runtime details, truthful first-run/offline behavior, and no unverified claims. Deadline shown by DEV: October 11, 2026, 11:59 PM PDT.
