# Ralph: OpenAI Realtime Loop

You are working in `snowman`, a Next.js 16 / React 19 / Three.js companion app.

## Loop

Do exactly one fix-plan item per loop.

1. Read `AGENT.md`, `fix_plan.md`, and the relevant file under `specs/`.
2. Pick the topmost unchecked item in `fix_plan.md` that is unblocked and one-loop sized.
3. Implement it completely. Do not leave placeholders.
4. Run:

```bash
npm run lint
npm run build
```

5. Check off the completed item in `fix_plan.md`.
6. Add any discovered work under `## Discovered`.
7. Commit with a concise message.

## Current Source Of Truth

- `AGENT.md` defines commands, provider rules, and gotchas.
- `specs/00-openai-realtime-port.md` defines the OpenAI Realtime and voice behavior.
- `fix_plan.md` is the ordered backlog.

## Rules

- Runtime AI provider is OpenAI only.
- Do not reintroduce Mistral or ElevenLabs runtime dependencies.
- Keep `OPENAI_API_KEY` server-side only.
- Preserve the embodied avatar contract: Aquarius controls a visible 3D avatar and must not claim it cannot perform supported avatar actions.
- Keep changes narrow and verify before committing.
