import { NextRequest, NextResponse } from "next/server";
import {
  OPENAI_API_BASE,
  OPENAI_TEXT_MODEL,
  OPENAI_TRANSCRIBE_MODEL,
  createOpenAIResponse,
  extractResponseTextAndCitations,
  getOpenAIKey,
} from "@/lib/openai-api";

export async function POST(request: NextRequest) {
  try {
    const apiKey = getOpenAIKey();

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const audioFormData = new FormData();
    audioFormData.set("file", audioFile, audioFile.name || "recording.wav");
    audioFormData.set("model", OPENAI_TRANSCRIBE_MODEL);

    const transcriptionResponse = await fetch(
      `${OPENAI_API_BASE}/audio/transcriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: audioFormData,
      }
    );

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      throw new Error(
        `OpenAI transcription error ${transcriptionResponse.status}: ${errorText}`
      );
    }

    const transcription = (await transcriptionResponse.json()) as { text?: string };

    const text = transcription.text || "";

    let emotion = "neutral";

    try {
      const emotionResponse = await createOpenAIResponse({
        model: OPENAI_TEXT_MODEL,
        instructions:
          "Analyze emotional tone. Respond with only one lowercase word such as happy, sad, angry, neutral, excited, frustrated, calm, anxious, confused, or confident.",
        input: text || "No transcript.",
      });
      const { content } = extractResponseTextAndCitations(emotionResponse);
      emotion = content
        .trim()
        .split(/\s+/)[0]
        .toLowerCase()
        .replace(/[^a-z]/g, "") || "neutral";
    } catch (emotionError) {
      console.warn("Emotion detection failed, using neutral:", emotionError);
    }

    return NextResponse.json({ text, emotion });
  } catch (error) {
    console.error("OpenAI transcription error:", error);
    
    // Check if it's a rate limit error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("429") || errorMessage.includes("rate")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
