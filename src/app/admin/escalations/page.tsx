"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Search,
  Clock,
  CheckCheck,
  User,
  Headphones,
  Bot,
  CheckCircle2,
  ArrowUp,
  X,
  MessageSquareWarning,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextareaAutosize from "react-textarea-autosize";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import ReactMarkdown from "react-markdown";

export default function EscalationsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchEscalations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("escalations")
      .select(`*, conversations ( messages )`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data eskalasi:", error.message);
    } else {
      setEscalations(data || []);
      if (selectedTicket) {
        const updatedTicket = data?.find((t) => t.id === selectedTicket.id);
        if (updatedTicket) setSelectedTicket(updatedTicket);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  // Realtime listener: auto-update ketika ada eskalasi baru atau status berubah
  useEffect(() => {
    const escChannel = supabase
      .channel("realtime-admin-escalations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "escalations" },
        () => {
          fetchEscalations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(escChannel);
    };
  }, []);

  // Realtime listener: auto-update chat history ketika user kirim pesan baru
  useEffect(() => {
    if (!selectedTicket) return;

    const convChannel = supabase
      .channel(`realtime-admin-conv-${selectedTicket.conversation_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${selectedTicket.conversation_id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated?.messages) {
            setSelectedTicket((prev: any) => ({
              ...prev,
              conversations: { messages: updated.messages },
            }));
            setTimeout(
              () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
              100,
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convChannel);
    };
  }, [selectedTicket?.conversation_id]);

  const handleOpenTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsSheetOpen(true);
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }, 100);
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: "pending" | "resolved",
  ) => {
    const { error } = await supabase
      .from("escalations")
      .update({
        status: newStatus,
        resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) {
      console.error("Gagal memperbarui status tiket.");
    } else {
      fetchEscalations();
      if (newStatus === "resolved") {
        setIsSheetOpen(false);
        setSelectedTicket(null);
      }
    }
  };

  const handleSendReply = async () => {
    if (!adminReply.trim() || !selectedTicket) return;

    const textToSend = adminReply;
    setAdminReply("");
    setIsSending(true);

    // Optimistic update: tampilkan pesan langsung di UI sebelum response dari server
    const newMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: textToSend,
      isAdmin: true,
      timestamp: new Date().toISOString(),
      isSendingTemp: true,
    };

    const currentMessages = selectedTicket.conversations?.messages || [];
    setSelectedTicket((prev: any) => ({
      ...prev,
      conversations: { messages: [...currentMessages, newMessage] },
    }));

    setTimeout(
      () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );

    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedTicket.conversation_id,
          messageContent: textToSend,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        console.error("Gagal mengirim balasan:", data.error);
      }
      // Chat history di sisi user update otomatis via Realtime listener
    } catch (error) {
      console.error("Error sending reply:", error);
    }

    setIsSending(false);
  };

  const extractText = (msg: any) => {
    if (msg.content) return msg.content;
    if (msg.parts) {
      return msg.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");
    }
    return "";
  };

  const pendingTickets = escalations.filter((t) => t.status === "pending");
  const resolvedTickets = escalations.filter((t) => t.status === "resolved");

  const filteredPending = pendingTickets.filter((t) =>
    t.reason?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredResolved = resolvedTickets.filter((t) =>
    t.reason?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-mula-light dark:bg-mula-dark/20 text-mula-dark dark:text-mula rounded-xl shrink-0">
          <MessageSquareWarning className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
            Escalations
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Ambil alih percakapan dari MILA dan kendala pengguna secara
            langsung.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 my-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari alasan eskalasi..."
            className="pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TAB */}
      <div className="relative flex p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-lg w-full lg:w-[400px] shrink-0 mb-6">
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md bg-mula dark:bg-mula/90 shadow-md transition-transform duration-500 ease-out ${
            activeTab === "pending" ? "translate-x-0" : "translate-x-full"
          }`}
        />
        <button
          onClick={() => setActiveTab("pending")}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
            activeTab === "pending"
              ? "text-zinc-900"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Menunggu Balasan
          {pendingTickets.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 bg-white/60 text-zinc-900 dark:bg-black/20 dark:text-zinc-100 shadow-sm border-none"
            >
              {pendingTickets.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
            activeTab === "resolved"
              ? "text-zinc-900"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Selesai
        </button>
      </div>

      {/* KONTEN TAB */}
      {activeTab === "pending" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPending.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => handleOpenTicket(ticket)}
              className="group flex flex-col justify-between p-5 border border-border bg-card rounded-xl shadow-sm hover:shadow-md hover:border-mula transition-all cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                  >
                    Pending
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {format(new Date(ticket.created_at), "dd MMM, HH:mm", {
                      locale: localeId,
                    })}
                  </span>
                </div>
                <h3 className="font-semibold text-card-foreground line-clamp-2 leading-snug">
                  "{ticket.reason}"
                </h3>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded-md">
                  ID: {ticket.conversation_id.split("-")[0]}...
                </span>
                <span className="text-sm font-medium text-blue-600 group-hover:underline">
                  Balas →
                </span>
              </div>
            </div>
          ))}
          {!loading && filteredPending.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              Tidak ada tiket yang menunggu balasan.
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResolved.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => handleOpenTicket(ticket)}
              className="group flex flex-col justify-between p-5 border border-border bg-card/50 rounded-xl hover:bg-card transition-all cursor-pointer opacity-80 hover:opacity-100"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                  >
                    Resolved
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {format(new Date(ticket.created_at), "dd MMM, HH:mm", {
                      locale: localeId,
                    })}
                  </span>
                </div>
                <h3 className="font-semibold text-card-foreground line-clamp-2 leading-snug">
                  "{ticket.reason}"
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHEET DETAIL CHAT */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 flex flex-col border-l-0 sm:border-l shadow-2xl">
          <SheetHeader className="p-4 border-b bg-secondary/50 backdrop-blur-sm z-10 flex flex-row items-center justify-between text-left">
            <div>
              <SheetTitle className="flex items-center gap-2 text-lg">
                <Headphones className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                Sesi Live Chat
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                ID: {selectedTicket?.conversation_id}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedTicket?.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleStatusUpdate(selectedTicket.id, "resolved")
                  }
                  className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Tandai Selesai</span>
                  <span className="sm:hidden">Selesai</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSheetOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground bg-zinc-200/50 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-full"
                title="Tutup Panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4 md:p-6 bg-zinc-50 dark:bg-zinc-950/50">
            <div className="flex flex-col gap-4 pb-4">
              {selectedTicket?.conversations?.messages?.map(
                (msg: any, i: number) => {
                  const textContent = extractText(msg);
                  if (!textContent.trim()) return null;

                  const isUser = msg.role === "user";
                  const isSystemMila = msg.role === "assistant" && !msg.isAdmin;
                  const isAdmin = msg.isAdmin;

                  return (
                    <div
                      key={msg.id || i}
                      className={`flex flex-col max-w-[85%] ${
                        isAdmin
                          ? "self-end items-end"
                          : "self-start items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {isUser && <User className="h-3 w-3 text-zinc-500" />}
                        {isSystemMila && (
                          <Bot className="h-3 w-3 text-zinc-500" />
                        )}
                        {isAdmin && (
                          <Headphones className="h-3 w-3 text-zinc-700 dark:text-zinc-400" />
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {isUser
                            ? "Pengguna"
                            : isSystemMila
                              ? "Sistem MILA"
                              : "Admin (Anda)"}
                        </span>
                      </div>

                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[15px] shadow-sm relative ${
                          isUser
                            ? "bg-white dark:bg-zinc-900 border border-border text-foreground rounded-tl-sm"
                            : isSystemMila
                              ? "bg-zinc-800 text-zinc-100 dark:bg-zinc-800 rounded-tl-sm"
                              : "bg-mula text-zinc-900 rounded-tr-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-sans leading-relaxed">
                          <ReactMarkdown
                            components={{
                              ul: ({ ...props }) => (
                                <ul
                                  className="list-disc pl-5 my-1"
                                  {...props}
                                />
                              ),
                              ol: ({ ...props }) => (
                                <ol
                                  className="list-decimal pl-5 my-1"
                                  {...props}
                                />
                              ),
                              p: ({ ...props }) => (
                                <p className="mb-1 last:mb-0" {...props} />
                              ),
                            }}
                          >
                            {textContent}
                          </ReactMarkdown>
                        </div>

                        {isAdmin && (
                          <div className="flex justify-end items-center gap-1 mt-1.5 -mb-0.5">
                            <span className="text-[9px] text-zinc-700/80">
                              {format(
                                new Date(msg.timestamp || new Date()),
                                "HH:mm",
                              )}
                            </span>
                            {msg.isSendingTemp ? (
                              <Clock className="h-3 w-3 text-zinc-700/80" />
                            ) : (
                              <CheckCheck className="h-3.5 w-3.5 text-zinc-700 drop-shadow-sm" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {selectedTicket?.status === "pending" ? (
            <div className="p-4 md:p-6 bg-background border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply();
                }}
                className="w-full"
              >
                <InputGroup className="bg-background border border-border dark:border-border/80 shadow-sm dark:shadow-none dark:ring-1 dark:ring-border rounded-xl focus-within:ring-1 focus-within:ring-mula-dark/50 transition-all">
                  <TextareaAutosize
                    ref={inputRef}
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    disabled={isSending}
                    minRows={1}
                    maxRows={6}
                    className="flex field-sizing-content min-h-12 w-full resize-none rounded-md bg-transparent px-4 py-3 text-[15px] transition-[color,box-shadow] outline-none placeholder:text-muted-foreground font-sans"
                    placeholder="Ketik balasan untuk pengguna..."
                  />
                  <InputGroupAddon align="block-end" className="p-2">
                    <InputGroupButton
                      type="submit"
                      disabled={!adminReply.trim() || isSending}
                      className="ml-auto rounded-full h-9 w-9 transition-all bg-mula text-zinc-900 hover:bg-mula-dark"
                      size="icon-sm"
                    >
                      <ArrowUp
                        size={18}
                        className={isSending ? "opacity-50" : ""}
                      />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            </div>
          ) : (
            <div className="p-4 md:p-6 bg-muted/50 border-t text-center">
              <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Sesi ini telah diselesaikan.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
