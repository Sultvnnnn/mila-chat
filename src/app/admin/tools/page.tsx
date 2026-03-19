"use client";

import React, { useState } from "react";
import { Search, Loader2, Database, BrainCircuit, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
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

      {/* SEARCH BOX */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 sm:p-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik pertanyaan... (contoh: 'Berapa harga?')"
              className="pl-12 h-14 w-full bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-base focus-visible:ring-mula-dark"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="h-14 w-full sm:w-auto px-8 bg-zinc-900 hover:bg-mula-dark text-white hover:text-zinc-900 dark:bg-mula dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors text-base font-semibold shrink-0"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {isSearching ? "Mencari..." : "Uji Coba"}
          </Button>
        </form>
      </div>

      {/* RESULTS AREA */}
      <div className="space-y-4">
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-mula-dark mb-4" />
            <p>MILA sedang menganalisis jutaan vektor...</p>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center">
            <Database className="h-12 w-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Waduh, Nggak Ketemu!
            </h3>
            <p className="text-zinc-500 mt-2 text-sm sm:text-base">
              Coba cek lagi apa datanya udah diinput di menu Knowledge Base.
            </p>
          </div>
        )}

        {!isSearching &&
          results.map((item, index) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm hover:border-mula-dark/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* SCORE BADGE */}
                <div className="order-1 sm:order-2 flex flex-col items-start sm:items-end shrink-0">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      item.score > 0.7
                        ? "bg-green-100 text-green-700"
                        : item.score > 0.5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Score: {item.score.toFixed(4)}
                  </span>
                  {index === 0 && (
                    <span className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">
                      Top Match
                    </span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="order-2 sm:order-1 flex-1 min-w-0">
                  <span className="text-xs font-bold text-mula-dark dark:text-mula uppercase tracking-wider">
                    {item.category || "Uncategorized"}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-zinc-900 dark:text-zinc-100 mt-1 mb-3 break-words">
                    {item.title}
                  </h3>
                  <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed break-words">
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
