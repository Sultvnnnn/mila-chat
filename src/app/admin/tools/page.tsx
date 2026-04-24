"use client";

import React, { useState } from "react";
import {
  Search,
  Loader2,
  Database,
  BrainCircuit,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ToolsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch("/api/tester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResults(data.results || []);
    } catch (error) {
      console.error(`Search error: ${error}`);
      alert(
        `Failed to perform search: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full max-w-full overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-mula-light dark:bg-mula-dark/20 text-mula-dark dark:text-mula rounded-xl shrink-0">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
              MILA Search Tester
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Uji akurasi Hybrid Search (Vector + Keyword) secara real-time.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH BOX */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 sm:p-6 mb-8 w-full">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative"
        >
          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik pertanyaan untuk diuji... (Contoh: Berapa harga kelas?)"
              className="pl-12 h-14 w-full bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-base focus-visible:ring-1 focus-visible:ring-mula-dark shadow-inner"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="h-14 w-full sm:w-auto px-8 bg-zinc-900 hover:bg-mula-dark text-white hover:text-zinc-900 dark:bg-mula dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all duration-300 text-base font-semibold shrink-0"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-5 w-5 mr-2" />
            )}
            {isSearching ? "Menganalisis..." : "Uji Coba"}
          </Button>
        </form>
      </div>

      {/* RESULTS AREA */}
      <div className="space-y-5 w-full">
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm w-full">
            <div className="relative flex items-center justify-center h-16 w-16 mb-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-mula-dark opacity-20 animate-ping"></span>
              <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-mula-light dark:bg-mula-dark/40 shadow-sm border border-mula/50">
                <BrainCircuit className="h-6 w-6 text-mula-dark dark:text-mula animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1 tracking-tight">
              MILA sedang berpikir...
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
              Mencocokkan vektor dari jutaan titik data.
            </p>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm w-full">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4 shadow-inner">
              <Database className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Data Tidak Ditemukan
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm text-center">
              Coba gunakan kata kunci lain atau pastikan data terkait sudah
              ditambahkan di menu Knowledge Base.
            </p>
          </div>
        )}

        {!isSearching &&
          results.map((item, index) => (
            <div
              key={item.id}
              className={`relative bg-white dark:bg-zinc-900 border w-full ${
                index === 0
                  ? "border-mula dark:border-mula shadow-md shadow-mula/10"
                  : "border-zinc-200 dark:border-zinc-800 shadow-sm"
              } rounded-xl p-5 sm:p-6 transition-all hover:shadow-md`}
            >
              {/* RANKING BADGE KIRI ATAS */}
              <div className="absolute -top-3 -left-3 flex items-center justify-center h-8 w-8 rounded-full bg-zinc-900 text-white font-bold shadow-md border-2 border-white dark:border-zinc-950 text-sm z-10">
                #{index + 1}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
                {/* KONTEN KIRI */}
                <div className="order-2 sm:order-1 flex-1 min-w-0 pr-0 sm:pr-4">
                  <Badge
                    variant="secondary"
                    className="mb-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium rounded-md px-2 py-0.5"
                  >
                    {item.category || "Uncategorized"}
                  </Badge>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 leading-tight">
                    {item.title}
                  </h3>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed border border-zinc-100 dark:border-zinc-800/80">
                    {item.content}
                  </div>
                </div>

                {/* KANAN: SCORE */}
                <div className="order-1 sm:order-2 flex flex-col items-start sm:items-end shrink-0 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 min-w-[140px]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">
                    Relevance Score
                  </span>
                  <span
                    className={`inline-flex items-center text-lg font-black font-mono ${
                      item.score > 0.7
                        ? "text-emerald-600 dark:text-emerald-400"
                        : item.score > 0.5
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    <Target className="h-4 w-4 mr-1.5 opacity-70" />
                    {item.score.toFixed(4)}
                  </span>

                  {index === 0 && (
                    <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-mula/20 text-mula-dark dark:text-mula border border-mula/30">
                      Top Match 🏆
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
