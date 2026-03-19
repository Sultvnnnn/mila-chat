"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Bot, RefreshCcw, Save, Edit3, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type AIConfig = {
  role: string;
  rules: string;
  guardrails: string;
  reschedule: string;
  style: string;
};

// Data Default Bahasa Indonesia
const defaultIdConfig: AIConfig = {
  role: "Kamu adalah 'MILA', AI Assistant resmi MULA Yoga Studio.\nKarakter: Ramah, Profesional, Nurturing (Mengayomi), dan Solutif.",
  rules:
    '1. STRICT LANGUAGE: Kamu WAJIB menjawab murni dalam BAHASA INDONESIA yang luwes.\n2. SAPAAN: Gunakan panggilan "Ka" atau "Kakak" untuk user. JANGAN gunakan "Anda" atau "Kamu".\n3. NO HALLUCINATION: Jangan mengarang jadwal/harga yang tidak ada di data referensi.\n4. NO STAGE DIRECTIONS: Dilarang menulis *tersenyum*, *berpikir*, dll.\n5. LOCATION SOP: Ingatkan: KAIA (Matras disediakan), Svasana (Bawa matras sendiri).',
  guardrails:
    'Topik yang DIIZINKAN hanya: Yoga, Jadwal, Harga, Lokasi, Fasilitas, Reschedule.\nJIKA user bertanya soal Politik, Coding, Resep, Curhat Asmara, atau General Knowledge lain:\n1. TOLAK JAWABANNYA. Jangan beri informasi sedikitpun tentang topik itu.\n2. Gunakan template penolakan ini: "Waduh, maaf ya Ka. Mila cuma ngerti seputar yoga dan studio MULA aja nih 😅 Ada yang bisa Mila bantu soal kelas?"',
  reschedule:
    "1. Bandingkan Jam Sekarang dengan Jam Kelas.\n2. Hitung mundur durasinya. Ingat: AM ke PM itu durasinya PANJANG.\n3. Jika sisa waktu > 3 Jam: IZINKAN.\n4. Jika sisa waktu < 3 Jam: TOLAK (System Locked).",
  style:
    '- FORMAT LIST WAJIB: Jika user menanyakan jadwal, harga, fasilitas, atau daftar kelas, kamu WAJIB memecahnya menjadi Markdown bullet points (gunakan simbol "-"). DILARANG KERAS menggabungnya dalam satu paragraf panjang yang dipisah koma.\n- Contoh yang benar:\n  - Senin: Hatha Flow jam 08.00\n  - Selasa: Vinyasa jam 09.00\n- Nada: Hangat dan sopan.',
};

// Data Default Bahasa Inggris
const defaultEnConfig: AIConfig = {
  role: "You are 'MILA', the official AI Assistant of MULA Yoga Studio.\nCharacter: Friendly, Professional, Nurturing, and Solution-oriented.",
  rules:
    '1. STRICT LANGUAGE: You MUST answer purely in ENGLISH. Do NOT use Indonesian words.\n2. ADDRESSING USER: Use "You". Do NOT use Indonesian terms like "Ka" or "Kakak".\n3. NO HALLUCINATION: Do not make up schedules/prices that are not in reference data.\n4. NO STAGE DIRECTIONS: Do not write *smile*, *think*, etc.\n5. LOCATION SOP: Reminder: KAIA (Mats provided), Svasana (Bring your own mat).',
  guardrails:
    "Only the following topics are ALLOWED: Yoga, Schedule, Price, Location, Facilities, Reschedule.\nIF the user asks about Politics, Coding, Recipes, Love Problems, or other General Knowledge:\n1. REFUSE TO ANSWER. Do not provide any information about that topic.\n2. Use this exact polite rejection: \"Oops, I'm afraid that's out of my expertise! 😅 I can only assist you with MULA Yoga studio info. Is there anything else about classes I can help with?\"",
  reschedule:
    "1. Compare Current Time with Class Time.\n2. Count down the duration.\n3. If remaining time > 3 hours: ALLOW.\n4. If remaining time < 3 hours: REJECT (System Locked).",
  style:
    '- MANDATORY LIST FORMATTING: When explaining schedules, prices, facilities, or multiple items, you MUST break them down into Markdown bullet points using the "-" symbol. DO NOT combine multiple items into a single long comma-separated paragraph.\n- Example: \n  - Monday: Hatha Flow at 08.00\n  - Tuesday: Vinyasa at 09.00\n- Tone: Warm and welcoming.',
};

const AutoResizeTextarea = ({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      className={`w-full p-4 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mula-dark resize-none overflow-hidden transition-shadow ${className}`}
    />
  );
};

const fieldLabels: Record<keyof AIConfig, { title: string; desc: string }> = {
  role: {
    title: "Peran & Karakter",
    desc: "Identitas dasar MILA dan bagaimana ia bersikap.",
  },
  rules: {
    title: "Aturan Krusial",
    desc: "Pantangan mutlak dan SOP bahasa/lokasi.",
  },
  guardrails: {
    title: "Batasan Topik",
    desc: "Skenario penolakan di luar topik yoga.",
  },
  reschedule: {
    title: "Logika Reschedule",
    desc: "Aturan matematis pembatalan kelas.",
  },
  style: {
    title: "Gaya Format",
    desc: "Instruksi perapihan Markdown (bullet points).",
  },
};
const configFields = Object.keys(fieldLabels) as Array<keyof AIConfig>;

