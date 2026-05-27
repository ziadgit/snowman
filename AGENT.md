# AGENT.md

Project: **snowman / Aquarius** — Next.js 16 3D companion app with voice, chat, web-search side quests, and a Three.js avatar.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Provider Contract

- Runtime AI provider is OpenAI, not Mistral.
- Browser live voice uses the GA Realtime WebRTC flow through `/api/realtime/call`.
- Server routes use `OPENAI_API_KEY`; never expose it to client code.
- Request-based text/search/audio fallbacks use OpenAI HTTP APIs directly with `fetch`, avoiding SDK coupling.

## Gotchas

- The project is not currently a git repository, so Ralph-style record steps cannot commit unless git is initialized later.
- Realtime WebRTC `/v1/realtime/calls` accepts multipart form data with `sdp` and `session`; do not add the beta `OpenAI-Beta` header for GA.
- Realtime voice output is audio-first; display text comes from transcript events such as `response.output_audio_transcript.done`.
