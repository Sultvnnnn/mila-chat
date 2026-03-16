"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileJson,
  ChevronRight,
  Home,
  Database,
  FileSpreadsheet,
  Plus,
  Save,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";

export default function NewKnowledgePage() {
  const [activeTab, setActiveTab] = useState<"manual" | "import">("manual");
  const [targetTable, setTargetTable] = useState<
    "knowledge_entries" | "documents_en"
  >("knowledge_entries");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<{
    success?: boolean;
    msg?: string;
  } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    success?: boolean;
    msg?: string;
  } | null>(null);

  // HANDLER MANUAL INPUT
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSingle(true);
    setSingleResult(null);

    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content, targetTable }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSingleResult({ success: true, msg: "Success adding knowledge!" });
      setTitle("");
      setCategory("");
      setContent("");
    } catch (error: any) {
      setSingleResult({
        success: false,
        msg: error.message || "Failed to save data",
      });
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  // HANDLER BULK IMPORT
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const textData = event.target?.result as string;
      if (selectedFile.name.endsWith(".csv")) {
        Papa.parse(textData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setBulkResult({ success: false, msg: "Error parsing CSV file!" });
              setPreview([]);
            } else {
              setPreview(results.data);
            }
          },
        });
      } else if (selectedFile.name.endsWith(".json")) {
        try {
          const json = JSON.parse(textData);
          setPreview(Array.isArray(json) ? json : [json]);
        } catch (error) {
          setBulkResult({ success: false, msg: "Invalid JSON format!" });
          setPreview([]);
        }
      } else {
        setBulkResult({
          success: false,
          msg: "Only JSON and CSV files are supported!",
        });
        setPreview([]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setIsUploading(true);
    setBulkResult(null);

    try {
      const res = await fetch("/api/knowledge/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: preview, targetTable }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBulkResult({ success: true, msg: data.message });
      setPreview([]);
      setFile(null);
    } catch (error: any) {
      setBulkResult({ success: false, msg: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10 max-w-4xl mx-auto">
      {/* Navigation Breadcrumb */}
      <nav className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-6">
        <Link
          href="/admin"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Admin
        </Link>
        <span className="mx-2 text-zinc-300 dark:text-zinc-700">/</span>
        <Link
          href="/admin/knowledge"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Knowledge Base
        </Link>
        <span className="mx-2 text-zinc-300 dark:text-zinc-700">/</span>
        <span className="text-zinc-900 dark:text-zinc-100 bg-mula-light dark:bg-mula-dark/20 px-2 py-0.5 rounded-md text-mula-dark dark:text-mula">
          Baru
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
          Tambah Data MILA
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Pilih metode untuk menambahkan pengetahuan baru ke dalam sistem.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* WRAPPER TABS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 w-full">
          {/* LANGUAGE SELECTOR */}
          <div className="relative flex p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-lg w-full flex-1 border border-zinc-200 dark:border-zinc-800">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md bg-mula dark:bg-mula/90 shadow-md transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                targetTable === "knowledge_entries"
                  ? "translate-x-0"
                  : "translate-x-full"
              }`}
            />
            <button
              type="button"
              onClick={() => setTargetTable("knowledge_entries")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                targetTable === "knowledge_entries"
                  ? "text-zinc-900 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Indonesian
            </button>
            <button
              type="button"
              onClick={() => setTargetTable("documents_en")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                targetTable === "documents_en"
                  ? "text-zinc-900 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              English
            </button>
          </div>

          {/* INPUT METHOD SELECTOR */}
          <div className="relative flex p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-lg w-full flex-1 border border-zinc-200 dark:border-zinc-800">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md bg-mula dark:bg-mula/90 shadow-md transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeTab === "manual" ? "translate-x-0" : "translate-x-full"
              }`}
            />
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                activeTab === "manual"
                  ? "text-zinc-900 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Plus className="h-4 w-4" />
              Manual Input
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("import")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                activeTab === "import"
                  ? "text-zinc-900 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              Bulk Import
            </button>
          </div>
        </div>

        {/* Short Warning Alert */}
        <div className="mb-8 flex items-start sm:items-center gap-3 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong>Perhatian:</strong> Pastikan isi data sesuai dengan target
            bahasa yang dipilih di atas.
          </p>
        </div>

        {/* MANUAL INPUT */}
        {activeTab === "manual" && (
          <form
            onSubmit={handleSingleSubmit}
            className="space-y-5 animate-in slide-in-from-left-2 duration-300"
          >
            <div>
              <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                Judul Info
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-mula-dark outline-none transition-all dark:text-zinc-100"
                placeholder="Contoh: Harga Kelas Hatha"
              />
            </div>

            {/* KATEGORI */}
            <div>
              <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                Kategori
              </label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-mula-dark outline-none transition-all dark:text-zinc-100 text-base">
                  <SelectValue placeholder="Pilih Kategori..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg">
                  <SelectItem
                    value="Harga"
                    className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800"
                  >
                    Harga / Pricing
                  </SelectItem>
                  <SelectItem
                    value="Kelas"
                    className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800"
                  >
                    Info Kelas
                  </SelectItem>
                  <SelectItem
                    value="Lokasi"
                    className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800"
                  >
                    Lokasi & Fasilitas
                  </SelectItem>
                  <SelectItem
                    value="Jadwal"
                    className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800"
                  >
                    Jadwal
                  </SelectItem>
                  <SelectItem
                    value="Lainnya"
                    className="cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800"
                  >
                    Lainnya
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                Konten Penjelasan
              </label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-mula-dark outline-none transition-all dark:text-zinc-100 resize-none"
                placeholder="Tuliskan jawaban dari judul di atas (2-3 kalimat saja)..."
              />
            </div>

            {singleResult && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 ${singleResult.success ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}
              >
                {singleResult.success ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0" />
                )}
                <p className="font-medium text-sm">{singleResult.msg}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmittingSingle}
              className="w-full sm:w-auto bg-zinc-900 hover:bg-mula-dark text-white dark:bg-mula dark:text-zinc-900 font-semibold px-8 h-12 transition-colors"
            >
              {isSubmittingSingle ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmittingSingle ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </form>
        )}

        {/* BULK IMPORT */}
        {activeTab === "import" && (
          <div className="animate-in slide-in-from-right-2 duration-300">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-colors relative cursor-pointer group">
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <UploadCloud className="h-10 w-10 text-zinc-400 group-hover:text-mula-dark dark:group-hover:text-mula transition-colors mb-4" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {file ? file.name : "Drag & drop or click to upload"}
              </h3>
              <p className="text-sm text-zinc-500 mt-2 flex items-center justify-center gap-2">
                <FileJson className="h-4 w-4" /> JSON
                <FileSpreadsheet className="h-4 w-4 ml-1" /> CSV
              </p>
            </div>

            {/* Status Message */}
            {bulkResult && (
              <div
                className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                  bulkResult.success
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {bulkResult.success ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0" />
                )}
                <p className="font-medium text-sm">{bulkResult.msg}</p>
              </div>
            )}

            {/* Data Preview & Action */}
            {preview.length > 0 && (
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Database className="h-5 w-5 text-mula-dark dark:text-mula" />
                    Preview ({preview.length} entries)
                  </h4>
                  <Button
                    onClick={handleImport}
                    disabled={isUploading}
                    className="w-full sm:w-auto bg-zinc-900 hover:bg-mula-dark text-white dark:bg-mula dark:text-zinc-900 dark:hover:bg-zinc-100 font-semibold transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isUploading ? "Importing..." : "Start Import"}
                  </Button>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 max-h-72 overflow-y-auto border border-zinc-200 dark:border-zinc-800 shadow-inner">
                  <pre className="text-xs text-zinc-600 dark:text-zinc-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(preview.slice(0, 3), null, 2)}
                    {preview.length > 3 &&
                      `\n\n... and ${preview.length - 3} more entries.`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
