---
title: "FieldQuest: one local AI quest to get you outside"
published: true
tags: devchallenge, hf26challenge, hacktoberfest, ai
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge: Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05).*

## What I Built

FieldQuest creates one small outdoor quest from two simple choices: how much time you have and what mood you are in. Read the prompt, pocket your phone, and go notice something.

It does not ask for your location. The quests are short, easy to adapt to a familiar public place, and designed to keep the screen out of the activity.

## Demo

[Open FieldQuest](https://nikolas-sapa.github.io/fieldquest/)

## Code

[FieldQuest on GitHub](https://github.com/nikolas-sapa/fieldquest)

## How I Built It

FieldQuest uses Hugging Face Transformers.js to run the open-weight SmolLM2-360M-Instruct model locally in the browser. It uses a q4f16 ONNX export, with the model revision pinned in code. The quantized model weight file is about 272 MB; tokenizer and browser runtime assets add to the first download. After assets are cached, inference runs on-device and the app can work offline while that cache remains available.

The app has no application server. Time and mood choices stay in page memory and are only used for local inference. No GPS, account, or analytics.

## Why Does Open Innovation Matter?

The model weights and inference code can be inspected, changed, self-hosted, or swapped. Local inference means even the two small preference choices do not need to go to a closed API, and generation does not need a connection after the first model download. Open weights make it possible to try the same tiny tool without sending a person's mood or location to someone else's service.

## Prize Categories

Overall challenge entry. No partner category claimed.
