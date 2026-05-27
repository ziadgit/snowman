import { NextRequest, NextResponse } from "next/server";
import {
  OPENAI_SEARCH_MODEL,
  createOpenAIResponse,
  extractResponseTextAndCitations,
  getOpenAIKey,
} from "@/lib/openai-api";

// System instructions for the news agent
const NEWS_AGENT_INSTRUCTIONS = `You are Aquarius's news companion - a calm guide to current events.

Rules:
- Share a MAXIMUM of 2-3 stories total
- Use exactly 1 short sentence per story (under 20 words each)
- If there's major negative news, acknowledge it briefly (1 sentence), then move on
- Always end with one positive or uplifting story
- Keep your TOTAL response under 5 sentences
- No bullet points, headers, or formatting - just flowing, conversational text
- You MUST include source citations for each news story you mention

Example tone: "There's been an earthquake in Turkey with rescue efforts underway. In lighter news, a new wildlife sanctuary opened in Kenya, and scientists discovered a more efficient solar cell."`;

// Citation structure from web search results
export interface Citation {
  title: string;
  url: string;
  favicon?: string;
  description?: string;
}

// Response structure
export interface NewsResponse {
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
      instructions: NEWS_AGENT_INSTRUCTIONS,
      input: query,
      tools: [
        {
          type: "web_search",
          search_context_size: "low",
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
    console.error("OpenAI news API error:", error);
    
    // Return a structured error that the frontend can handle
    return NextResponse.json(
      { 
        error: "Failed to get news updates",
        fallback: true, // Signal to use regular chat
      },
      { status: 500 }
    );
  }
}