export default function SettingsPage() {
  const [activeLang, setActiveLang] = useState<"id" | "en">("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [idConfig, setIdConfig] = useState<AIConfig>(defaultIdConfig);
  const [enConfig, setEnConfig] = useState<AIConfig>(defaultEnConfig);
  const [editingField, setEditingField] = useState<keyof AIConfig | null>(null);
  const activeConfig = activeLang === "id" ? idConfig : enConfig;

  const handleConfigChange = (field: keyof AIConfig, value: string) => {
    if (activeLang === "id") {
      setIdConfig((prev) => ({ ...prev, [field]: value }));
    } else {
      setEnConfig((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Konfigurasi AI berhasil diperbarui!");
    }, 1000);
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Kembalikan konfigurasi ke setelan pabrik? Semua modifikasi admin akan hilang.",
    );
    if (!confirmReset) return;

    setIsResetting(true);
    setTimeout(() => {
      setIdConfig(defaultIdConfig);
      setEnConfig(defaultEnConfig);
      setIsResetting(false);
      alert("Sistem telah direset ke setelan bawaan MULA.");
    }, 1000);
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 max-w-5xl mx-auto relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-mula-light dark:bg-mula-dark/20 text-mula-dark dark:text-mula rounded-xl shrink-0">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
              Konfigurasi MILA
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Atur kepribadian, batasan, dan aturan main AI.
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS (DESKTOP) */}
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isResetting || isLoading}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${isResetting ? "animate-spin" : ""}`}
            />
            Reset Default
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isResetting}
            className="bg-zinc-900 hover:bg-mula-dark hover:text-zinc-900 text-white shadow-md"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Menyimpan..." : "Simpan Konfigurasi"}
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* TAB SWITCHER */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <button
            onClick={() => setActiveLang("id")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeLang === "id"
                ? "bg-white dark:bg-zinc-900 text-mula-dark dark:text-mula border-b-2 border-mula-dark dark:border-mula"
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
            }`}
          >
            Bahasa Indonesia
          </button>
          <button
            onClick={() => setActiveLang("en")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeLang === "en"
                ? "bg-white dark:bg-zinc-900 text-mula-dark dark:text-mula border-b-2 border-mula-dark dark:border-mula"
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
            }`}
          >
            English
          </button>
        </div>

        {/* TAMPILAN UNIFIED (MOBILE & DESKTOP) */}
        <CardHeader className="bg-white dark:bg-zinc-900 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-mula" />
            {activeLang === "id" ? "Persona (Indonesia)" : "Persona (English)"}
          </CardTitle>
          <CardDescription>
            Ketuk salah satu aturan di bawah ini untuk mengubahnya.
          </CardDescription>
        </CardHeader>

        <CardContent className="bg-zinc-50/50 dark:bg-zinc-950/30 p-4 md:p-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configFields.map((field) => (
              <div
                key={field}
                onClick={() => setEditingField(field)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl cursor-pointer hover:border-mula hover:shadow-sm active:scale-[0.98] transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {fieldLabels[field].title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {fieldLabels[field].desc}
                    </p>
                  </div>
                  <div className="p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-full shrink-0">
                    <Edit3 className="h-4 w-4 text-mula-dark dark:text-mula" />
                  </div>
                </div>
                <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                    {activeConfig[field]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ACTION BUTTONS (MOBILE ONLY) */}
      <div className="md:hidden flex flex-col gap-3 mt-6 pb-6">
        <Button
          onClick={handleSave}
          disabled={isLoading || isResetting}
          className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-mula-dark hover:text-zinc-900 text-white shadow-md"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Menyimpan..." : "Simpan Konfigurasi"}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isResetting || isLoading}
          className="w-full h-12 text-base text-red-600 border-zinc-200 dark:border-zinc-800"
        >
          Reset ke Default
        </Button>
      </div>

      {/* DRAWER (DESKTOP & MOBILE) */}
      <Drawer
        open={!!editingField}
        onOpenChange={(open) => !open && setEditingField(null)}
      >
        <DrawerContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 outline-none flex flex-col h-[95dvh] sm:h-[80vh] sm:max-w-2xl sm:mx-auto w-full">
          <div className="w-full flex flex-col h-full">
            <DrawerHeader className="text-left shrink-0 pb-2">
              <DrawerTitle className="text-zinc-900 dark:text-zinc-100 text-xl flex items-center justify-between">
                {editingField ? fieldLabels[editingField].title : ""}
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </DrawerTitle>
              <DrawerDescription className="text-zinc-500">
                {editingField ? fieldLabels[editingField].desc : ""}
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 flex-1 flex flex-col min-h-0">
              {editingField && (
                <textarea
                  value={activeConfig[editingField]}
                  onChange={(e) =>
                    handleConfigChange(editingField, e.target.value)
                  }
                  className="flex-1 w-full h-full p-4 text-base bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mula-dark resize-none overflow-y-auto leading-relaxed shadow-inner"
                />
              )}
            </div>

            <DrawerFooter className="pt-2 pb-6 shrink-0 mt-auto">
              <DrawerClose asChild>
                <Button className="w-full h-12 text-base font-bold bg-mula hover:bg-mula-dark text-zinc-900 shadow-md transition-all">
                  Selesai Edit
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
