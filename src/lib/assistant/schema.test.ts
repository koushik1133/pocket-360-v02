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

  it("parses privacy policy and terms actions correctly", () => {
    const reply = parseAssistantReply(
      JSON.stringify({
        reply: "You can read our privacy policy here.",
        language: "en",
        intent: "privacy",
        suggestions: ["How do I book?"],
        actions: [{ type: "privacy", label: "Open Privacy Policy" }],
        serviceIds: [],
      }),
    );
    expect(reply.intent).toBe("privacy");
    expect(reply.actions[0]?.type).toBe("privacy");
    expect(reply.actions[0]?.label).toBe("Open Privacy Policy");
  });

  it("parses off_topic intent correctly", () => {
    const reply = parseAssistantReply(
      JSON.stringify({
        reply: "I am exclusively here to help with Pocket Reels 360.",
        language: "en",
        intent: "off_topic",
        suggestions: ["What kind of reels do you make?"],
        actions: [{ type: "services", label: "Explore Services" }],
        serviceIds: [],
      }),
    );
    expect(reply.intent).toBe("off_topic");
    expect(reply.actions[0]?.type).toBe("services");
  });
});

