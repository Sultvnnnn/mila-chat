"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Sparkles,
  Compass,
  Calendar,
  CreditCard,
  MapPin,
  Dumbbell,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { AnimatedGreeting } from "@/components/AnimatedGreeting";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import Loading from "./loading";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  isStreaming?: boolean;
};

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, hasStarted]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      inputRef.current?.focus();
    }
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!hasStarted) setHasStarted(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.reply ||
          data.error ||
          "Maaf Ka, Mila sedang ada gangguan koneksi. 🙏",
        createdAt: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Maaf Ka, koneksi Mila agak gangguan. Coba tanya lagi ya? 🙏",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
      `}</style>

      {/* CONTAINER UTAMA START */}
      <div className="flex h-[100dvh] flex-col bg-background text-foreground font-serif selection:bg-primary/30">
        {/* HEADER START */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between px-6 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-2">
            {hasStarted && (
              <span className="text-base font-semibold tracking-[0.2em] text-foreground/80 animate-in fade-in">
                Mila
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>
        {/* HEADER END */}

        {/* CHAT AREA START */}
        <div
          id="chat-scroll-container"
          className="flex-1 overflow-y-auto px-4 w-full max-w-2xl mx-auto hide-scrollbar"
        >
          {!hasStarted ? (
            <div className="flex h-full flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 pb-32">
              <div className="text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-secondary border border-border mb-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                </div>
                <AnimatedGreeting />
              </div>

              {/* SUGGEST BUTTON START */}
              <div className="flex flex-wrap justify-center gap-2 w-full max-w-[320px] sm:max-w-sm mx-auto px-2">
                {[
                  {
                    icon: <Calendar className="h-3.5 w-3.5" />,
                    text: "Jadwal Yoga",
                    prompt: "Jadwal kelas yoga hari ini apa aja?",
                  },
                  {
                    icon: <CreditCard className="h-3.5 w-3.5" />,
                    text: "Cek Harga",
                    prompt: "Berapa harga paket member?",
                  },
                  {
                    icon: <MapPin className="h-3.5 w-3.5" />,
                    text: "Lokasi",
                    prompt: "Lokasi studio di mana?",
                  },
                  {
                    icon: <Compass className="h-3.5 w-3.5" />,
                    text: "Pemula",
                    prompt: "Ada kelas untuk pemula?",
                  },
                  {
                    icon: <Dumbbell className="h-3.5 w-3.5" />,
                    text: "Jenis Kelas",
                    prompt: "Kelas apa saja yang tersedia di MULA Yoga?",
                  },
                ].map(({ icon, text, prompt }) => (
                  <Button
                    key={text}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(prompt)}
                    className="rounded-full border-border/60 bg-background/60 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border transition-all duration-200 gap-1.5 text-xs font-normal"
                  >
                    {icon}
                    {text}
                  </Button>
                ))}
              </div>
              {/* SUGGEST BUTTON END */}
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-6 pb-40">
              <AnimatePresence initial={false}>
                {messages.map((m, index) => {
                  const isLatest = index === messages.length - 1;

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex flex-col gap-1 max-w-[85%]`}>
                        <div
                          className={`text-sm leading-relaxed ${
                            m.role === "user"
                              ? "bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm"
                              : "text-foreground pl-0 py-0"
                          }`}
                        >
                          {m.role === "user" ? (
                            /* USER */
                            <div className="whitespace-pre-wrap font-sans">
                              {m.content}
                            </div>
                          ) : (
                            /* AI */
                            <div className="flex flex-col items-start gap-1">
                              {m.isStreaming ? (
                                <TypewriterEffect content={m.content} />
                              ) : (
                                <div className="font-serif text-sm">
                                  <ReactMarkdown
                                    components={{
                                      ul: ({ ...props }) => (
                                        <ul
                                          className="list-disc pl-5 my-2 space-y-1"
                                          {...props}
                                        />
                                      ),
                                      ol: ({ ...props }) => (
                                        <ol
                                          className="list-decimal pl-5 my-2 space-y-1"
                                          {...props}
                                        />
                                      ),
                                      li: ({ ...props }) => (
                                        <li
                                          className="leading-relaxed"
                                          {...props}
                                        />
                                      ),
                                      p: ({ ...props }) => (
                                        <p
                                          className="mb-2 last:mb-0"
                                          {...props}
                                        />
                                      ),
                                    }}
                                  >
                                    {m.content}
                                  </ReactMarkdown>
                                </div>
                              )}

                              {isLatest && m.role === "assistant" && (
                                <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                                  <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isLoading && (
                <div className="flex gap-3 animate-pulse ml-8">
                  <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce delay-75"></div>
                  <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        {/* CHAT AREA END */}

        {/* INPUT GROUP TEXTAREA START */}
        <div className="fixed bottom-0 left-0 right-0 bg-background px-4 pb-4 pt-2 border-t border-border/40">
          <div className="absolute h-4 w-full left-0 -top-4 bg-gradient-to-t from-background to-transparent pointer-events-none" />

          <div className="max-w-2xl mx-auto relative z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="w-full"
            >
              <InputGroup className="bg-background border border-border dark:border-border/80 shadow-md dark:shadow-none dark:ring-1 dark:ring-border rounded-xl focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <TextareaAutosize
                  ref={inputRef}
                  data-slot="input-group-control"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  minRows={1}
                  maxRows={8}
                  className="flex field-sizing-content min-h-12 w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm transition-[color,box-shadow] outline-none placeholder:text-muted-foreground font-serif"
                  placeholder="Halo Mila ..."
                />
                <InputGroupAddon align="block-end" className="p-2">
                  <InputGroupButton
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="ml-auto rounded-full h-8 w-8 transition-all"
                    size="icon-sm"
                    variant="default"
                  >
                    <ArrowUp
                      size={16}
                      className={isLoading ? "opacity-50" : ""}
                    />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>

            <p className="mt-2 text-center text-[10px] text-muted-foreground font-sans tracking-wide w-full">
              Mila adalah AI dan bisa keliru. Harap periksa kembali respons.
            </p>
          </div>
        </div>
        {/* INPUT GROUP TEXTAREA END */}
      </div>
      {/* CONTAINER UTAMA END */}
    </>
  );
}

//? SUB KOMPONEN
function TypewriterEffect({ content = "" }: { content?: string }) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!content) return;
    if (index < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent((prev) => prev + content.charAt(index));
        setIndex((prev) => prev + 1);

        const container = document.getElementById("chat-scroll-container");
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 5);
      return () => clearTimeout(timeout);
    }
  }, [content, index]);

  return (
    <div className="font-serif text-sm animate-in fade-in">
      <ReactMarkdown
        components={{
          ul: ({ ...props }) => (
            <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />
          ),
          li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
          p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        }}
      >
        {displayedContent}
      </ReactMarkdown>
    </div>
  );
}
