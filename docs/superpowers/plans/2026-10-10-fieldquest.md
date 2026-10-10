# FieldQuest Implementation Plan

> **For agentic workers:** Use inline execution task-by-task, preserving the checks below.

**Goal:** Deliver and submit FieldQuest, a local open-weight outdoor quest PWA.

**Architecture:** Vite builds a static HTML/CSS/JS PWA. Transformers.js runs `onnx-community/SmolLM2-135M-Instruct-ONNX` with q4 in the browser, without an application server or telemetry. GitHub Pages serves the demo. Publish the source and demo only after the acceptance checks pass.

**Tech Stack:** HTML, CSS, JavaScript modules, service worker, `@huggingface/transformers` 4.3.1, Vite, ONNX Community SmolLM2-135M Instruct q4.

## Global Constraints

- No backend, account, GPS, camera, analytics, or persistence of user preferences.
- No fake fallback result when local model inference fails.
- AI output under 45 words; screen-free task, safety-focused prompt.
- All six checks in `docs/superpowers/specs/2026-10-10-fieldquest-test-plan.md` must pass before public submission.

---

## File map

- `index.html`: form, model status, quest result, and safety copy.
- `styles.css`: responsive visual system and reduced-motion support.
- `app.js`: user flow, validation, inference, and honest failure handling.
- `sw.js`: app shell caching only; never cache model weights manually.
- `package.json`, `vite.config.js`: pinned development/build tooling for a static browser bundle.
- `.github/workflows/pages.yml`: build and deploy the `dist/` artifact to GitHub Pages on main-branch pushes.
- `manifest.webmanifest`: install metadata.
- `README.md`: setup, model/license attribution, privacy, browser limits, and verification results.
- `docs/`: design and test plan already authored before implementation plan.
- `submission.md`: final DEV post draft with verified demo/source links.

### Task 1: Build the browser UI and PWA shell

**Files:** create `index.html`, `styles.css`, `sw.js`, `manifest.webmanifest`.

- [ ] Add semantic form with radio controls for 5, 10, 20 minutes and calm, curious, energetic; add load/generate actions, an `aria-live` status, quest area, and completion/restart action.
- [ ] Style with Geist Sans, accent `#006bff`, no orange or emoji, mobile-first 360px sizing, visible keyboard focus, and reduced-motion support.
- [ ] In `sw.js`, precache `/`, `/index.html`, `/styles.css`, `/app.js`, and `/manifest.webmanifest`; do not intercept or cache Hugging Face model requests.
- [ ] Register `sw.js` from `app.js` only on HTTPS or localhost.
- [ ] Verify no horizontal overflow at 360px or 390px and app shell loads after network is disabled.

### Task 2: Integrate local model inference

**Files:** create `app.js`; modify `index.html` only for module/script wiring; create `package.json`, `vite.config.js`.

- [ ] Set `package.json` to `private: true`, add scripts `dev`, `build`, and `preview`, and dependencies `@huggingface/transformers: 4.3.1` plus `vite: 8.3.4`.
- [ ] Configure Vite base path as `./` for GitHub Pages artifact portability.
- [ ] Initialize one `pipeline("text-generation", "onnx-community/SmolLM2-135M-Instruct-ONNX", { dtype: "q4" })`; reuse the pipeline singleton and relay download progress via the Transformers.js progress callback.
- [ ] Validate selected values against the three supported minutes and moods; build a fixed safety prompt that requests one screen-free, under-45-word, public-space activity, no location, no restricted access, no dangerous movement.
- [ ] Generate at most 60 tokens with sampling, remove surrounding quotes, cap displayed text at 45 words, and show retry status without a fallback quest if inference fails.
- [ ] Run test plan checks 1-4 and 6 with network inspection; record exact browser/device, bytes requested after model warm-up, all 9 quest outputs, and observed timings.

### Task 3: Document, deploy, and prepare submission

**Files:** create `README.md`, `submission.md`, `.github/workflows/pages.yml`; configure the public source repository and GitHub Pages.

- [ ] Document SmolLM2/Transformers.js attribution and licenses, measured first-load size, cache behavior, tested browser, privacy, local run commands, and all acceptance results.
- [ ] Run all six release checks from the test plan; fix failures and repeat failed checks until all pass or report the block honestly.
- [ ] Add a Pages workflow for pushes to `main` using GitHub's Pages artifact upload/deploy actions; build with Node 22, upload `dist`, set Pages write/id-token permissions, and concurrency `pages`.
- [ ] Create a public GitHub repository, push branch `challenge-entry`, open PR to `main`, review diff, merge, then confirm GitHub Pages deployment is ready and `curl --fail` reads the live app.
- [ ] Draft DEV article from `submission.md` using the official template, replacing all placeholders, with measured behavior, live demo and code links, required tags `devchallenge,hf26challenge`.
- [ ] Publish on DEV using the authenticated browser session before the deadline; open the resulting URL to confirm the post is public and challenge tags are present.
- [ ] Commit each code/doc change and push it to `challenge-entry`; do not expose credentials.
