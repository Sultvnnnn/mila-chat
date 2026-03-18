"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowUp,
  Sparkles,
  Compass,
  Calendar,
  CreditCard,
  MapPin,
  Dumbbell,
  RefreshCcw,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loading from "./loading";

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [showResetAlert, setShowResetAlert] = useState(false);

  //? hook useChat
  const { messages, setMessages, sendMessage, status } = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  //? check session ID dan load riwayat obrolan
  useEffect(() => {
    const initializeChat = async () => {
      let currentSessionId = localStorage.getItem("mila_session_id");

      if (currentSessionId) {
        setSessionId(currentSessionId);
        const { data, error } = await supabase
          .from("conversations")
          .select("messages")
          .eq("id", currentSessionId)
          .single();

        if (error) {
          console.error(
            `Database Error: Failed to retrieve conversation history for session ${currentSessionId}. Details: ${error.message}`,
          );
        }

        if (data && data.messages) {
          setMessages(data.messages);
        }
      } else {
        currentSessionId = crypto.randomUUID();
        localStorage.setItem("mila_session_id", currentSessionId);
        setSessionId(currentSessionId);
      }
    };

    initializeChat();
  }, [setMessages]);

  const isLoading = status === "submitted" || status === "streaming";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      inputRef.current?.focus();
    }
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  // reset chat
  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem("mila_session_id", newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
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

        [data-theme-transition="expand"]::view-transition-old(root) {
          z-index: 1;
        }
        [data-theme-transition="expand"]::view-transition-new(root) {
          z-index: 2;
        }

        [data-theme-transition="shrink"]::view-transition-old(root) {
          z-index: 2;
        }
        [data-theme-transition="shrink"]::view-transition-new(root) {
          z-index: 1;
        }
      `}</style>

      {/* CONTAINER UTAMA START */}
      <div className="flex h-[100dvh] flex-col bg-background text-foreground font-sans selection:bg-mula/50">
        {/* HEADER START */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between px-6 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <span className="text-base font-semibold tracking-[0.2em] text-foreground/80 animate-in fade-in">
                Mila
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowResetAlert(true)}
                className="text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                title="Mulai Obrolan Baru"
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>
            )}
            <ThemeToggle />
          </div>
        </header>
        {/* HEADER END */}

        {/* CHAT AREA START */}
        <div
          id="chat-scroll-container"
          className="flex-1 overflow-y-auto px-4 w-full max-w-2xl mx-auto hide-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 pb-32">
              <div className="text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-secondary border border-border mb-2">
                  <Sparkles className="h-5 w-5 text-mula-dark" />
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
                    onClick={() => sendMessage({ text: prompt })}
                    className="rounded-full border-border/60 bg-background/60 backdrop-blur-sm text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-900 hover:bg-mula-light hover:border-mula transition-all duration-200 gap-1.5 text-xs font-normal"
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
                {messages.map((m: UIMessage, index: number) => {
                  const isLatest = index === messages.length - 1;

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                        y: 10,
                        transition: { duration: 0.3 },
                      }}
                      className={`flex gap-3 ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`flex flex-col gap-1 max-w-[85%]`}>
                        <div
                          className={`text-sm leading-relaxed ${
                            m.role === "user"
                              ? "bg-mula text-zinc-900 px-4 py-2 rounded-2xl rounded-tr-sm shadow-sm"
                              : "text-foreground pl-0 py-0"
                          }`}
                        >
                          {(() => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const msgAny = m as any;

                            const textContent =
                              msgAny.content ||
                              (msgAny.parts
                                ? msgAny.parts
                                    .filter((p: any) => p.type === "text")
                                    .map((p: any) => p.text)
                                    .join("")
                                : "");

                            return m.role === "user" ? (
                              <div className="whitespace-pre-wrap font-sans">
                                {textContent}
                              </div>
                            ) : (
                              <div className="flex flex-col items-start gap-1">
                                <div className="font-sans text-sm">
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
                                    {textContent}
                                  </ReactMarkdown>
                                </div>

                                {isLatest && m.role === "assistant" && (
                                  <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                                    <Sparkles className="h-4 w-4 text-mula-dark animate-pulse" />
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 animate-pulse ml-8">
                  <div className="h-1.5 w-1.5 bg-mula-dark rounded-full animate-bounce"></div>
                  <div className="h-1.5 w-1.5 bg-mula-dark rounded-full animate-bounce delay-75"></div>
                  <div className="h-1.5 w-1.5 bg-mula-dark rounded-full animate-bounce delay-150"></div>
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
            <form onSubmit={onSubmit} className="w-full">
              <InputGroup className="bg-background border border-border dark:border-border/80 shadow-md dark:shadow-none dark:ring-1 dark:ring-border rounded-xl focus-within:ring-1 focus-within:ring-mula-dark/50 transition-all">
                <TextareaAutosize
                  ref={inputRef}
                  data-slot="input-group-control"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  minRows={1}
                  maxRows={8}
                  className="flex field-sizing-content min-h-12 w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm transition-[color,box-shadow] outline-none placeholder:text-muted-foreground font-sans"
                  placeholder="Halo Mila ..."
                />
                <InputGroupAddon align="block-end" className="p-2">
                  <InputGroupButton
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="ml-auto rounded-full h-8 w-8 transition-all bg-mula text-zinc-900 hover:bg-mula-dark"
                    size="icon-sm"
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

      {/* ALERT DIALOG RESET CHAT */}
      <AlertDialog open={showResetAlert} onOpenChange={setShowResetAlert}>
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[99999]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100">
              Mulai sesi obrolan baru?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
              Obrolan akan di-reset sehingga Anda bisa memulai topik atau
              pertanyaan baru dengan MILA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border-none transition-colors">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleNewChat();
                setShowResetAlert(false);
              }}
              className="bg-mula hover:bg-mula-dark text-zinc-900 transition-colors"
            >
              Ya, Mulai Baru
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
