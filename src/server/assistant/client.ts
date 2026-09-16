import "server-only";

import Groq from "groq-sdk";
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

let cachedGroqClient: Groq | null = null;
let cachedAnthropicClient: Anthropic | null = null;

function getGroqClient(): Groq | null {
  if (!env.GROQ_API_KEY) return null;
  cachedGroqClient ??= new Groq({ apiKey: env.GROQ_API_KEY });
  return cachedGroqClient;
}

function getAnthropicClient(): Anthropic | null {
  if (!env.ANTHROPIC_API_KEY) return null;
  cachedAnthropicClient ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return cachedAnthropicClient;
}

/** True when a key is configured; the route degrades gracefully when false. */
export function assistantConfigured(): boolean {
  return Boolean(env.GROQ_API_KEY || env.ANTHROPIC_API_KEY);
}

/**
 * Sends the conversation to Groq (or Anthropic fallback) and returns a validated structured reply.
 */
export async function generateAssistantReply(
  messages: ChatMessage[],
  channels: AvailableChannels,
): Promise<AssistantReply> {
  const system = buildSystemPrompt(channels);
  const groq = getGroqClient();

  if (groq) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        model: env.ASSISTANT_MODEL || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: system },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        temperature: 0.2,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });

      const text = chatCompletion.choices[0]?.message?.content?.trim();
      if (!text) throw new AssistantUnavailableError("Empty model response from Groq");
      return parseAssistantReply(text);
    } catch (error) {
      console.error("Groq assistant call failed", error);
      if (error instanceof AssistantUnavailableError) throw error;
      throw new AssistantUnavailableError(
        error instanceof Error ? error.message : "Groq assistant error",
      );
    }
  }

  const anthropic = getAnthropicClient();
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: env.ASSISTANT_MODEL,
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: system,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
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
      console.error("Anthropic call failed", error);
      throw new AssistantUnavailableError();
    }
  }

  throw new AssistantUnavailableError("No API key configured");
}
