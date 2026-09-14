import "server-only";

import Anthropic from "@anthropic-ai/sdk";
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

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!env.ANTHROPIC_API_KEY) return null;
  cachedClient ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return cachedClient;
}

/** True when a key is configured; the route degrades gracefully when false. */
export function assistantConfigured(): boolean {
  return Boolean(env.ANTHROPIC_API_KEY);
}

function toApiMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

/**
 * Sends the conversation to Claude and returns a validated structured reply.
 * The system prompt carries a cache breakpoint so repeat turns reuse the prefix.
 */
export async function generateAssistantReply(
  messages: ChatMessage[],
  channels: AvailableChannels,
): Promise<AssistantReply> {
  const client = getClient();
  if (!client) throw new AssistantUnavailableError("No API key configured");

  const system = buildSystemPrompt(channels);

  try {
    const response = await client.messages.create({
      model: env.ASSISTANT_MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: system,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: toApiMessages(messages),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!text) throw new AssistantUnavailableError("Empty model response");

    return parseAssistantReply(text);
  } catch (error) {
    if (error instanceof AssistantUnavailableError) throw error;
    if (error instanceof Anthropic.APIError) {
      console.error("Assistant API error", {
        status: error.status,
        message: error.message,
      });
      throw new AssistantUnavailableError();
    }
    console.error("Assistant call failed", error);
    throw new AssistantUnavailableError();
  }
}
