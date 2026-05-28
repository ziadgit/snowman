# fix_plan.md

Prioritized backlog. Each item should map to `specs/`.

## P0 — OpenAI provider migration

- [x] P0 — Replace Mistral chat/news/astrology/transcribe server routes with OpenAI-backed routes — spec: `specs/00-openai-realtime-port.md`
- [x] P0 — Add GA Realtime WebRTC `/api/realtime/call` route and client connection controls — spec: `specs/00-openai-realtime-port.md`
- [x] P1 — Update README/env/dependency references away from runtime Mistral — spec: `specs/00-openai-realtime-port.md`
- [x] P0 — Replace ElevenLabs `/api/speak` with OpenAI Audio Speech so typed-chat voice uses `OPENAI_API_KEY` — spec: `specs/00-openai-realtime-port.md`
- [x] P0 — Remove stale ElevenLabs UI/docs copy from typed-chat voice controls — spec: `specs/00-openai-realtime-port.md`
- [x] P0 — Update model instructions so Aquarius knows it controls the embodied avatar and can perform supported actions — spec: `specs/00-openai-realtime-port.md`

## Discovered

- [x] P0 — Fix `/api/realtime/call` multipart proxy so OpenAI receives required `sdp` and `session` form fields — spec: `specs/00-openai-realtime-port.md`
- [ ] P0 — Rewrite README as a minimal Aquarius/OpenAI README and remove all mentions of Mistral, ElevenLabs, and Finestral — spec: `specs/00-openai-realtime-port.md`
- [ ] P0 — Replace the mic button with Spacebar microphone toggle UI, including enabled/disabled/connecting status and no button-rendered microphone control — spec: `specs/00-openai-realtime-port.md`
- [ ] P1 — Add optional Realtime push-to-talk mode with VAD disabled, press/release controls, and explicit `input_audio_buffer.commit` + `response.create` flow — spec: `specs/00-openai-realtime-port.md`
- [x] P1 — Pin Next Turbopack root in `next.config.ts` to remove parent-lockfile workspace warning during `npm run dev` — spec: `specs/00-openai-realtime-port.md`
