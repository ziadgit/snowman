# Aquarius

Aquarius is a browser-based 3D companion built with Next.js, React, Three.js, and OpenAI APIs. It combines typed chat, live voice, speech playback, web-search-backed side quests, and embodied avatar actions.

**Live demo:** https://snowman-taupe.vercel.app/

## OpenAI APIs

- **Realtime API**: live browser voice over WebRTC through `/api/realtime/call`.
- **Responses API**: typed assistant chat through `/api/chat`.
- **Responses API + `web_search`**: current news and astrology responses through `/api/news` and `/api/astrology`.
- **Audio Speech**: typed-chat voice playback through `/api/speak`.
- **Audio Transcriptions**: request-based transcription fallback through `/api/transcribe`.

Server routes use `OPENAI_API_KEY`. The browser never receives the API key.

## Local Setup

```bash
npm install
```

Create `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key

# Optional overrides
OPENAI_REALTIME_MODEL=gpt-realtime-2
OPENAI_TEXT_MODEL=gpt-5.5
OPENAI_SEARCH_MODEL=gpt-5.5
OPENAI_TRANSCRIBE_MODEL=gpt-4o-transcribe
OPENAI_REALTIME_VOICE=echo
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=echo
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Project Layout

- `src/app/page.tsx`: main UI, avatar interaction, chat, and Realtime client wiring.
- `src/app/api/*`: server-side OpenAI API routes.
- `src/lib/openai-api.ts`: shared OpenAI model defaults and response helpers.
- `src/components/Robot3D.tsx`: 3D avatar renderer and animation controller.
- `src/lib/emotion-mapping.ts`: command/action parsing for embodied responses.
- `specs/00-openai-realtime-port.md`: current behavior contract.
- `fix_plan.md`: Ralph loop backlog.

Built by [Ziad](https://github.com/ziadgit) and [Hannah](https://github.com/yanhann10).
