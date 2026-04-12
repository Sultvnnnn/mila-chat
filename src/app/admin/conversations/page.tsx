"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCcw,
  MessageSquare,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationsPage() {
  const { toast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedChat, setSelectedChat] = useState<any>(null);

  // state modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "single" | "bulk";
    chatId?: string | null;
  }>({ isOpen: false, type: "single", chatId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchConversations = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        `Database Error: Failed to fetch conversations data. Details: ${error.message}`,
      );
      toast({
        title: "Error",
        description: "Gagal memuat data percakapan.",
        variant: "destructive",
      });
    } else if (data) {
      setConversations(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // open modal
  const confirmDeleteSingle = (id: string) => {
    setDeleteModal({ isOpen: true, type: "single", chatId: id });
  };

  const confirmDeleteAll = () => {
    setDeleteModal({ isOpen: true, type: "bulk", chatId: null });
  };

  // execute delete
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.type === "bulk") {
        const { error } = await supabase
          .from("conversations")
          .delete()
          .neq("id", "0");
        if (error) throw error;

        toast({
          title: "🧹 Bersih Total",
          description: "Semua riwayat percakapan telah dimusnahkan.",
        });
        setConversations([]);
        setSelectedChat(null);
      } else if (deleteModal.type === "single" && deleteModal.chatId) {
        const { error } = await supabase
          .from("conversations")
          .delete()
          .eq("id", deleteModal.chatId);
        if (error) throw error;

        toast({
          title: "🗑️ Terhapus",
          description: "Percakapan berhasil dihapus.",
        });
        setConversations((prev) =>
          prev.filter((chat) => chat.id !== deleteModal.chatId),
        );
        if (selectedChat?.id === deleteModal.chatId) setSelectedChat(null);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Hapus",
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, type: "single", chatId: null });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-mula-light dark:bg-mula-dark/20 text-mula-dark dark:text-mula rounded-xl shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
              Data Interaksi
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Pantau dan bersihkan log percakapan dari pengguna MILA AI.
            </p>
          </div>
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex w-full sm:w-auto gap-2">
          <Button
            onClick={confirmDeleteAll}
            disabled={isLoading || conversations.length === 0}
            variant="outline"
            className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-500 dark:hover:bg-red-950/40"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Kosongkan
          </Button>
          <Button
            onClick={fetchConversations}
            disabled={isLoading}
            className="flex-1 sm:flex-none bg-zinc-900 hover:bg-mula-dark text-white"
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Segarkan
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <CardHeader className="p-4 md:p-6 border-b border-zinc-100 dark:border-zinc-800/50">
          <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
            Data Obrolan Terakhir
          </CardTitle>
        </CardHeader>

        {/* CARD CONTENT */}
        <CardContent className="p-0 sm:p-6">
          <div className="block sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading ? (
              // SKELETON MOBILE
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 ml-4" />
                </div>
              ))
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                Belum ada data interaksi.
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex flex-col gap-1.5 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        {chat.id.substring(0, 6)}...
                      </span>
                      <span className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full">
                        {chat.messages?.length || 0} baris
                      </span>
                    </div>
                    <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(chat.updated_at).toLocaleString("id-ID", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => setSelectedChat(chat)}
                      className="bg-mula/20 text-mula-dark hover:bg-mula/40 dark:bg-mula/10 dark:text-mula dark:hover:bg-mula/20 shadow-none h-8 w-8 rounded-full flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => confirmDeleteSingle(chat.id)}
                      className="bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 shadow-none h-8 w-8 rounded-full flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Session UUID</th>
                  <th className="px-4 py-3 font-medium text-center">
                    Volume Pesan
                  </th>
                  <th className="px-4 py-3 font-medium">Timestamp Terakhir</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-6 w-16 mx-auto rounded-md" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-8 w-32 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : conversations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-zinc-500">
                      Belum ada data interaksi yang terekam.
                    </td>
                  </tr>
                ) : (
                  conversations.map((chat) => (
                    <tr
                      key={chat.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {chat.id.substring(0, 13)}...
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-xs">
                          {chat.messages?.length || 0} baris
                        </span>
                      </td>
                      <td className="px-4 py-3 flex items-center text-zinc-500 dark:text-zinc-400 text-xs">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {new Date(chat.updated_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedChat(chat)}
                            className="bg-mula/20 text-mula-dark hover:bg-mula/40 dark:bg-mula/10 dark:text-mula dark:hover:bg-mula/20 shadow-none h-8 px-3 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Lihat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDeleteSingle(chat.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 shadow-none h-8 px-3 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SHEET PANEL DETAIL CHAT */}
      <Sheet
        open={!!selectedChat}
        onOpenChange={(open) => !open && setSelectedChat(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md md:max-w-xl lg:max-w-2xl flex flex-col p-0 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl"
        >
          <SheetHeader className="px-4 md:px-6 py-4 md:py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-left pr-12">
            <SheetTitle className="text-lg md:text-xl font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-left">
              <MessageSquare className="h-5 w-5 text-mula flex-shrink-0" />
              Detail Sesi Obrolan
            </SheetTitle>
            <p className="text-[10px] md:text-xs text-zinc-500 font-mono mt-1 break-all text-left">
              ID: {selectedChat?.id}
            </p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {selectedChat?.messages?.map((msg: any, index: number) => (
              <div
                key={index}
                className={`flex flex-col max-w-[90%] md:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <span className="text-[10px] text-zinc-400 mb-1.5 ml-1 font-semibold tracking-wider uppercase">
                  {msg.role === "user" ? "Pengguna" : "MILA AI"}
                </span>
                <div
                  className={`p-3 md:p-4 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-mula text-zinc-900 rounded-2xl rounded-tr-sm shadow-sm font-medium" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm shadow-sm"}`}
                >
                  {msg.content ||
                    (msg.parts && msg.parts.map((p: any) => p.text).join(""))}
                </div>
              </div>
            ))}
            <div className="h-8 w-full" />
          </div>
        </SheetContent>
      </Sheet>

      {/* ALERT DIALOG DELETE */}
      <AlertDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteModal({ isOpen: false, type: "single" });
          }
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[99999]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100">
              {deleteModal.type === "bulk"
                ? "Kosongkan Semua Obrolan?"
                : "Hapus Percakapan Ini?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
              {deleteModal.type === "bulk"
                ? "Tindakan ini tidak bisa dibatalkan. Seluruh riwayat percakapan MILA akan dihapus secara permanen dari database."
                : "Tindakan ini tidak bisa dibatalkan. Percakapan ini akan dihapus secara permanen."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border-none transition-colors mt-2 sm:mt-0"
            >
              Batal
            </AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                executeDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isDeleting
                ? "Menghapus..."
                : deleteModal.type === "bulk"
                  ? "Ya, Hapus Semua"
                  : "Ya, Hapus"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
