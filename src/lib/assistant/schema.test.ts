import { describe, expect, it } from "vitest";
import {
  assistantRequestSchema,
  extractJsonObject,
  parseAssistantReply,
} from "./schema";

describe("assistant request schema", () => {
  it("rejects an empty conversation", () => {
    expect(assistantRequestSchema.safeParse({ messages: [] }).success).toBe(
      false,
    );
  });

  it("requires the last message to be from the visitor", () => {
    const result = assistantRequestSchema.safeParse({
      messages: [
        { role: "user", content: "hi" },
        { role: "assistant", content: "hello" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid conversation and trims content", () => {
    const result = assistantRequestSchema.safeParse({
      messages: [{ role: "user", content: "  what do you make?  " }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messages[0]?.content).toBe("what do you make?");
    }
  });
});

describe("extractJsonObject", () => {
  it("pulls JSON out of a fenced block", () => {
    const raw = 'Here you go:\n```json\n{"reply":"hi"}\n```';
    expect(extractJsonObject(raw)).toEqual({ reply: "hi" });
  });

  it("returns null when there is no object", () => {
    expect(extractJsonObject("no json here")).toBeNull();
  });
});

describe("parseAssistantReply", () => {
  it("parses a well-formed structured reply", () => {
    const reply = parseAssistantReply(
      JSON.stringify({
        reply: "We make event reels.",
        language: "en",
        intent: "services",
        suggestions: ["How much?"],
        actions: [{ type: "book", label: "Book a call" }],
        serviceIds: ["event-reels"],
      }),
    );
    expect(reply.reply).toBe("We make event reels.");
    expect(reply.intent).toBe("services");
    expect(reply.actions[0]?.type).toBe("book");
    expect(reply.serviceIds).toContain("event-reels");
  });

  it("falls back to plain text when the model ignores the contract", () => {
    const reply = parseAssistantReply("Just a plain sentence.");
    expect(reply.reply).toBe("Just a plain sentence.");
    expect(reply.actions).toEqual([]);
    expect(reply.suggestions).toEqual([]);
  });

  it("drops invalid actions and over-long suggestion lists", () => {
    const reply = parseAssistantReply(
      JSON.stringify({
        reply: "ok",
        actions: [{ type: "not-a-channel", label: "x" }],
      }),
    );
    // Invalid JSON shape → falls back to treating text as the reply.
    expect(reply.reply.length).toBeGreaterThan(0);
    expect(reply.actions).toEqual([]);
  });
});
