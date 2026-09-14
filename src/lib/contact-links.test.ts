import { describe, expect, it } from "vitest";
import {
  emailUrl,
  normalizePhone,
  whatsappUrl,
} from "./contact-links";

describe("contact links", () => {
  it("does not create a WhatsApp URL without a real number", () => {
    expect(whatsappUrl(undefined)).toBeNull();
    expect(whatsappUrl("123")).toBeNull();
  });

  it("normalizes a configured WhatsApp number", () => {
    expect(normalizePhone("+1 (469) 555-0100")).toBe("14695550100");
    expect(whatsappUrl("+1 (469) 555-0100", "Hello")).toBe(
      "https://wa.me/14695550100?text=Hello",
    );
  });

  it("does not invent an email link", () => {
    expect(emailUrl(undefined, "Hello")).toBeNull();
    expect(emailUrl("hello@example.com", "Project inquiry")).toBe(
      "mailto:hello@example.com?subject=Project%20inquiry",
    );
  });
});
