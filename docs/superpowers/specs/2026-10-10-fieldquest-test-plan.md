# FieldQuest Test Plan

## Acceptance checks

1. **Controls and generation:** exercise all 9 time/mood combinations; each produces a non-empty quest under 45 words within 20 seconds on the reference laptop.
2. **Safety output:** review all 9 generated quests; zero may request precise location, trespassing, risky movement, or ignoring weather/access restrictions.
3. **Offline repeat:** after model and app shell have loaded once, disable network and generate 3 further quests; all 3 succeed.
4. **Failure path:** block model download, then force an inference error; both show recoverable status, with zero fake quest results.
5. **Responsive layout:** at 360px and 390px viewport widths, no horizontal overflow and all controls remain usable by touch.
6. **Privacy:** inspect network requests during generation; zero user-entered preference data goes to any service after model assets are downloaded.

## Release gate

Pass all six acceptance checks before calling the demo ready. Report any unsupported browser/device limits in the README and DEV post. Do not claim the challenge entry is submitted until the published DEV URL is visible.
