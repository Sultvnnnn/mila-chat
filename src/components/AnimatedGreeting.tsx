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
    <h1 className="text-sm font-medium whitespace-nowrap px-4">
      {text}
      <span className="inline-block animate-pulse w-[1.5px] h-[0.85em] bg-foreground/70 ml-[2px] rounded-full align-middle" />
    </h1>
  );
}
