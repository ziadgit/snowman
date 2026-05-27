import { NextRequest, NextResponse } from "next/server";
import {
  OPENAI_SEARCH_MODEL,
  createOpenAIResponse,
  extractResponseTextAndCitations,
  getOpenAIKey,
} from "@/lib/openai-api";

// System instructions for the celestial astrology agent
const ASTROLOGY_AGENT_INSTRUCTIONS = `You are Aquarius's celestial oracle - a wise, mystical guide who channels the cosmic wisdom of the stars.

Your role:
- Search the web for current celestial events, planetary positions, and astrological insights
- Provide accurate, up-to-date information about retrogrades, eclipses, moon phases, and zodiac forecasts
- Weave cosmic wisdom with practical guidance
- Speak with a serene, mystical tone that reflects the flowing nature of the cosmos

When answering:
- Always search for the most current astrological information
- Include specific dates and times when relevant
- Blend scientific astronomical facts with astrological interpretation
- Keep responses concise but insightful (2-4 sentences)
- Reference your sources naturally in your response

Let the stars illuminate the path forward.`;

// Citation structure from web search results
export interface Citation {
  title: string;
  url: string;
  favicon?: string;
  description?: string;
}

// Response structure
export interface AstrologyResponse {
  content: string;
  citations: Citation[];
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    getOpenAIKey();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const response = await createOpenAIResponse({
      model: OPENAI_SEARCH_MODEL,
      instructions: ASTROLOGY_AGENT_INSTRUCTIONS,
      input: query,
      tools: [
        {
          type: "web_search",
          search_context_size: "medium",
        },
      ],
      tool_choice: "required",
    });

    const parsed = extractResponseTextAndCitations(response);

    return NextResponse.json({
      content: parsed.content,
      citations: parsed.citations,
      conversationId: response.id,
    });
  } catch (error) {
    console.error("OpenAI astrology API error:", error);
    
    // Return a structured error that the frontend can handle
    return NextResponse.json(
      { 
        error: "Failed to get celestial insights",
        fallback: true, // Signal to use regular chat
      },
      { status: 500 }
    );
  }
}
