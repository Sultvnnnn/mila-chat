"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  User,
  Moon,
  Sun,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

// komponen Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Halo Ka! 👋 Aku **MILA**. Ada yang bisa aku bantu seputar jadwal yoga, harga, atau lokasi studio hari ini?",
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
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
    <div className="flex h-[100dvh] flex-col bg-slate-50 dark:bg-slate-950">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-purple-100 dark:border-purple-900">
            <AvatarImage src="/bot-avatar.png" alt="Mila" />
            <AvatarFallback className="bg-purple-600 text-white">
              <Sparkles size={16} />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-foreground">MILA</h1>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              Online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical size={20} />
          </Button>
        </div>
      </header>

      {/* --- CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-20">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={
                      m.role === "assistant"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800"
                    }
                  >
                    {m.role === "assistant" ? (
                      <Sparkles size={14} />
                    ) : (
                      <User size={14} />
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Bubble Chat */}
                <div
                  className={`flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]`}
                >
                  <Card
                    className={`border-none px-4 py-3 text-sm shadow-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-background border border-border/50 rounded-tl-none dark:bg-slate-900"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-50 max-w-none break-words">
                      <ReactMarkdown
                        components={{
                          ul: ({ ...props }) => (
                            <ul
                              className="list-disc pl-4 space-y-1 mb-2"
                              {...props}
                            />
                          ),
                          ol: ({ ...props }) => (
                            <ol
                              className="list-decimal pl-4 space-y-1 mb-2"
                              {...props}
                            />
                          ),
                          p: ({ ...props }) => (
                            <p className="mb-2 last:mb-0" {...props} />
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </Card>
                  <span
                    suppressHydrationWarning
                    className={`text-[10px] text-muted-foreground ${m.role === "user" ? "text-right" : "text-left"}`}
                  >
                    {m.createdAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white">
                  <Sparkles size={14} />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Skeleton className="h-10 w-[200px] rounded-xl rounded-tl-none" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="sticky bottom-0 bg-background/80 p-4 backdrop-blur-lg border-t dark:border-slate-800">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya jadwal, harga, atau lokasi..."
              disabled={isLoading}
              className="rounded-full bg-slate-100 border-transparent focus-visible:ring-purple-500 px-5 dark:bg-slate-900 dark:border-slate-800"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="rounded-full shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Mila Yoga Assistant © 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
