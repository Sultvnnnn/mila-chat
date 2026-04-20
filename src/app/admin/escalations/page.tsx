"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquareWarning,
  RefreshCcw,
  Eye,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

export default function EscalationsPage() {
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [escalations, setEscalations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isResolving, setIsResolving] = useState(false);

  // STATE BUAT CUSTOM SLIDER TAB
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");

  const fetchEscalations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("escalations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal menarik data eskalasi:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data eskalasi.",
      });
    } else if (data) {
      setEscalations(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleResolve = async (id: string) => {
    setIsResolving(true);
    try {
      const { error } = await supabase
        .from("escalations")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "✅ Selesai",
        description: "Tiket eskalasi berhasil ditandai selesai.",
      });

      setEscalations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "resolved" } : item,
        ),
      );
      setSelectedTicket(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message,
      });
    } finally {
      setIsResolving(false);
    }
  };

  const pendingEscalations = escalations.filter((e) => e.status !== "resolved");
  const resolvedEscalations = escalations.filter(
    (e) => e.status === "resolved",
  );

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-500 rounded-xl shrink-0">
            <MessageSquareWarning className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
              Pusat Eskalasi
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Tangani kendala pengguna yang gagal dijawab oleh MILA AI.
            </p>
          </div>
        </div>

        <Button
          onClick={fetchEscalations}
          disabled={isLoading}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <RefreshCcw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Segarkan Data
        </Button>
      </div>

      {/* TAB */}
      <div className="relative grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-lg w-full sm:max-w-[420px] shrink-0 mb-6">
        {/* Background Slider */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md bg-mula dark:bg-mula/90 shadow-md transition-all duration-500 ease-out ${
            activeTab === "pending" ? "left-1" : "left-[calc(50%+0.125rem)]"
          }`}
        />

        {/* Tab 1: Menunggu Balasan */}
        <button
          onClick={() => setActiveTab("pending")}
          className={`relative z-10 flex items-center justify-center gap-2.5 py-2.5 text-sm font-bold whitespace-nowrap transition-colors duration-300 ${
            activeTab === "pending"
              ? "text-zinc-900"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Menunggu Balasan
          <span
            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors duration-300 ${
              pendingEscalations.length === 0
                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                : "bg-zinc-900/10 text-zinc-900 dark:bg-black/20 dark:text-zinc-300"
            }`}
          >
            {pendingEscalations.length}
          </span>
        </button>

        {/* Tab 2: Riwayat Selesai */}
        <button
          onClick={() => setActiveTab("resolved")}
          className={`relative z-10 flex items-center justify-center py-2.5 text-sm font-bold whitespace-nowrap transition-colors duration-300 ${
            activeTab === "resolved"
              ? "text-zinc-900"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Riwayat Selesai
        </button>
      </div>

      {/* KONTEN TAB: PENDING */}
      {activeTab === "pending" && (
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in duration-300">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : pendingEscalations.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-full mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  Semua Aman!
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                  Tidak ada tiket eskalasi yang menunggu.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {pendingEscalations.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-sm">
                          Sesi: {ticket.conversation_id?.substring(0, 8)}...
                        </span>
                        <span className="text-xs text-zinc-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(ticket.created_at).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                        Alasan: "{ticket.reason || "Tidak ada alasan spesifik"}"
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full sm:w-auto shrink-0 bg-mula/20 text-mula-dark hover:bg-mula/30 dark:bg-mula/10 dark:text-mula"
                    >
                      <Eye className="h-4 w-4 mr-2" /> Tinjau Tiket
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* KONTEN TAB: RESOLVED */}
      {activeTab === "resolved" && (
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm opacity-90 animate-in fade-in duration-300">
          <CardContent className="p-0">
            {resolvedEscalations.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                Belum ada riwayat eskalasi yang diselesaikan.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {resolvedEscalations.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-sm line-through">
                          Sesi: {ticket.conversation_id?.substring(0, 8)}...
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 line-clamp-1">
                        Alasan: "{ticket.reason}"
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20"
                    >
                      Selesai pada{" "}
                      {ticket.resolved_at
                        ? new Date(ticket.resolved_at).toLocaleDateString(
                            "id-ID",
                          )
                        : "-"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PANEL DETAIL TIKET */}
      <Sheet
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-white dark:bg-zinc-950 flex flex-col"
        >
          <SheetHeader className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <SheetTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-500">
              <AlertCircle className="h-5 w-5" />
              Detail Eskalasi
            </SheetTitle>
            <SheetDescription>
              Tinjau alasan eskalasi dan ambil alih percakapan dengan pengguna.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Informasi Sesi
              </h4>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 font-mono text-sm break-all">
                  ID: {selectedTicket?.conversation_id}
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Dibuat pada:{" "}
                  {selectedTicket?.created_at
                    ? new Date(selectedTicket.created_at).toLocaleString(
                        "id-ID",
                      )
                    : "-"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Alasan Eskalasi
              </h4>
              <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900/50 text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {selectedTicket?.reason ||
                  "Tidak ada alasan spesifik yang diberikan oleh sistem."}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-zinc-500 italic">
                *Cari ID Sesi ini di menu 'Data Interaksi' untuk membaca riwayat
                chat lengkap sebelum menghubungi pengguna.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              onClick={() => handleResolve(selectedTicket.id)}
              disabled={isResolving}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isResolving ? (
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Tandai Sudah Ditangani
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
