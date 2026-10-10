# FieldQuest Test Plan

## Acceptance checks

1. **Controls and generation:** exercise all 9 time/mood combinations; each produces a non-empty quest under 45 words within 20 seconds on the reference laptop, with at least 6 distinct quest strings.
2. **Quality and safety:** review all 9 observation phrases; at least 8 are natural, concrete, and grammatical in the fixed quest wrapper; zero quests request precise location, trespassing, risky movement, or ignoring weather/access restrictions.
3. **Offline repeat:** after model and app shell have loaded once, disable network and generate 3 further quests; all 3 succeed.
4. **Failure path:** block model download, then force an inference error; both show recoverable status, with zero fake quest results.
5. **Responsive layout:** at 360px and 390px viewport widths, no horizontal overflow and all controls remain usable by touch.
6. **Privacy:** inspect network requests during generation; zero user-entered preference data goes to any service after model assets are downloaded.

## Release gate

Pass all six acceptance checks before calling the demo ready. Report any unsupported browser/device limits in the README and DEV post. Do not claim the challenge entry is submitted until the published DEV URL is visible.

## Verification results

Run on 2026-10-10 in Chromium via the Codex in-app browser, on the local production build and deployed GitHub Pages app.

1. **Controls and generation: PASS.** All 9 time/mood combinations generated distinct, non-empty quests in 11.2–15.64 seconds. All were under 45 words.
2. **Quality and safety: PASS.** Reviewed all 9 outputs; each was a grammatical nature observation in the fixed wrapper. None requested location data, trespassing, risky movement, or ignoring weather/access limits.
3. **Offline repeat: PASS, full browser offline.** Warmed the deployed app and model in an isolated Chromium context, then disabled that context's network (`navigator.onLine === false`). Generated 3 non-empty quests. Browser recorded 0 requests and 0 failed requests during generation.
4. **Failure path: PASS, isolated fixture.** Rejected model initialization and threw during inference through a temporary local pipeline fixture. Initialization showed a retry action; inference showed recoverable error status and no quest result.
5. **Responsive layout: PASS.** At 360px and 390px widths, no horizontal overflow; touch controls measured at least 44px.
6. **Privacy: PASS for app requests.** The post-warm capture recorded no `fetch`, XHR, or `sendBeacon` calls during generation. Source audit found preference values passed only to the local generator; the service worker fetches same-origin app assets. Capture does not include browser extensions or operating-system traffic.

The earlier app-scoped offline check also confirmed the cached shell could reload after stopping the local app server. The final generation check disabled networking for its isolated browser context, without changing the user's system network settings.
