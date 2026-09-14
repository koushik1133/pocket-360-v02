/**
 * Minimal, typed wrappers around the browser Web Speech APIs. Both features are
 * progressive enhancements: everything here degrades to no-ops when the browser
 * lacks support, so the chat still works without voice.
 */

type SpeechRecognitionResultLike = {
  0: { transcript: string };
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

export function speechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as SpeechWindow;
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function speechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Starts a one-shot dictation session. Returns a stop() function, or null when
 * recognition is unsupported. Interim transcripts stream through onInterim; the
 * final transcript is passed to onFinal.
 */
export function startDictation(options: {
  lang?: string;
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onEnd?: () => void;
  onError?: () => void;
}): (() => void) | null {
  if (typeof window === "undefined") return null;
  const w = window as SpeechWindow;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = options.lang ?? navigator.language ?? "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interim = "";
    let final = "";
    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (!result) continue;
      const transcript = result[0].transcript;
      if (result.isFinal) final += transcript;
      else interim += transcript;
    }
    if (interim && options.onInterim) options.onInterim(interim);
    if (final) options.onFinal(final.trim());
  };
  recognition.onerror = () => options.onError?.();
  recognition.onend = () => options.onEnd?.();

  try {
    recognition.start();
  } catch {
    return null;
  }

  return () => {
    try {
      recognition.stop();
    } catch {
      /* already stopped */
    }
  };
}

/** Speaks text aloud, cancelling any in-flight utterance first. */
export function speak(text: string, lang = "en-US"): void {
  if (!speechSynthesisSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

/** Stops any current speech synthesis. */
export function stopSpeaking(): void {
  if (!speechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
}
