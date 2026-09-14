export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi Pocket Reels 360, I'd like to discuss a project and book an appointment.";

export function normalizePhone(value: string | undefined) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function whatsappUrl(
  number: string | undefined,
  message = DEFAULT_WHATSAPP_MESSAGE,
) {
  const digits = normalizePhone(number);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function emailUrl(email: string | undefined, subject: string) {
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
