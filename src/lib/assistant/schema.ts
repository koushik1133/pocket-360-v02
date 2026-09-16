import { z } from "zod";

/**
 * Shared assistant contract. This module is safe to import from both client and
 * server code, so it must not pull in any server-only dependencies.
 */

export const MAX_MESSAGE_LENGTH = 1200;
export const MAX_HISTORY_MESSAGES = 20;

export const assistantIntents = [
  "greeting",
  "services",
  "pricing",
  "recommend",
  "booking",
  "onboarding",
  "requirements",
  "portfolio",
  "contact",
  "privacy",
  "terms",
  "company_info",
  "human_handoff",
  "smalltalk",
  "off_topic",
  "other",
] as const;

export type AssistantIntent = (typeof assistantIntents)[number];

/** Channels and internal views the assistant can direct a visitor toward. */
export const assistantActionTypes = [
  "book",
  "whatsapp",
  "email",
  "call",
  "instagram",
  "privacy",
  "terms",
  "work",
  "about",
  "contact",
  "services",
] as const;


export type AssistantActionType = (typeof assistantActionTypes)[number];

export const assistantActionSchema = z.object({
  type: z.enum(assistantActionTypes),
  label: z.string().trim().min(1).max(48),
});

export type AssistantAction = z.infer<typeof assistantActionSchema>;

const cleanText = (value: string) =>
  value.replace(/\0/g, "").replace(/[ \t]+\n/g, "\n").trim();

/** One turn in the conversation as exchanged with the API route. */
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(1).max(MAX_MESSAGE_LENGTH)),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

/** Request body accepted by POST /api/assistant. */
export const assistantRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "Send at least one message")
    .max(MAX_HISTORY_MESSAGES, "Conversation is too long")
    .refine(
      (messages) => messages[messages.length - 1]?.role === "user",
      "The final message must come from the visitor",
    ),
  language: z.string().trim().max(12).optional(),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

/**
 * Structured payload the model is asked to return. Parsed defensively: the model
 * is instructed to emit exactly this shape, but the route tolerates extra keys
 * and falls back to plain text when JSON is malformed.
 */
export const assistantReplySchema = z.object({
  reply: z.string().trim().min(1).max(2000),
  language: z.string().trim().max(12).optional().default("en"),
  intent: z.enum(assistantIntents).optional().default("other"),
  suggestions: z
    .array(z.string().trim().min(1).max(80))
    .max(3)
    .optional()
    .default([]),
  actions: z.array(assistantActionSchema).max(3).optional().default([]),
  serviceIds: z
    .array(z.string().trim().min(1).max(48))
    .max(4)
    .optional()
    .default([]),
});

export type AssistantReply = z.infer<typeof assistantReplySchema>;

/** Response envelope returned to the browser. */
export type AssistantResponse = AssistantReply & {
  degraded: boolean;
};

/**
 * Pulls the first balanced JSON object out of a model response, tolerating code
 * fences or stray prose around it. Returns null when nothing parses.
 */
export function extractJsonObject(text: string): unknown {
  const withoutFences = text
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = withoutFences.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as unknown;
  } catch {
    return null;
  }
}

/**
 * Turns raw model text into a validated reply. When the model ignored the JSON
 * contract, the whole text becomes the reply so the visitor still gets an answer.
 */
export function parseAssistantReply(text: string): AssistantReply {
  const parsedJson = extractJsonObject(text);
  if (parsedJson) {
    const result = assistantReplySchema.safeParse(parsedJson);
    if (result.success) return result.data;
  }

  return assistantReplySchema.parse({ reply: text.trim() || FALLBACK_REPLY });
}

export const FALLBACK_REPLY =
  "I'm here to help with Pocket Reels 360. Ask me about our reels, how we work, or book a call and the crew will follow up.";
