"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { sendAdminReply } from "./actions";

export default function EscalationsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [adminReply, setAdminReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchEscalations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("escalations")
      .select(
        `
        *,
        conversations (
          messages
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data eskalasi:", error.message);
    } else {
      setEscalations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const filteredEscalations = escalations.filter((item) => {
    const matchesTab = item.status === activeTab;
    const matchesSearch = item.reason
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
      alert("Gagal memperbarui status tiket.");
    } else {
      fetchEscalations();
      if (selectedTicket?.id === id) {
        setSelectedTicket(null);
      }
    }
  };

  const handleSendReply = async () => {
    if (!adminReply.trim() || !selectedTicket) return;

    setIsSending(true);
    const res = await sendAdminReply(
      selectedTicket.conversation_id,
      adminReply,
    );

    if (res.success) {
      alert("Balasan berhasil dikirim kepada pengguna.");
      setAdminReply("");
      // Refresh data eskalasi buat update history chat di UI admin
      fetchEscalations();
    } else {
      alert("Gagal mengirim balasan. Silakan coba lagi.");
    }
    setIsSending(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Pusat Eskalasi
          </h1>
          <p className="text-muted-foreground">
            Kelola dan tanggapi permintaan bantuan dari pengguna secara
            langsung.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEscalations}
          disabled={loading}
          className="w-fit"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Segarkan Data
        </Button>
      </div>

      {/* Tab Switcher & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-full sm:max-w-[420px]">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white dark:bg-zinc-800 shadow-sm transition-all duration-300 ${
              activeTab === "pending" ? "left-1" : "left-[calc(50%+4px)]"
            }`}
          />
          <button
            onClick={() => setActiveTab("pending")}
            className={`relative z-10 py-2 text-sm font-semibold transition-colors ${
              activeTab === "pending" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Menunggu Balasan
            <Badge
              variant="secondary"
              className="ml-2 bg-orange-100 text-orange-700 hover:bg-orange-100"
            >
              {escalations.filter((e) => e.status === "pending").length}
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`relative z-10 py-2 text-sm font-semibold transition-colors ${
              activeTab === "resolved"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Riwayat Selesai
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari alasan eskalasi..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Ticket List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Memuat data tiket...
          </div>
        ) : filteredEscalations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold">
                Tidak ada tiket ditemukan
              </h3>
              <p className="text-sm text-muted-foreground">
                Semua permintaan bantuan telah ditangani.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEscalations.map((ticket) => (
            <Card
              key={ticket.id}
              className="group cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${ticket.status === "pending" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}
                  >
                    {ticket.status === "pending" ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm line-clamp-1">
                      {ticket.reason}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      ID: {ticket.conversation_id.split("-")[0]}... •{" "}
                      {format(new Date(ticket.created_at), "PPP p", {
                        locale: id,
                      })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Sheet with Chat & Reply */}
      <Sheet
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <SheetContent className="sm:max-w-md md:max-w-lg flex flex-col h-full">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle>Detail Tiket Eskalasi</SheetTitle>
            <SheetDescription>
              Tinjau riwayat percakapan dan kirimkan tanggapan kepada pengguna.
            </SheetDescription>
          </SheetHeader>

          {/* History Chat Section */}
          <div className="flex-1 overflow-hidden flex flex-col py-4">
            <h5 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="h-3 w-3" />
              Riwayat Percakapan
            </h5>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {selectedTicket?.conversations?.messages?.map(
                  (msg: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            : msg.isAdmin
                              ? "bg-blue-600 text-white"
                              : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {msg.role === "user"
                          ? "Pengguna"
                          : msg.isAdmin
                            ? "Admin (Anda)"
                            : "MILA"}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Reply Form */}
          {selectedTicket?.status === "pending" && (
            <div className="pt-4 border-t space-y-3">
              <Textarea
                placeholder="Tulis balasan Anda di sini..."
                className="resize-none h-24"
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    handleStatusUpdate(selectedTicket.id, "resolved")
                  }
                >
                  Tandai Selesai
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSendReply}
                  disabled={isSending}
                >
                  {isSending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Kirim Balasan
                </Button>
              </div>
            </div>
          )}

          {selectedTicket?.status === "resolved" && (
            <SheetFooter className="pt-4 border-t">
              <Badge
                variant="secondary"
                className="w-full justify-center py-2 bg-green-100 text-green-700"
              >
                Tiket Selesai Ditangani
              </Badge>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
