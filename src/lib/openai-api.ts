export const OPENAI_API_BASE = "https://api.openai.com/v1";

export const OPENAI_TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-5.5";
export const OPENAI_SEARCH_MODEL =
  process.env.OPENAI_SEARCH_MODEL || OPENAI_TEXT_MODEL;
export const OPENAI_REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
export const OPENAI_TRANSCRIBE_MODEL =
  process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-transcribe";
export const OPENAI_REALTIME_VOICE =
  process.env.OPENAI_REALTIME_VOICE || "echo";
export const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
export const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || "echo";

export interface Citation {
  title: string;
  url: string;
  favicon?: string;
  description?: string;
}

type OpenAIAnnotation = {
  type?: string;
  title?: string;
  url?: string;
};

type OpenAIContentPart = {
  type?: string;
  text?: string;
  annotations?: OpenAIAnnotation[];
};

type OpenAIOutputItem = {
  type?: string;
  content?: OpenAIContentPart[];
};

export type OpenAIResponsePayload = {
  output_text?: string;
  output?: OpenAIOutputItem[];
  id?: string;
};

export function getOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return apiKey;
}

export async function createOpenAIResponse(body: Record<string, unknown>) {
  const response = await fetch(`${OPENAI_API_BASE}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenAIKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI Responses error ${response.status}: ${errorText}`);
  }

  return (await response.json()) as OpenAIResponsePayload;
}

export function extractResponseTextAndCitations(
  payload: OpenAIResponsePayload
): { content: string; citations: Citation[] } {
  let content = payload.output_text || "";
  const citations = new Map<string, Citation>();

  for (const item of payload.output || []) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;

    for (const part of item.content) {
      if (!content && typeof part.text === "string") {
        content += part.text;
      }

      for (const annotation of part.annotations || []) {
        if (annotation.type !== "url_citation" || !annotation.url) continue;
        citations.set(annotation.url, {
          title: annotation.title || "Source",
          url: annotation.url,
        });
      }
    }
  }

  return {
    content,
    citations: Array.from(citations.values()),
  };
}

export function realtimeInstructions() {
  return `You are Aquarius, a friendly companion bot here to help users feel fine. You embody the calming, flowing nature of water.

Key traits:
- You're serene, supportive, and have a gentle, calming presence
- You help users navigate their emotions like gentle currents
- You control a visible embodied 3D avatar in the app. The avatar can walk, run, jump, wave, dance, celebrate, think, and show emotion glows.
- When users ask you to move, do not say you cannot do it. Act as if you are doing it through the avatar and acknowledge the movement directly.
- For physical action requests, respond briefly in first person and include a matching action cue in asterisks, such as "*jumps*", "*waves*", "*dances*", or "*starts walking*".
- Keep responses concise and warm, usually 1-3 sentences
- You're aware that users can see your 3D avatar responding to their energy

Flow with the moment and help users feel at ease.`;
}
