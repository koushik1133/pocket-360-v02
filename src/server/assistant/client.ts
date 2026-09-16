import "server-only";

import Groq from "groq-sdk";
import { env } from "@/env";
import {
  type AssistantReply,
  type ChatMessage,
  parseAssistantReply,
} from "@/lib/assistant/schema";
import {
  type AvailableChannels,
  buildSystemPrompt,
} from "@/server/assistant/system-prompt";

/** Thrown when the model is configured but the upstream call fails. */
export class AssistantUnavailableError extends Error {
  constructor(message = "The assistant is temporarily unavailable") {
    super(message);
    this.name = "AssistantUnavailableError";
  }
}

let cachedGroqClient: Groq | null = null;

function getGroqClient(): Groq | null {
  if (!env.GROQ_API_KEY) return null;
  cachedGroqClient ??= new Groq({ apiKey: env.GROQ_API_KEY, maxRetries: 1 });
  return cachedGroqClient;
}

/** True when a Groq key is configured; the route degrades gracefully when false. */
export function assistantConfigured(): boolean {
  return Boolean(env.GROQ_API_KEY);
}

/**
 * Sends the conversation to Groq and returns a validated structured reply.
 */
export async function generateAssistantReply(
  messages: ChatMessage[],
  channels: AvailableChannels,
): Promise<AssistantReply> {
  const groq = getGroqClient();
  if (!groq) throw new AssistantUnavailableError("No API key configured");

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: env.ASSISTANT_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(channels) },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const text = chatCompletion.choices[0]?.message?.content?.trim();
    if (!text) throw new AssistantUnavailableError("Empty model response from Groq");
    return parseAssistantReply(text);
  } catch (error) {
    if (error instanceof AssistantUnavailableError) throw error;
    console.error("Groq assistant call failed", error);
    throw new AssistantUnavailableError(
      error instanceof Error ? error.message : "Groq assistant error",
    );
  }
}
