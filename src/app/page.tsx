"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Compass,
  Calendar,
  CreditCard,
  MapPin,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, hasStarted]);

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
        content: data.reply,
        createdAt: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
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

  return (
    <>
      {/* CSS KHUSUS BUAT HIDE SCROLLBAR */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* CONTAINER UTAMA - SERIF FONT */}
      <div className="flex h-[100dvh] flex-col bg-black text-zinc-100 font-serif selection:bg-indigo-500/30">
        {/* HEADER */}
        {/* <header className="sticky top-0 z-10 flex h-14 items-center justify-between px-6 bg-black/90 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2">
            {hasStarted && (
              <span className="text-lg font-medium tracking-wide bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent animate-in fade-in">
                MILA
              </span>
            )}
          </div>
          <Avatar className="h-7 w-7 ring-1 ring-white/20">
            <AvatarImage src="/bot-avatar.png" />
            <AvatarFallback className="bg-zinc-900 text-[10px] text-white">
              SA
            </AvatarFallback>
          </Avatar>
        </header> */}

        {/* CHAT AREA (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 w-full max-w-2xl mx-auto hide-scrollbar">
          {!hasStarted ? (
            <div className="flex h-full flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 pb-32">
              <div className="text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-zinc-900 border border-zinc-800 mb-2">
                  <Sparkles className="h-5 w-5 text-indigo-300" />
                </div>
                <h1 className="text-xl italic">
                  Apa yang bisa Mila bantu hari ini?
                </h1>
              </div>

              <div className="flex flex-wrap justify-center gap-2 w-full max-w-md">
                <SuggestionButton
                  icon={<Calendar className="h-3 w-3 text-blue-400" />}
                  text="Jadwal Yoga"
                  onClick={() =>
                    handleSend("Jadwal kelas yoga hari ini apa aja?")
                  }
                />
                <SuggestionButton
                  icon={<CreditCard className="h-3 w-3 text-green-400" />}
                  text="Cek Harga"
                  onClick={() => handleSend("Berapa harga paket member?")}
                />
                <SuggestionButton
                  icon={<MapPin className="h-3 w-3 text-red-400" />}
                  text="Lokasi"
                  onClick={() => handleSend("Lokasi studio di mana?")}
                />
                <SuggestionButton
                  icon={<Compass className="h-3 w-3 text-purple-400" />}
                  text="Pemula"
                  onClick={() => handleSend("Ada kelas untuk pemula?")}
                />
              </div>
            </div>
          ) : (
            /* LIST CHAT DENGAN PADDING BOTTOM LEBIH BESAR (pb-40) */
            <div className="flex flex-col gap-6 py-6 pb-40">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="h-6 w-6 shrink-0 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center mt-1">
                        <Sparkles size={12} className="text-indigo-300" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 max-w-[85%]`}>
                      <div
                        className={`text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-zinc-800 text-white px-4 py-2 rounded-2xl rounded-tr-sm"
                            : "text-zinc-200 pl-0 py-0"
                        }`}
                      >
                        {m.role === "assistant" && m.isStreaming ? (
                          <TypewriterEffect content={m.content} />
                        ) : (
                          <div className="prose prose-sm prose-invert prose-p:mb-2 last:prose-p:mb-0 max-w-none font-serif">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div className="flex gap-3 animate-pulse ml-8">
                  <div className="h-1.5 w-1.5 bg-zinc-600 rounded-full animate-bounce"></div>
                  <div className="h-1.5 w-1.5 bg-zinc-600 rounded-full animate-bounce delay-75"></div>
                  <div className="h-1.5 w-1.5 bg-zinc-600 rounded-full animate-bounce delay-150"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* FLOATING INPUT */}
        <div className="fixed bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="relative flex items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-full border border-zinc-800 shadow-xl transition-all focus-within:border-zinc-600"
            >
              <div className="pl-3 text-zinc-500">
                <Sparkles size={16} />
              </div>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya Mila..."
                className="flex-1 border-none bg-transparent shadow-none text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 h-10 font-serif"
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="rounded-full h-9 w-9 bg-zinc-100 text-black hover:bg-zinc-300 transition-all disabled:opacity-30 disabled:bg-zinc-700"
              >
                <Send size={14} />
              </Button>
            </form>
            <p className="mt-3 text-center text-[10px] italic text-zinc-500 font-sans tracking-wide">
              Mila mungkin salah. Periksa kembali responnya.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// --- SUB KOMPONEN ---

function SuggestionButton({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-[#1a1a1a] border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition-all hover:bg-[#252525] hover:border-zinc-600 hover:text-zinc-200 active:scale-95"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

function TypewriterEffect({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent((prev) => prev + content.charAt(index));
        setIndex((prev) => prev + 1);
      }, 5);
      return () => clearTimeout(timeout);
    }
  }, [content, index]);

  return (
    <div className="prose prose-sm prose-invert prose-p:mb-2 last:prose-p:mb-0 max-w-none font-serif animate-in fade-in">
      <ReactMarkdown
        components={{
          ul: ({ ...props }) => (
            <ul className="list-disc pl-4 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-4 space-y-1" {...props} />
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
    </div>
  );
}
