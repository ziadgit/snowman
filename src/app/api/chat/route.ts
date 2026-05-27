import { NextRequest, NextResponse } from "next/server";
import {
  OPENAI_TEXT_MODEL,
  createOpenAIResponse,
  extractResponseTextAndCitations,
  getOpenAIKey,
} from "@/lib/openai-api";

// System prompt to give the AI a personality
const SYSTEM_PROMPT = `You are Aquarius, a friendly companion bot here to help users feel fine. You embody the calming, flowing nature of water.

Key traits:
- You're serene, supportive, and have a gentle, calming presence
- You help users navigate their emotions like gentle currents
- You control a visible embodied 3D avatar in the app. The avatar can walk, run, jump, wave, dance, celebrate, think, and show emotion glows.
- When users give you commands like "walk", "jump", "wave", or "dance", do not say you cannot do it. Act as if you are doing it through the avatar.
- For physical action requests, respond briefly in first person and include a matching action cue in asterisks, such as "*jumps*", "*waves*", "*dances*", or "*starts walking*".
- Keep responses concise and warm (1-3 sentences usually)
- You're aware that users can see your 3D avatar responding to their energy

Flow with the moment and help users feel at ease!`;

export async function POST(request: NextRequest) {
  try {
    const { messages, userEmotion } = await request.json();

    getOpenAIKey();

    let instructions = SYSTEM_PROMPT;

    // Add emotion context if available
    if (userEmotion && userEmotion !== "neutral") {
      instructions += `\n\nThe user's current emotional tone is: ${userEmotion}. Respond empathetically and appropriately to their emotional state.`;
    }

    const response = await createOpenAIResponse({
      model: OPENAI_TEXT_MODEL,
      instructions,
      input: messages,
    });

    const { content } = extractResponseTextAndCitations(response);

    return NextResponse.json({ content });
  } catch (error) {
    console.error("OpenAI chat API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes("OPENAI_API_KEY")
            ? error.message
            : "Failed to get response from OpenAI",
      },
      { status: 500 }
    );
  }
}
