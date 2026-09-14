import { describe, expect, it } from "vitest";
import {
  appointmentSchema,
  isBookableDate,
  serviceLabel,
} from "./appointment-schema";

function futureDate(days = 7) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const validAppointment = {
  service: "reel-production",
  date: futureDate(),
  time: "14:30",
  name: "  Koushik   Goud  ",
  phone: "+1 (469) 555-0100",
  email: "HELLO@example.com ",
  projectDetails: "  A live event reel.  ",
  website: "",
  idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
} as const;

describe("appointmentSchema", () => {
  it("normalizes a valid appointment", () => {
    const result = appointmentSchema.parse(validAppointment);

    expect(result.name).toBe("Koushik Goud");
    expect(result.email).toBe("hello@example.com");
    expect(result.projectDetails).toBe("A live event reel.");
    expect(serviceLabel(result.service)).toBe("Reel production");
  });

  it("rejects malformed contact and time values", () => {
    const result = appointmentSchema.safeParse({
      ...validAppointment,
      phone: "123",
      email: "not-an-email",
      time: "29:99",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.phone).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.time).toBeDefined();
    }
  });

  it("rejects impossible calendar dates", () => {
    const result = appointmentSchema.safeParse({
      ...validAppointment,
      date: "2026-02-31",
    });

    expect(result.success).toBe(false);
  });
});

describe("isBookableDate", () => {
  it("accepts a future date inside twelve months", () => {
    expect(isBookableDate("2027-01-15", new Date("2026-09-14T12:00:00Z"))).toBe(
      true,
    );
  });

  it("rejects dates outside the one-year window", () => {
    expect(isBookableDate("2028-01-15", new Date("2026-09-14T12:00:00Z"))).toBe(
      false,
    );
  });
});
