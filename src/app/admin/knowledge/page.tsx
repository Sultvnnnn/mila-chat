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
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteAlert, setShowBulkDeleteAlert] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // init Supabase
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  // reset pagination and selection when table or search query changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeTable, searchQuery]);

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

  // logic pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // logic checkbox select
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedData.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // logic bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);

    const { error } = await supabase
      .from(activeTable)
      .delete()
      .in("id", selectedIds);

    setIsBulkDeleting(false);

    if (error) {
      alert(`Failed to delete selected items: ${error.message}`);
    } else {
      setKnowledgeData((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id)),
      );
      setSelectedIds([]);
      setShowBulkDeleteAlert(false);
    }
  };

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
      {/* FLOATING SEARCH BAR */}
      <div
        className={`fixed top-20 sm:top-24 left-0 right-0 z-30 flex justify-center px-4 transition-all duration-500 ease-out ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "-translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative w-full max-w-md shadow-xl rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-mula-dark/40 dark:border-mula/40 ring-4 ring-mula-dark/10 dark:ring-mula/10 p-1 transition-all">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mula-dark dark:text-mula" />
          <Input
            placeholder="Cari title, konten, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-transparent border-none focus-visible:ring-0 h-11 w-full rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 placeholder:font-normal"
          />
        </div>
      </div>

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

        {/* ACTION BAR BULK DELETE */}
        {selectedIds.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-3 mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-red-800 dark:text-red-400">
              {selectedIds.length} dokumen terpilih
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteAlert(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Terpilih
            </Button>
          </div>
        )}

        {/* TABLE KNOWLEDGE */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  {/* TH CHECKBOX */}
                  <th className="px-4 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-zinc-300 dark:border-zinc-700 text-mula-dark focus:ring-mula cursor-pointer"
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((item) =>
                          selectedIds.includes(item.id),
                        )
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
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
                  <>
                    {[...Array(5)].map((_, index) => (
                      <tr
                        key={`skeleton-${index}`}
                        className="border-b border-zinc-200 dark:border-zinc-800"
                      >
                        {/* Title Skeleton */}
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3 animate-pulse">
                            <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg shrink-0 hidden sm:block"></div>
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4"></div>
                          </div>
                        </td>
                        {/* Content Skeleton */}
                        <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                          <div className="animate-pulse space-y-2">
                            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full"></div>
                            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md w-2/3"></div>
                          </div>
                        </td>
                        {/* Category Skeleton */}
                        <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-20 animate-pulse"></div>
                        </td>
                        {/* Status Skeleton */}
                        <td className="px-4 md:px-6 py-4">
                          <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
                        </td>
                        {/* Date Skeleton */}
                        <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24 animate-pulse"></div>
                        </td>
                      </tr>
                    ))}
                  </>
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
                  paginatedData.map((item) => {
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
                        onClick={() => {
                          setSelectedDoc(item);
                          setIsDrawerOpen(true);
                        }}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                      >
                        {/* TD CHECKBOX */}
                        <td
                          className="px-4 py-4 w-12 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-zinc-300 dark:border-zinc-700 text-mula-dark focus:ring-mula cursor-pointer"
                            checked={selectedIds.includes(item.id)}
                            onChange={(e) =>
                              handleSelectOne(item.id, e.target.checked)
                            }
                          />
                        </td>
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

          {/* UI PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
              <span className="text-xs sm:text-sm text-zinc-500">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="Ke Halaman Pertama"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Ke Halaman Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  title="Ke Halaman Selanjutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Ke Halaman Terakhir"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="h-16 md:h-8 w-full flex-shrink-0" />
      </div>

      {/* DRAWER DETAIL DATA */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedDoc(null);
            }, 300);
          }
        }}
      >
        <DrawerContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[96vh] w-full max-w-3xl mx-auto rounded-t-2xl sm:rounded-t-3xl">
          {selectedDoc ? (
            <div className="w-full max-w-3xl mx-auto flex flex-col overflow-hidden">
              {/* Header Drawer */}
              <DrawerHeader className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-row items-center gap-3 shrink-0 text-left">
                <div className="p-2 bg-mula-light dark:bg-mula-dark/20 text-mula-dark dark:text-mula rounded-lg shrink-0 hidden sm:block">
                  {(() => {
                    const Icon = getCategoryIcon(selectedDoc.category || "");
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div className="flex-1 pr-4">
                  <DrawerTitle className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    Detail Dokumen
                  </DrawerTitle>
                  <p className="text-xs text-zinc-500 capitalize mt-1">
                    {activeTable === "knowledge_entries"
                      ? "Bahasa Indonesia"
                      : "English"}{" "}
                    • {selectedDoc.category || "Uncategorized"}
                  </p>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </DrawerHeader>

              {/* Body Drawer */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">
                    Title
                  </label>
                  <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {selectedDoc.title}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-4">
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
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
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

                <div className="space-y-2 pb-4">
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500">
                    Content / Knowledge
                  </label>
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                      {selectedDoc.content || "Tidak ada konten."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Drawer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 mb-safe">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteAlert(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Hapus</span>
                </Button>

                <Button
                  className="bg-zinc-900 hover:bg-mula-dark text-white dark:bg-mula dark:text-zinc-900 transition-colors shadow-sm flex-1 sm:flex-none"
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
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto h-[50vh]" />
          )}
        </DrawerContent>
      </Drawer>

      {/* ALERT DIALOG DELETE */}
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

      {/* ALERT DIALOG BULK DELETE */}
      <AlertDialog
        open={showBulkDeleteAlert}
        onOpenChange={setShowBulkDeleteAlert}
      >
        <AlertDialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[99999]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100">
              Hapus {selectedIds.length} Dokumen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
              Tindakan ini tidak bisa dibatalkan. {selectedIds.length} data yang
              Anda centang akan dihapus secara permanen dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isBulkDeleting}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border-none transition-colors"
            >
              Batal
            </AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
            >
              {isBulkDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isBulkDeleting ? "Menghapus..." : "Ya, Hapus Semua"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SCROLL TO TOP BUTTON */}
      <div
        className={`fixed bottom-6 right-4 md:right-6 z-[50] transition-all duration-500 ease-out ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <Button
          size="icon"
          onClick={scrollToTop}
          className="h-10 w-10 md:h-12 md:w-12 rounded-full shadow-lg bg-zinc-900 hover:bg-mula-dark text-white hover:text-zinc-900 dark:bg-mula dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors"
        >
          <ArrowUp className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </>
  );
}
