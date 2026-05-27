import { NextRequest, NextResponse } from "next/server";
import {
  OPENAI_API_BASE,
  OPENAI_TTS_MODEL,
  OPENAI_TTS_VOICE,
  getOpenAIKey,
} from "@/lib/openai-api";

export async function POST(request: NextRequest) {
  try {
    const { text, emotion } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const response = await fetch(`${OPENAI_API_BASE}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAIKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_TTS_MODEL,
        voice: OPENAI_TTS_VOICE,
        input: text,
        instructions: getSpeechInstructions(emotion),
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI speech API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to generate speech", details: errorText },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes("OPENAI_API_KEY")
            ? error.message
            : "Failed to generate speech",
      },
      { status: 500 }
    );
  }
}

function getSpeechInstructions(emotion?: string): string {
  const base = "Speak as Aquarius: warm, calm, concise, and clearly AI-generated.";

  switch (emotion) {
    case "happy":
    case "excited":
      return `${base} Use a brighter, more energetic tone.`;
    case "sad":
      return `${base} Use a gentle, reassuring tone.`;
    case "calm":
    case "relaxed":
      return `${base} Use a slow, serene tone.`;
    case "angry":
    case "frustrated":
      return `${base} Use a grounded, steady tone without escalating intensity.`;
    case "confident":
      return `${base} Use a clear, encouraging tone.`;
    default:
      return base;
  }
}
