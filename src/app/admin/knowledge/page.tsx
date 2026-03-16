"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  Plus,
  Search,
  FileText,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  Loader2,
  Database,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  status: string;
  created_at: string;
}

export default function KnowledgeBasePage() {
  const router = useRouter();

  const [knowledgeData, setKnowledgeData] = useState<KnowledgeDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTable, setActiveTable] = useState<
    "knowledge_entries" | "documents_en"
  >("knowledge_entries");
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // init Supabase
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );
  // fetch knowledge base data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setKnowledgeData([]);

      let query = supabase.from(activeTable).select("*");

      if (activeTable === "knowledge_entries") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("id", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching knowledge base data: ${error.message}`);
      } else {
        setKnowledgeData((data as KnowledgeDoc[]) || []);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [supabase, activeTable]);

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("price") || cat.includes("harga") || cat.includes("paket"))
      return CreditCard;
    if (
      cat.includes("schedule") ||
      cat.includes("jadwal") ||
      cat.includes("kelas")
    )
      return Calendar;
    return FileText;
  };

  // search filter logic
  const filteredData = knowledgeData.filter((item) => {
    const title = (item.title || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    const content = (item.content || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      title.includes(query) ||
      category.includes(query) ||
      content.includes(query)
    );
  });

  // delete logic
  const handleDelete = async () => {
    if (!selectedDoc) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from(activeTable)
      .delete()
      .eq("id", selectedDoc.id);

    setIsDeleting(false);

    if (error) {
      alert(`Error deleting document: ${error.message}`);
    } else {
      setKnowledgeData((prev) =>
        prev.filter((item) => item.id !== selectedDoc.id),
      );
      setShowDeleteAlert(false);
      setSelectedDoc(null);
    }
  };

  // scroll to top button logic
  useEffect(() => {
    const scrollContainer = document.querySelector(".overflow-auto") || window;

    const handleScroll = (e: any) => {
      const scrollTop = e.target?.scrollTop || window.scrollY || 0;
      setShowScrollTop(scrollTop > 300);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.querySelector(".overflow-auto");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
        {/* HEADER PAGE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
              Knowledge Base
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Kelola informasi studio yang akan dipelajari oleh MILA AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <Link href="/admin/knowledge/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-zinc-900 hover:bg-mula-dark text-white dark:bg-mula dark:text-zinc-900 font-semibold transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Data
              </Button>
            </Link>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-full">
          {/* TABS BAHASA */}
          <div className="relative flex p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-lg w-full lg:w-[320px] shrink-0">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md bg-mula dark:bg-mula/90 shadow-md transition-transform duration-500 ease-out ${
                activeTable === "knowledge_entries"
                  ? "translate-x-0"
                  : "translate-x-full"
              }`}
            />
            <button
              onClick={() => setActiveTable("knowledge_entries")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                activeTable === "knowledge_entries"
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Indonesian
            </button>
            <button
              onClick={() => setActiveTable("documents_en")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                activeTable === "documents_en"
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              English
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Cari title, konten, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-none focus-visible:ring-1 focus-visible:ring-mula-dark h-11 w-full rounded-lg"
            />
          </div>
        </div>

        {/* TABLE KNOWLEDGE */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 md:px-6 py-4 font-medium">Title</th>
                  <th className="px-4 md:px-6 py-4 font-medium hidden md:table-cell w-[40%]">
                    Content
                  </th>
                  <th className="px-4 md:px-6 py-4 font-medium hidden sm:table-cell">
                    Category
                  </th>
                  <th className="px-4 md:px-6 py-4 font-medium">Status</th>
                  <th className="px-4 md:px-6 py-4 font-medium hidden lg:table-cell">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-500">
                        <Loader2 className="h-8 w-8 animate-spin text-mula-dark mb-4" />
                        <p>Menarik data dari database...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading && filteredData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-500">
                        <Database className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-4" />
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          Belum ada data dokumen.
                        </p>
                        <p className="text-sm mt-1">
                          Klik "Tambah Data" untuk mulai mengajari MILA AI.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  filteredData.map((item) => {
                    const Icon = getCategoryIcon(item.category);
                    const dateFormatted = item.created_at
                      ? new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-";

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedDoc(item)}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-mula-light dark:bg-mula-dark/20 text-mula-dark dark:text-mula rounded-lg shrink-0 hidden sm:block">
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 md:whitespace-normal group-hover:text-mula-dark transition-colors">
                              {item.title}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 md:px-6 py-4 text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                          <div
                            className="line-clamp-2 max-w-[300px] xl:max-w-[500px]"
                            title={item.content}
                          >
                            {item.content || "-"}
                          </div>
                        </td>

                        <td className="px-4 md:px-6 py-4 text-zinc-600 dark:text-zinc-400 capitalize hidden sm:table-cell">
                          {item.category || "-"}
                        </td>

                        <td className="px-4 md:px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              item.status === "active" ||
                              item.status === "Aktif"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            {item.status || "Draft"}
                          </span>
                        </td>

                        <td className="px-4 md:px-6 py-4 text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">
                          {dateFormatted}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. MODAL DETAIL DATA */}
      <Dialog
        open={!!selectedDoc}
        onOpenChange={(open) => !open && setSelectedDoc(null)}
      >
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-950 p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 gap-0">
          {selectedDoc && (
            <>
              {/* Header Modal */}
              <DialogHeader className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-row items-center gap-3 space-y-0">
                <div className="p-2 bg-mula-light dark:bg-mula-dark/20 text-mula-dark dark:text-mula rounded-lg shrink-0">
                  {(() => {
                    const Icon = getCategoryIcon(selectedDoc.category);
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div className="text-left flex-1 pr-4">
                  <DialogTitle className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    Detail Dokumen
                  </DialogTitle>
                  <p className="text-xs text-zinc-500 capitalize mt-1">
                    {activeTable === "knowledge_entries"
                      ? "Bahasa Indonesia"
                      : "English"}{" "}
                    • {selectedDoc.category || "Uncategorized"}
                  </p>
                </div>
              </DialogHeader>

              {/* Body Modal */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">
                    Title
                  </label>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedDoc.title}
                  </h2>
                </div>

                <div className="flex gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">
                      Status
                    </label>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          selectedDoc.status === "active" ||
                          selectedDoc.status === "Aktif"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {selectedDoc.status || "Draft"}
                      </span>
                    </div>
                  </div>
                  {selectedDoc.created_at && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">
                        Dibuat Pada
                      </label>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {new Date(selectedDoc.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">
                    Content / Knowledge
                  </label>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
                      {selectedDoc.content || "Tidak ada konten."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDoc(null);
                    setTimeout(() => setShowDeleteAlert(true), 150);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>

                <Button
                  className="bg-zinc-900 hover:bg-mula-dark hover:text-zinc-900 text-white dark:bg-mula dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-sm"
                  onClick={() => {
                    const lang =
                      activeTable === "knowledge_entries" ? "id" : "en";
                    router.push(
                      `/admin/knowledge/${selectedDoc.id}/edit?lang=${lang}`,
                    );
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Data
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[99999]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100">
              Yakin mau hapus dokumen ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
              Data yang dihapus nggak bisa dikembalikan lagi. MILA nggak akan
              punya akses ke informasi ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border-none transition-colors"
            >
              Batal
            </AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isDeleting ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SCROLL TO TOP BUTTON */}
      <div
        className={`fixed bottom-6 right-6 z-[50] transition-all duration-500 ease-out ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <Button
          size="icon"
          onClick={scrollToTop}
          className="h-12 w-12 rounded-full shadow-lg bg-zinc-900 hover:bg-mula-dark text-white hover:text-zinc-900 dark:bg-mula dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
