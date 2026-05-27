# Design Choices

## Emotion-Action Agent (action branch)

### Architecture
- **Simple agentic flow** (classify -> retrieve -> decide -> augment) runs server-side as a pure function, no extra API calls
  - Alternative: could use OpenAI function calling for dynamic action selection
  - Alternative: could run a multi-step LLM chain for richer decision-making
- **Empathy knowledge base ported from windx/rag-empathy** as a TypeScript module (in-memory keyword-based retrieval)
  - Alternative: vector DB (FAISS/Qdrant) for semantic retrieval at scale
  - Alternative: embedding-based lookup for fuzzy emotion matching
- **Immediate uplift animation** fires before the chat response arrives, giving instant visual feedback
  - Trade-off: animation may not perfectly match the eventual text response

### Emotion-to-Action Mapping
- Static mapping from distress emotions to uplift sequences (4 predefined sequences)
  - Alternative: LLM-selected actions based on conversation context
  - Alternative: user-preference learning over time
- Distress emotions: stressed, sad, angry, frustrated, anxious, confused
- Non-distress emotions fall through to existing emotion-animation pipeline unchanged

### RAG Integration
- Therapeutic techniques injected into the system prompt when distress detected
  - Trade-off: increases prompt size; could hit token limits on very long conversations
  - Alternative: summarize techniques before injection
- LLM instructed to embed physical actions in asterisks (`*dances*`) which the existing action parser handles
  - Reuses the 70+ action keyword mapping already in emotion-mapping.ts

### Library/Tool Selections
- **OpenAI Responses** for typed chat generation and **OpenAI Realtime** for live voice
- **No new dependencies added** - agent logic is pure TypeScript
- **windx knowledge_base.py** ported to TypeScript as empathy-knowledge.ts
  - Kept subset of techniques most relevant to robot interactions (dropped grounding_object since robot can't hold objects)

### Areas for Future Improvement
- Persist emotion history across sessions (currently resets on page reload)
- Add multi-step action sequences (dance -> wave -> celebrate chain with timing)
- Fine-tune action selection with user feedback loop
- Add crisis detection (988 referral) from windx agent
- Stream chat responses for lower perceived latency
- Connect to windx empathy_server.py for voice-based emotion detection instead of text-only

AI generated and human reviewed
