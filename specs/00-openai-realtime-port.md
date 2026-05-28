# OpenAI Realtime Port Spec

## Goal

Port the app away from Mistral runtime APIs and add an OpenAI Realtime voice path based on the GA Realtime WebRTC flow.

## Requirements

- No production route imports `@mistralai/mistralai`.
- Runtime configuration uses `OPENAI_API_KEY`.
- Text chat uses OpenAI Responses and preserves the existing message contract: `{ content }`.
- News and astrology use OpenAI Responses with hosted `web_search`, returning `{ content, citations, conversationId? }`.
- Request-based speech synthesis uses OpenAI Audio Speech and preserves the existing binary MP3 response contract from `/api/speak`.
- File transcription fallback uses OpenAI Audio transcriptions and returns `{ text, emotion }`.
- Live browser voice uses a server route that posts SDP plus session configuration to `/v1/realtime/calls` and returns the SDP answer.
- The `/api/realtime/call` route must proxy browser SDP offers using multipart form fields named exactly `sdp` and `session`, matching the GA unified WebRTC interface. The fields are sent as normal `FormData` values, not as file uploads, so OpenAI receives `sdp` as a form field.
- The client can open and close a Realtime voice session without exposing the OpenAI API key.
- Existing 3D animation, tide XP, secret-world, and typed-chat flows continue to work.
- Next dev should run from this app directory without workspace-root ambiguity. `next.config.ts` pins Turbopack root to the repository directory so the parent `/Users/ziad/package-lock.json` does not affect lockfile/root inference.
- UI copy must not mention non-OpenAI voice providers. The typed-chat speech checkbox is labeled as OpenAI voice.
- System instructions must tell the model that it controls a visible embodied avatar and can perform supported avatar actions. For supported commands like jump, wave, dance, and walk, the model must not claim it cannot perform the action.
- Physical action responses include short asterisk action cues (`*jumps*`, `*waves*`, `*dances*`, etc.) so the existing action parser can drive the avatar.
- README is minimal and current-runtime focused. It must not mention Mistral, ElevenLabs, or Finestral; it should describe Aquarius and the OpenAI APIs used by this app.

## README Contract

- Title is `Aquarius`.
- Keep the README concise: what the app is, what OpenAI APIs it uses, local setup, env vars, and commands.
- Do not include historical hackathon/provider/fine-tuning narrative.
- Mention OpenAI APIs where used:
  - Realtime API for live browser voice over WebRTC.
  - Responses API for typed chat and web-search-backed news/astrology.
  - Audio Speech for typed-chat voice playback.
  - Audio Transcriptions as the request-based transcription fallback.
- Env examples include `OPENAI_API_KEY` plus optional OpenAI model/voice overrides only.

## Realtime Voice Control

### Spacebar Microphone Toggle

- The UI does not render a microphone button.
- The input area shows a concise status/control line: `Press Space or T to enable microphone` when disabled and `Microphone enabled - press Space or T to disable` when enabled.
- The status line also shows a clear enabled/disabled visual state, such as a green/red dot or badge.
- Pressing Space or T toggles the microphone only when the text input is not focused and no modal/interactive text control is active.
- Toggling on opens a live WebRTC session and enables microphone capture.
- Toggling off disables the local microphone track and updates status immediately without closing the Realtime session or interrupting an in-progress assistant response.
- The Realtime session only fully closes on connection close/error, page unmount, or an explicit teardown path.
- The UI must distinguish transient connection state from enabled state, e.g. `Connecting...`.
- The visible state must stay accurate if the Realtime data channel closes or the session errors.

### Open Mic Session Behavior

- The voice session uses server VAD.
- Session config sets `audio.input.turn_detection.type` to `server_vad`.
- User transcript bubbles come from `conversation.item.input_audio_transcription.completed`.
- Assistant bubbles come from `response.output_audio_transcript.done`.
- Spoken local commands are dispatched through the same local handlers as command buttons.
- A spoken local command suppresses/cancels the model response for that same utterance so command feedback and assistant speech do not overlap.
- Saying `warp secret` or another secret-world warp phrase enters Sky Island.
- In Sky Island, saying `magic`, `collect`, `left`, `right`, `forward`, or supported home phrases performs the same action as the matching quick-command button.

### Push To Talk

- Reserved for a later mode if needed. Do not implement a separate push-to-talk UI until the spacebar toggle is stable.
- Push-to-talk uses the same WebRTC connection route, but disables automatic turn detection by setting `audio.input.turn_detection` to `null` in the session config or via `session.update`.
- Push down behavior:
  - Clear previous input with `input_audio_buffer.clear`.
  - If a response is in progress, send `response.cancel`.
  - If assistant audio is still buffered, send `output_audio_buffer.clear`.
  - Enable the microphone track.
- Push up behavior:
  - Disable the microphone track.
  - Commit captured audio with `input_audio_buffer.commit`.
  - Trigger the assistant with `response.create`.
- Spacebar acts as the push control when the text input is not focused.
- Push-to-talk must not submit blank turns if no audio was captured.

## Model Defaults

- Realtime: `OPENAI_REALTIME_MODEL` or `gpt-realtime-2`.
- Text/search: `OPENAI_TEXT_MODEL` or `gpt-5.5`.
- Audio transcription: `OPENAI_TRANSCRIBE_MODEL` or `gpt-4o-transcribe`.
- Realtime voice: `OPENAI_REALTIME_VOICE` or `echo`.
- Request speech: `OPENAI_TTS_MODEL` or `gpt-4o-mini-tts`.
- Request speech voice: `OPENAI_TTS_VOICE` or `echo`.

## Verification

- `npm run lint`
- `npm run build`
