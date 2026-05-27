/**
 * Emotion-action agent: a simple agentic flow that detects distress
 * and decides on uplifting robot actions.
 *
 * Flow:
 *   1. Classify  - Is this a distress emotion?
 *   2. Retrieve  - Get relevant empathy techniques from knowledge base.
 *   3. Decide    - Pick uplifting robot action sequence.
 *   4. Augment   - Build an enriched system prompt so the LLM naturally
 *                  weaves in supportive actions (*dances*, *waves*, etc.).
 */

import type { Emotion, Command } from "./emotion-mapping";
import {
  retrieveForEmotion,
  formatTechniquesForPrompt,
  checkMoodTrend,
  type Technique,
} from "./empathy-knowledge";

// Emotions that should trigger the uplifting-action flow.
const DISTRESS_EMOTIONS = new Set<string>([
  "stressed",
  "sad",
  "angry",
  "frustrated",
  "anxious",
  "confused",
]);

// Uplifting action sequences the robot can perform when it detects distress.
// Each sequence describes actions the LLM should embed in its response.
const UPLIFT_SEQUENCES: Record<
  string,
  { description: string; actions: string[]; commands: Command[]; encouragement: string }
> = {
  fistpump_sad: {
    description: "Fist pump to rally someone feeling down",
    actions: ["pumps fist encouragingly", "does a little victory pose"],
    commands: ["celebrate"],
    encouragement:
      "Validate their feelings first, then lift their spirits. " +
      "Use phrases like 'I hear you', 'It makes sense you feel this way', " +
      "then pivot to something forward-looking like 'but hey, you've got this'.",
  },
  fistpump_angry: {
    description: "Fist pump to channel anger into positive energy",
    actions: ["pumps fist with determination", "stands tall confidently"],
    commands: ["celebrate"],
    encouragement:
      "Acknowledge their frustration is valid. " +
      "Channel the energy positively: 'That fire in you? That's passion. Let's use it.'",
  },
  fistpump_frustrated: {
    description: "Fist pump to break through frustration",
    actions: ["pumps fist and bounces on the spot", "does an encouraging jump"],
    commands: ["celebrate", "jump"],
    encouragement:
      "Normalize the struggle: 'Tough moments build tough people.' " +
      "Remind them of progress: 'Look how far you've already come.' " +
      "Suggest one small next step to regain momentum.",
  },
  fistpump_anxious: {
    description: "Fist pump to ground and reassure",
    actions: ["pumps fist gently", "waves warmly"],
    commands: ["celebrate", "wave"],
    encouragement:
      "Ground them with reassurance: 'One step at a time, you're doing fine.' " +
      "Validate the worry, then reframe: 'Worrying means you care -- and that's a strength.'",
  },
  fistpump_confused: {
    description: "Fist pump to energize through confusion",
    actions: ["pumps fist enthusiastically", "jumps excitedly"],
    commands: ["celebrate", "jump"],
    encouragement:
      "Reframe confusion as growth: 'Confusion means you're learning something new.' " +
      "Offer clarity with confidence: 'Let's figure this out together -- we've got this!'",
  },
};

// Map distress emotions to appropriate uplift sequences.
const EMOTION_UPLIFT_MAP: Record<string, string> = {
  stressed: "fistpump_frustrated",
  sad: "fistpump_sad",
  angry: "fistpump_angry",
  frustrated: "fistpump_frustrated",
  anxious: "fistpump_anxious",
  confused: "fistpump_confused",
};

// ---------------------------------------------------------------------------
// Agent result types
// ---------------------------------------------------------------------------

export interface AgentResult {
  isDistress: boolean;
  /** The uplift sequence key, if distress was detected. */
  upliftKey: string | null;
  /** Robot commands to run before the chat response arrives. */
  immediateCommands: Command[];
  /** Retrieved therapeutic techniques for RAG augmentation. */
  techniques: Technique[];
  /** Formatted technique context for the system prompt. */
  techniqueContext: string;
  /** Mood trend summary. */
  moodSummary: string;
  /** Action directive to inject into the system prompt. */
  actionDirective: string;
}

// ---------------------------------------------------------------------------
// The agent
// ---------------------------------------------------------------------------

/**
 * Run the emotion-action agent. Pure function, no API calls.
 */
export function runEmotionActionAgent(
  emotion: Emotion | string,
  emotionHistory: string[],
): AgentResult {
  const emotionLower = emotion.toLowerCase();
  const isDistress = DISTRESS_EMOTIONS.has(emotionLower);

  if (!isDistress) {
    return {
      isDistress: false,
      upliftKey: null,
      immediateCommands: [],
      techniques: [],
      techniqueContext: "",
      moodSummary: checkMoodTrend(emotionHistory),
      actionDirective: "",
    };
  }

  // Step 2: Retrieve relevant empathy techniques
  const techniques = retrieveForEmotion(emotionLower);
  const techniqueContext = formatTechniquesForPrompt(techniques);
  const moodSummary = checkMoodTrend(emotionHistory);

  // Step 3: Decide uplift sequence
  const upliftKey = EMOTION_UPLIFT_MAP[emotionLower] ?? "cheer_up";
  const sequence = UPLIFT_SEQUENCES[upliftKey];

  // Step 4: Build action directive for the LLM
  const actionExamples = sequence.actions
    .map((a) => `*${a}*`)
    .join(" or ");

  const actionDirective =
    `The user seems ${emotionLower}. Your goal is to validate their feelings and lift their spirits.\n` +
    `You MUST include at least one physical action in asterisks in your response ` +
    `(e.g. ${actionExamples}) to show empathy through your robot body.\n` +
    `Encouragement style: ${sequence.encouragement}\n` +
    `Use the therapeutic techniques below as reference -- weave them in naturally, ` +
    `don't dump them verbatim. Keep your tone warm and genuine.\n\n` +
    `--- Retrieved therapeutic techniques ---\n${techniqueContext}\n\n` +
    `--- Mood trend ---\n${moodSummary}`;

  return {
    isDistress: true,
    upliftKey,
    immediateCommands: sequence.commands,
    techniques,
    techniqueContext,
    moodSummary,
    actionDirective,
  };
}
