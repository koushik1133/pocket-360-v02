"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  CloseIcon,
  InstagramIcon,
  MailIcon,
  MicIcon,
  PhoneIcon,
  SoundOffIcon,
  SoundOnIcon,
  SparklesIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { brand } from "@/content/site";
import {
  assistantPersona,
  findService,
} from "@/content/assistant-knowledge";
import {
  type AssistantAction,
  type AssistantResponse,
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_LENGTH,
} from "@/lib/assistant/schema";
import { emailUrl, whatsappUrl } from "@/lib/contact-links";
import {
  speak,
  speechRecognitionSupported,
  speechSynthesisSupported,
  startDictation,
  stopSpeaking,
} from "@/lib/assistant/speech";

type AssistantWidgetProps = {
  whatsappNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
};

type DisplayMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  actions?: AssistantAction[];
  serviceIds?: string[];
};

type ResolvedAction = {
  key: string;
  label: string;
  href: string;
  external: boolean;
  Icon: typeof CalendarIcon;
};

const DEFAULT_SUGGESTIONS = [
  "What kind of reels do you make?",
  "How much does a reel cost?",
  "I want to book a shoot",
];

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AssistantWidget({
  whatsappNumber,
  contactEmail,
  contactPhone,
}: AssistantWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>(() => [
    {
      id: createId(),
      role: "assistant",
      content: assistantPersona.greeting,
      suggestions: DEFAULT_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOut, setVoiceOut] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState({
    input: false,
    output: false,
  });

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stopDictationRef = useRef<(() => void) | null>(null);
  const titleId = useId();

  // Detect browser voice capability after mount. Doing this in an effect (rather
  // than a lazy initializer) keeps the first client render identical to the
  // server HTML, avoiding a hydration mismatch on the voice controls.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client capability probe, runs once
    setVoiceSupported({
      input: speechRecognitionSupported(),
      output: speechSynthesisSupported(),
    });
  }, []);

  // Keep the transcript scrolled to the newest message.
  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const closePanel = useCallback(() => {
    setOpen(false);
    stopDictationRef.current?.();
    stopDictationRef.current = null;
    setListening(false);
    stopSpeaking();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closePanel]);

  const resolveActions = useCallback(
    (actions: AssistantAction[] | undefined): ResolvedAction[] => {
      if (!actions?.length) return [];
      const resolved: ResolvedAction[] = [];
      for (const action of actions) {
        switch (action.type) {
          case "book":
            resolved.push({
              key: `book-${resolved.length}`,
              label: action.label || "Book a call",
              href: "/book",
              external: false,
              Icon: CalendarIcon,
            });
            break;
          case "whatsapp": {
            const href = whatsappUrl(whatsappNumber);
            if (href)
              resolved.push({
                key: `wa-${resolved.length}`,
                label: action.label || "Chat on WhatsApp",
                href,
                external: true,
                Icon: WhatsAppIcon,
              });
            break;
          }
          case "email": {
            const href = emailUrl(
              contactEmail,
              `${brand.name} — project inquiry`,
            );
            if (href)
              resolved.push({
                key: `mail-${resolved.length}`,
                label: action.label || "Email the crew",
                href,
                external: false,
                Icon: MailIcon,
              });
            break;
          }
          case "call": {
            const digits = contactPhone?.replace(/[^\d+]/g, "");
            if (digits)
              resolved.push({
                key: `call-${resolved.length}`,
                label: action.label || "Call the crew",
                href: `tel:${digits}`,
                external: false,
                Icon: PhoneIcon,
              });
            break;
          }
          case "instagram":
            resolved.push({
              key: `ig-${resolved.length}`,
              label: action.label || "Message on Instagram",
              href: brand.instagramUrl,
              external: true,
              Icon: InstagramIcon,
            });
            break;
        }
      }
      return resolved;
    },
    [whatsappNumber, contactEmail, contactPhone],
  );

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_MESSAGE_LENGTH);
      if (!text || pending) return;

      stopSpeaking();
      const userMessage: DisplayMessage = {
        id: createId(),
        role: "user",
        content: text,
      };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput("");
      setPending(true);

      const history = nextMessages
        .map((message) => ({ role: message.role, content: message.content }))
        .slice(-MAX_HISTORY_MESSAGES);

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = (await response.json()) as AssistantResponse;

        setMessages((current) => [
          ...current,
          {
            id: createId(),
            role: "assistant",
            content: data.reply,
            suggestions: data.suggestions,
            actions: data.actions,
            serviceIds: data.serviceIds,
          },
        ]);

        if (voiceOut && data.reply) {
          const lang = data.language?.includes("-")
            ? data.language
            : `${data.language ?? "en"}-US`;
          speak(data.reply, lang);
        }
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: createId(),
            role: "assistant",
            content:
              "Sorry — I couldn't reach the crew just now. You can book a call or message us on Instagram and we'll follow up.",
            actions: [
              { type: "book", label: "Book a call" },
              { type: "instagram", label: "Message on Instagram" },
            ],
          },
        ]);
      } finally {
        setPending(false);
        inputRef.current?.focus();
      }
    },
    [messages, pending, voiceOut],
  );

  const toggleListening = useCallback(() => {
    if (listening) {
      stopDictationRef.current?.();
      stopDictationRef.current = null;
      setListening(false);
      return;
    }
    const stop = startDictation({
      onInterim: (text) => setInput(text),
      onFinal: (text) => setInput(text),
      onEnd: () => {
        stopDictationRef.current = null;
        setListening(false);
      },
      onError: () => {
        stopDictationRef.current = null;
        setListening(false);
      },
    });
    if (stop) {
      stopDictationRef.current = stop;
      setListening(true);
    }
  }, [listening]);

  const toggleVoiceOut = useCallback(() => {
    setVoiceOut((current) => {
      if (current) stopSpeaking();
      return !current;
    });
  }, []);

  useEffect(() => () => stopDictationRef.current?.(), []);

  const launcherLabel = open
    ? "Close the Pocket Reels assistant"
    : "Open the Pocket Reels assistant";

  return (
    <>
      <button
        type="button"
        className="assistant-launcher"
        aria-label={launcherLabel}
        aria-expanded={open}
        onClick={() => (open ? closePanel() : setOpen(true))}
      >
        {open ? <CloseIcon size={22} /> : <SparklesIcon size={22} />}
        {!open ? <span>Ask us</span> : null}
      </button>

      {open ? (
        <section
          className="assistant-panel"
          role="dialog"
          aria-labelledby={titleId}
        >
          <header className="assistant-panel__head">
            <div>
              <p className="assistant-panel__title" id={titleId}>
                {brand.name}
              </p>
              <p className="assistant-panel__subtitle">
                {assistantPersona.tagline}
              </p>
            </div>
            <div className="assistant-panel__head-actions">
              {voiceSupported.output ? (
                <button
                  type="button"
                  className="assistant-icon-button"
                  aria-pressed={voiceOut}
                  aria-label={
                    voiceOut ? "Turn off spoken replies" : "Turn on spoken replies"
                  }
                  onClick={toggleVoiceOut}
                >
                  {voiceOut ? (
                    <SoundOnIcon size={18} />
                  ) : (
                    <SoundOffIcon size={18} />
                  )}
                </button>
              ) : null}
              <button
                type="button"
                className="assistant-icon-button"
                aria-label="Close assistant"
                onClick={closePanel}
              >
                <CloseIcon size={18} />
              </button>
            </div>
          </header>

          <div
            className="assistant-panel__messages"
            ref={listRef}
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((message) => {
              const actions = resolveActions(message.actions);
              const services = (message.serviceIds ?? [])
                .map((id) => findService(id))
                .filter((service) => service !== undefined);
              return (
                <div key={message.id} className="assistant-turn">
                  <div className={`assistant-bubble assistant-bubble--${message.role}`}>
                    {message.content}
                  </div>

                  {services.length ? (
                    <div className="assistant-cards">
                      {services.map((service) => (
                        <div key={service.id} className="assistant-service-card">
                          <p className="assistant-service-card__name">
                            {service.name}
                          </p>
                          <p className="assistant-service-card__tagline">
                            {service.tagline}
                          </p>
                          <p className="assistant-service-card__price">
                            {service.pricingNote}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {actions.length ? (
                    <div className="assistant-actions">
                      {actions.map((action) =>
                        action.external ? (
                          <a
                            key={action.key}
                            className="assistant-action"
                            href={action.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <action.Icon size={16} />
                            <span>{action.label}</span>
                          </a>
                        ) : action.href.startsWith("/") ? (
                          <Link
                            key={action.key}
                            className="assistant-action"
                            href={action.href}
                            onClick={closePanel}
                          >
                            <action.Icon size={16} />
                            <span>{action.label}</span>
                          </Link>
                        ) : (
                          <a
                            key={action.key}
                            className="assistant-action"
                            href={action.href}
                          >
                            <action.Icon size={16} />
                            <span>{action.label}</span>
                          </a>
                        ),
                      )}
                    </div>
                  ) : null}

                  {message.suggestions?.length ? (
                    <div className="assistant-suggestions">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          type="button"
                          key={`${message.id}-s${index}`}
                          className="assistant-chip"
                          disabled={pending}
                          onClick={() => sendMessage(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {pending ? (
              <div className="assistant-turn">
                <div
                  className="assistant-bubble assistant-bubble--assistant assistant-bubble--typing"
                  aria-label="Assistant is typing"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="assistant-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            {voiceSupported.input ? (
              <button
                type="button"
                className={`assistant-icon-button assistant-mic${listening ? " is-listening" : ""}`}
                aria-pressed={listening}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                onClick={toggleListening}
              >
                <MicIcon size={18} />
              </button>
            ) : null}
            <textarea
              ref={inputRef}
              className="assistant-input"
              value={input}
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Ask about reels, pricing, or booking…"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
            />
            <button
              type="submit"
              className="assistant-send"
              disabled={pending || input.trim().length === 0}
              aria-label="Send message"
            >
              <SparklesIcon size={18} />
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
