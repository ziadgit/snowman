import { NextRequest, NextResponse } from "next/server";
import {
  OPENAI_API_BASE,
  OPENAI_REALTIME_MODEL,
  OPENAI_REALTIME_VOICE,
  OPENAI_TRANSCRIBE_MODEL,
  getOpenAIKey,
  realtimeInstructions,
} from "@/lib/openai-api";

export async function POST(request: NextRequest) {
  try {
    const apiKey = getOpenAIKey();
    const sdp = await request.text();

    if (!sdp.trim()) {
      return NextResponse.json(
        { error: "SDP offer is required" },
        { status: 400 }
      );
    }

    const session = {
      type: "realtime",
      model: OPENAI_REALTIME_MODEL,
      instructions: realtimeInstructions(),
      output_modalities: ["audio"],
      audio: {
        input: {
          transcription: {
            model: OPENAI_TRANSCRIBE_MODEL,
          },
          turn_detection: {
            type: "server_vad",
          },
        },
        output: {
          voice: OPENAI_REALTIME_VOICE,
        },
      },
      reasoning: {
        effort: "low",
      },
    };

    const formData = new FormData();
    formData.set("sdp", sdp);
    formData.set("session", JSON.stringify(session));

    const response = await fetch(`${OPENAI_API_BASE}/realtime/calls`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    const answer = await response.text();

    if (!response.ok) {
      console.error("OpenAI Realtime call error:", response.status, answer);
      return NextResponse.json(
        { error: "Failed to create Realtime call", details: answer },
        { status: response.status }
      );
    }

    return new NextResponse(answer, {
      status: response.status,
      headers: {
        "Content-Type": "application/sdp",
      },
    });
  } catch (error) {
    console.error("Realtime session error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes("OPENAI_API_KEY")
            ? error.message
            : "Failed to create Realtime session",
      },
      { status: 500 }
    );
  }
}
