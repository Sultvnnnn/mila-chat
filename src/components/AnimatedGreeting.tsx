"use client";

import { useState, useEffect } from "react";
import { GREETING_PHRASES } from "@/lib/constants";

export function AnimatedGreeting() {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentPhrase = GREETING_PHRASES[phraseIndex];

    if (!isDeleting && text === currentPhrase) {
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % GREETING_PHRASES.length);
    } else {
      const speed = isDeleting ? 40 : 65;
      timer = setTimeout(() => {
        setText(
          currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)),
        );
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIndex]);

  return (
    <h1 className="text-base sm:text-lg md:text-xl font-medium flex items-center justify-center min-h-[28px] sm:min-h-[32px] md:min-h-[36px] px-3 sm:px-4 text-center leading-snug">
      {text}
      <span className="animate-pulse w-[2px] h-[1em] bg-foreground ml-1 rounded-full shrink-0"></span>
    </h1>
  );
}
