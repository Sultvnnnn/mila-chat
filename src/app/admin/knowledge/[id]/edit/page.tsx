"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditKnowledgePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const lang = searchParams.get("lang") || "id";
  const targetTable = lang === "id" ? "knowledge_entries" : "documents_en";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("faq");
  const [status, setStatus] = useState("active");
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const fetchDoc = async () => {
      const { data, error } = await supabase
        .from(targetTable)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMsg(`Failed to fetch document: ${error.message}`);
      } else if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setCategory(data.category || "faq");
        if (data.status) setStatus(data.status);
      }
      setIsFetching(false);
    };

    if (id) fetchDoc();
  }, [id, targetTable, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and content cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    const payload: any = {
      title: title.trim(),
      content: content.trim(),
      category: category,
    };

    if (lang === "id") {
      payload.status = status;
    }

    const { error } = await supabase
      .from(targetTable)
      .update(payload)
      .eq("id", id);

    setIsSubmitting(false);

    if (error) {
      setErrorMsg(`Failed to update document: ${error.message}`);
    } else {
      router.push("/admin/knowledge");
      router.refresh();
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-mula-dark mb-4" />
        <p>Menyiapkan data dokumen...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans max-w-4xl mx-auto pb-10">
      {/* HEADER PAGE */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 font-medium">
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
            Edit Dokumen
          </span>
        </nav>

        <div className="mt-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
            Edit Dokumen
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Perbarui materi ({lang === "id" ? "Bahasa Indonesia" : "English"}).
          </p>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TITLE */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-bold tracking-wider uppercase text-zinc-500"
              >
                Judul Dokumen
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-mula-dark h-11"
              />
            </div>

            {/* CATEGORY */}
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wider uppercase text-zinc-500">
                Kategori
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 w-full bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus:ring-mula-dark text-zinc-900 dark:text-zinc-100">
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                  <SelectItem value="faq">FAQ / General</SelectItem>
                  <SelectItem value="kelas">Info Kelas (Class)</SelectItem>
                  <SelectItem value="harga">Harga / Pricing</SelectItem>
                  <SelectItem value="jadwal">Jadwal / Schedule</SelectItem>
                  <SelectItem value="studio">Info Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* STATUS */}
            {lang === "id" && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold tracking-wider uppercase text-zinc-500">
                  Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-11 w-full sm:w-1/2 bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 focus:ring-mula-dark text-zinc-900 dark:text-zinc-100">
                    <SelectValue placeholder="Pilih status..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* CONTENT TEXTAREA */}
          <div className="space-y-2">
            <label
              htmlFor="content"
              className="text-sm font-bold tracking-wider uppercase text-zinc-500"
            >
              Konten / Knowledge
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="flex w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3 py-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mula-dark focus-visible:ring-offset-2 text-zinc-900 dark:text-zinc-100 resize-y"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* FOOTER BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Link href="/admin/knowledge">
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-zinc-900 hover:bg-mula-dark hover:text-zinc-900 text-white dark:bg-mula dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-sm min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Dokumen
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
