"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Settings,
  Bot,
  RefreshCcw,
  Save,
  Edit3,
  X,
  KeyRound,
  Keyboard,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type AIConfig = {
  role: string;
  rules: string;
  guardrails: string;
  reschedule: string;
  style: string;
};

// Data Default Bahasa Indonesia
// prettier-ignore
const defaultIdConfig: AIConfig = {
  role: "Kamu adalah 'MILA', AI Assistant resmi MULA Yoga Studio.\nKarakter: Ramah, Profesional, Nurturing (Mengayomi), dan Solutif.",
  rules: '1. STRICT LANGUAGE: Kamu WAJIB menjawab murni dalam BAHASA INDONESIA yang luwes.\n2. SAPAAN: Gunakan panggilan "Ka" atau "Kakak" untuk user. JANGAN gunakan "Anda" atau "Kamu".\n3. NO HALLUCINATION: Jangan mengarang jadwal/harga yang tidak ada di data referensi.\n4. NO STAGE DIRECTIONS: Dilarang menulis *tersenyum*, *berpikir*, dll.\n5. LOCATION SOP: Ingatkan: KAIA (Matras disediakan), Svasana (Bawa matras sendiri).',
  guardrails: 'Topik yang DIIZINKAN hanya: Yoga, Jadwal, Harga, Lokasi, Fasilitas, Reschedule.\nJIKA user bertanya soal Politik, Coding, Resep, Curhat Asmara, atau General Knowledge lain:\n1. TOLAK JAWABANNYA. Jangan beri informasi sedikitpun tentang topik itu.\n2. Gunakan template penolakan ini: "Waduh, maaf ya Ka. Mila cuma ngerti seputar yoga dan studio MULA aja nih 😅 Ada yang bisa Mila bantu soal kelas?"',
  reschedule: "1. Bandingkan Jam Sekarang dengan Jam Kelas.\n2. Hitung mundur durasinya. Ingat: AM ke PM itu durasinya PANJANG.\n3. Jika sisa waktu > 3 Jam: IZINKAN.\n4. Jika sisa waktu < 3 Jam: TOLAK (System Locked).",
  style: '- FORMAT LIST WAJIB: Jika user menanyakan jadwal, harga, fasilitas, atau daftar kelas, kamu WAJIB memecahnya menjadi Markdown bullet points (gunakan simbol "-"). DILARANG KERAS menggabungnya dalam satu paragraf panjang yang dipisah koma.\n- Contoh yang benar:\n   - Senin: Hatha Flow jam 08.00\n   - Selasa: Vinyasa jam 09.00\n- Nada: Hangat dan sopan.',
};

// Data Default Bahasa Inggris
// prettier-ignore
const defaultEnConfig: AIConfig = {
  role: "You are 'MILA', the official AI Assistant of MULA Yoga Studio.\nCharacter: Friendly, Professional, Nurturing, and Solution-oriented.",
  rules: '1. STRICT LANGUAGE: You MUST answer purely in ENGLISH. Do NOT use Indonesian words.\n2. ADDRESSING USER: Use "You". Do NOT use Indonesian terms like "Ka" or "Kakak".\n3. NO HALLUCINATION: Do not make up schedules/prices that are not in reference data.\n4. NO STAGE DIRECTIONS: Do not write *smile*, *think*, etc.\n5. LOCATION SOP: Reminder: KAIA (Mats provided), Svasana (Bring your own mat).',
  guardrails: "Only the following topics are ALLOWED: Yoga, Schedule, Price, Location, Facilities, Reschedule.\nIF the user asks about Politics, Coding, Recipes, Love Problems, or other General Knowledge:\n1. REFUSE TO ANSWER. Do not provide any information about that topic.\n2. Use this exact polite rejection: \"Oops, I'm afraid that's out of my expertise! 😅 I can only assist you with MULA Yoga studio info. Is there anything else about classes I can help with?\"",
  reschedule: "1. Compare Current Time with Class Time.\n2. Count down the duration.\n3. If remaining time > 3 hours: ALLOW.\n4. If remaining time < 3 hours: REJECT (System Locked).",
  style: '- MANDATORY LIST FORMATTING: When explaining schedules, prices, facilities, or multiple items, you MUST break them down into Markdown bullet points using the "-" symbol. DO NOT combine multiple items into a single long comma-separated paragraph.\n- Example: \n   - Monday: Hatha Flow at 08.00\n   - Tuesday: Vinyasa at 09.00\n- Tone: Warm and welcoming.',
};

// Helper Data untuk Label UI
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

// Default Shortcuts Data
type ShortcutDef = { id: string; label: string; key: string };
const defaultShortcuts: ShortcutDef[] = [
  { id: "open_dashboard", label: "Buka Dashboard Utama", key: "/" },
  { id: "open_conversations", label: "Buka Conversations", key: "Ctrl + M" },
  { id: "open_escalations", label: "Buka Escalations", key: "Ctrl + E" },
  { id: "focus_chat", label: "Fokus Input Chat", key: "C" },
  { id: "clear_chat", label: "Bersihkan Obrolan", key: "Escape" },
  { id: "open_knowledge", label: "Buka Knowledge Base", key: "Ctrl + K" },
  { id: "open_settings", label: "Buka Pengaturan", key: "Ctrl + ," },
  { id: "toggle_sidebar", label: "Buka/Tutup Sidebar", key: "Ctrl + B" },
  { id: "toggle_theme", label: "Ganti Tema (Dark/Light)", key: "Alt + T" },
];

export default function SettingsPage() {
  const { toast } = useToast();

  const [activeView, setActiveView] = useState<
    "menu" | "persona" | "password" | "shortcuts"
  >("menu");

  const [activeLang, setActiveLang] = useState<"id" | "en">("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [idConfig, setIdConfig] = useState<AIConfig>(defaultIdConfig);
  const [enConfig, setEnConfig] = useState<AIConfig>(defaultEnConfig);
  const [editingField, setEditingField] = useState<keyof AIConfig | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [shortcuts, setShortcuts] = useState<ShortcutDef[]>(defaultShortcuts);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const activeConfig = activeLang === "id" ? idConfig : enConfig;

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (error && error.code === "PGRST116") {
        console.error(
          `Database Error: Failed to fetch AI config. ${error.message}`,
        );
      } else if (data) {
        setIdConfig({
          role: data.role_id,
          rules: data.rules_id,
          guardrails: data.guardrails_id,
          reschedule: data.reschedule_id,
          style: data.style_id,
        });
        setEnConfig({
          role: data.role_en,
          rules: data.rules_en,
          guardrails: data.guardrails_en,
          reschedule: data.reschedule_en,
          style: data.style_en,
        });
      }
      setIsLoading(false);
    };

    fetchSettings();

    const savedShortcuts = localStorage.getItem("mila_shortcuts");
    if (savedShortcuts) {
      try {
        const parsedSaved = JSON.parse(savedShortcuts);

        const mergedShortcuts = defaultShortcuts.map((defItem) => {
          const savedItem = parsedSaved.find((s: any) => s.id === defItem.id);

          return savedItem ? { ...defItem, key: savedItem.key } : defItem;
        });

        setShortcuts(mergedShortcuts);
      } catch (e) {
        console.error("Local Storage Error: Failed to parse shortcuts.");
      }
    }
  }, []);

  useEffect(() => {
    if (!recordingId) {
      document.body.removeAttribute("data-recording-shortcut");
      return;
    }

    document.body.setAttribute("data-recording-shortcut", "true");

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      let keyName = e.key === " " ? "Space" : e.key;

      if (
        keyName === "Control" ||
        keyName === "Alt" ||
        keyName === "Shift" ||
        keyName === "Meta"
      ) {
        return;
      }

      let keyLabel = keyName.length === 1 ? keyName.toUpperCase() : keyName;
      if (e.ctrlKey || e.metaKey) keyLabel = "Ctrl + " + keyLabel;
      if (e.altKey) keyLabel = "Alt + " + keyLabel;
      if (e.shiftKey && keyName.length === 1) keyLabel = "Shift + " + keyLabel;

      setShortcuts((prev) =>
        prev.map((s) => (s.id === recordingId ? { ...s, key: keyLabel } : s)),
      );
      setRecordingId(null);
      setHasUnsavedChanges(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.removeAttribute("data-recording-shortcut");
    };
  }, [recordingId]);

  const handleSaveShortcuts = () => {
    localStorage.setItem("mila_shortcuts", JSON.stringify(shortcuts));
    toast({
      title: "Shortcuts Saved",
      description: "Keyboard preferences have been saved to this browser.",
    });
    setHasUnsavedChanges(false);
  };

  const handleResetShortcuts = () => {
    setShortcuts(defaultShortcuts);
    localStorage.removeItem("mila_shortcuts");
    setRecordingId(null);
    toast({
      title: "Shortcuts Reset",
      description: "Keyboard preferences restored to default.",
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase.from("ai_settings").upsert({
      id: 1,
      role_id: idConfig.role,
      rules_id: idConfig.rules,
      guardrails_id: idConfig.guardrails,
      reschedule_id: idConfig.reschedule,
      style_id: idConfig.style,
      role_en: enConfig.role,
      rules_en: enConfig.rules,
      guardrails_en: enConfig.guardrails,
      reschedule_en: enConfig.reschedule,
      style_en: enConfig.style,
    });
    setIsLoading(false);

    if (error) {
      console.error(`Database Error: Failed to save config. ${error.message}`);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "An error occurred while saving to the database.",
      });
    } else {
      toast({
        title: "Configuration Saved",
        description: "AI settings have been successfully updated.",
      });
    }
  };

  const handleConfigChange = (field: keyof AIConfig, value: string) => {
    if (activeLang === "id") {
      setIdConfig((prev) => ({ ...prev, [field]: value }));
    } else {
      setEnConfig((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset the configuration to default? All custom changes will be lost.",
    );
    if (!confirmReset) return;

    setIsResetting(true);
    const { error } = await supabase.from("ai_settings").upsert({
      id: 1,
      role_id: defaultIdConfig.role,
      rules_id: defaultIdConfig.rules,
      guardrails_id: defaultIdConfig.guardrails,
      reschedule_id: defaultIdConfig.reschedule,
      style_id: defaultIdConfig.style,
      role_en: defaultEnConfig.role,
      rules_en: defaultEnConfig.rules,
      guardrails_en: defaultEnConfig.guardrails,
      reschedule_en: defaultEnConfig.reschedule,
      style_en: defaultEnConfig.style,
    });
    setIsResetting(false);

    if (error) {
      console.error(`Database Error: Failed to reset config. ${error.message}`);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Could not restore the default configuration.",
      });
    } else {
      setIdConfig(defaultIdConfig);
      setEnConfig(defaultEnConfig);
      toast({
        title: "Reset Successful",
        description: "System restored to default configuration.",
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Password baru dan konfirmasi tidak cocok.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Password minimal 6 karakter.",
      });
      return;
    }

    setIsUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsUpdatingPassword(false);

    if (error) {
      console.error(`Auth Error: Failed to update password. ${error.message}`);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `Error: ${error.message}`,
      });
    } else {
      toast({
        title: "Berhasil!",
        description: "Password admin berhasil diganti.",
      });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 max-w-5xl mx-auto relative overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-mula-light dark:bg-mula-dark/20 text-mula-dark dark:text-mula rounded-xl shrink-0 shadow-sm border border-mula/20">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
              Pengaturan Sistem
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Kelola persona AI, keamanan akun, dan preferensi dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* HALAMAN DAFTAR MENU UTAMA */}
      {activeView === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
          {/* Menu 1: Persona */}
          <div
            onClick={() => setActiveView("persona")}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 md:p-6 rounded-2xl cursor-pointer hover:border-mula dark:hover:border-mula hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl group-hover:bg-mula/20 group-hover:border-mula/30 transition-colors">
                <Bot className="h-6 w-6 text-zinc-700 dark:text-zinc-300 group-hover:text-mula-dark dark:group-hover:text-mula" />
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
                Atur Persona MILA
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Kelola identitas, instruksi batasan, dan gaya bahasa AI.
              </p>
            </div>
          </div>

          {/* Menu 2: Password */}
          <div
            onClick={() => setActiveView("password")}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 md:p-6 rounded-2xl cursor-pointer hover:border-mula dark:hover:border-mula hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl group-hover:bg-mula/20 group-hover:border-mula/30 transition-colors">
                <ShieldCheck className="h-6 w-6 text-zinc-700 dark:text-zinc-300 group-hover:text-mula-dark dark:group-hover:text-mula" />
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
                Keamanan Akun
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ganti kata sandi akses untuk mengamankan dashboard admin.
              </p>
            </div>
          </div>

          {/* Menu 3: Shortcuts */}
          <div
            onClick={() => setActiveView("shortcuts")}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 md:p-6 rounded-2xl cursor-pointer hover:border-mula dark:hover:border-mula hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px] md:col-span-2 lg:col-span-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl group-hover:bg-mula/20 group-hover:border-mula/30 transition-colors">
                <Keyboard className="h-6 w-6 text-zinc-700 dark:text-zinc-300 group-hover:text-mula-dark dark:group-hover:text-mula" />
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
                Shortcut Keyboard
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Atur kombinasi tombol cepat untuk produktivitas maksimal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HALAMAN DETAIL & BREADCRUMB */}
      {activeView !== "menu" && (
        <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
          {/* Navigation Breadcrumb */}
          <nav className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-6">
            <button
              onClick={() => setActiveView("menu")}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Pengaturan Sistem
            </button>
            <span className="mx-2 text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-zinc-900 dark:text-zinc-100 bg-mula-light dark:bg-mula-dark/20 px-2 py-0.5 rounded-md text-mula-dark dark:text-mula">
              {activeView === "persona" && "Atur Persona"}
              {activeView === "password" && "Keamanan Akun"}
              {activeView === "shortcuts" && "Shortcut Keyboard"}
            </span>
          </nav>

          {/* KONTEN: ATUR PERSONA */}
          {activeView === "persona" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* TAB */}
                <div className="relative flex p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-lg w-full md:w-[350px] shrink-0 border border-zinc-200 dark:border-zinc-800/50">
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md bg-mula dark:bg-mula/90 shadow-sm transition-transform duration-500 ease-out ${
                      activeLang === "id" ? "translate-x-0" : "translate-x-full"
                    }`}
                  />
                  <button
                    onClick={() => setActiveLang("id")}
                    className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                      activeLang === "id"
                        ? "text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    Bahasa Indonesia
                  </button>
                  <button
                    onClick={() => setActiveLang("en")}
                    className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                      activeLang === "en"
                        ? "text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    English
                  </button>
                </div>

                <div className="hidden md:flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isResetting || isLoading}
                    className="h-10 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400 border-zinc-200 dark:border-zinc-800 transition-colors"
                  >
                    Reset ke Default
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || isResetting}
                    className="h-10 bg-zinc-900 hover:bg-mula-dark text-white hover:text-zinc-900 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />{" "}
                    {isLoading ? "Menyimpan..." : "Simpan Persona"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {configFields.map((field) => (
                  <div
                    key={field}
                    onClick={() => setEditingField(field)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl cursor-pointer hover:border-mula dark:hover:border-mula hover:shadow-md flex flex-col h-full transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          {fieldLabels[field].title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {fieldLabels[field].desc}
                        </p>
                      </div>
                      <div className="p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg shrink-0 group-hover:bg-mula/20 group-hover:border-mula/30 transition-colors">
                        <Edit3 className="h-4 w-4 text-zinc-500 group-hover:text-mula-dark dark:group-hover:text-mula" />
                      </div>
                    </div>
                    <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex-1 flex flex-col">
                      <div className="bg-zinc-50/50 dark:bg-zinc-950/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50 flex-1 overflow-hidden">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 whitespace-pre-wrap font-mono leading-relaxed">
                          {activeConfig[field]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTONS (MOBILE ONLY) */}
              <div className="md:hidden flex flex-col gap-3 mt-4 pb-6">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || isResetting}
                  className="w-full h-12 font-bold bg-zinc-900 hover:bg-mula-dark text-white hover:text-zinc-900"
                >
                  <Save className="h-5 w-5 mr-2" />{" "}
                  {isLoading ? "Menyimpan..." : "Simpan Persona"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isResetting || isLoading}
                  className="w-full h-12 text-red-600 border-zinc-200 dark:border-zinc-800"
                >
                  Reset ke Default
                </Button>
              </div>
            </div>
          )}

          {/* KONTEN: GANTI PASSWORD */}
          {activeView === "password" && (
            <Card className="p-6 md:p-8 max-w-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-mula/20 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-mula-dark dark:text-mula" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Update Kata Sandi
                </h2>
              </div>
              <p className="text-sm text-zinc-500 mb-8 pl-14">
                Pastikan password baru Anda kuat dan tidak mudah ditebak.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter..."
                    required
                    className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-mula-dark dark:focus:ring-mula transition-all shadow-inner placeholder:text-zinc-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru..."
                    required
                    className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-mula-dark dark:focus:ring-mula transition-all shadow-inner placeholder:text-zinc-400"
                  />
                </div>

                <div className="pt-4 mt-6">
                  <Button
                    type="submit"
                    onClick={handleUpdatePassword}
                    disabled={
                      isUpdatingPassword || !newPassword || !confirmPassword
                    }
                    className="w-full h-12 bg-zinc-900 hover:bg-mula-dark text-white hover:text-zinc-900 font-bold text-base transition-colors rounded-xl"
                  >
                    {isUpdatingPassword ? "Menyimpan..." : "Simpan Password"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* KONTEN: SHORTCUT KEYBOARD */}
          {activeView === "shortcuts" && (
            <Card className="p-6 md:p-8 max-w-3xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-zinc-100 dark:border-zinc-800/50 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-mula/20 rounded-lg">
                      <Keyboard className="h-5 w-5 text-mula-dark dark:text-mula" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Kustomisasi Shortcut
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-500 pl-14">
                    Klik tombol di bawah lalu tekan kombinasi keyboard yang Anda
                    inginkan.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResetShortcuts}
                    className="text-zinc-600 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 h-10"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                  <Button
                    onClick={handleSaveShortcuts}
                    className={`h-10 transition-colors duration-200 ${
                      hasUnsavedChanges
                        ? "bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold border border-amber-600/20 shadow-md shadow-amber-500/20"
                        : "bg-zinc-900 hover:bg-mula-dark text-white hover:text-zinc-900"
                    }`}
                  >
                    {hasUnsavedChanges && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white dark:border-zinc-900"></span>
                      </span>
                    )}
                    <Save className="h-4 w-4 mr-2" />
                    {hasUnsavedChanges ? "Simpan Perubahan" : "Simpan"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 hover:border-mula/50 transition-colors"
                  >
                    <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                      {shortcut.label}
                    </span>

                    <button
                      onClick={() => setRecordingId(shortcut.id)}
                      className={`min-w-[100px] px-3 py-1.5 text-xs font-bold font-mono rounded-lg border-b-2 transition-all active:translate-y-px active:border-b-0 ${
                        recordingId === shortcut.id
                          ? "border-mula text-mula-dark bg-mula/20 animate-pulse shadow-inner"
                          : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm"
                      }`}
                    >
                      {recordingId === shortcut.id
                        ? "Mengetik..."
                        : shortcut.key}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* DRAWER EDIT PERSONA */}
      <Drawer
        open={!!editingField}
        onOpenChange={(open) => !open && setEditingField(null)}
      >
        <DrawerContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 outline-none flex flex-col h-[95dvh] sm:h-[80vh] sm:max-w-2xl sm:mx-auto w-full">
          <div className="w-full flex flex-col h-full">
            <DrawerHeader className="text-left shrink-0 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <DrawerTitle className="text-zinc-900 dark:text-zinc-100 text-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-mula" />
                  {editingField ? fieldLabels[editingField].title : ""}
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </DrawerTitle>
              <DrawerDescription className="text-zinc-500 dark:text-zinc-400 mt-1">
                {editingField ? fieldLabels[editingField].desc : ""}
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 md:p-6 flex-1 flex flex-col min-h-0 bg-zinc-50/50 dark:bg-zinc-950/50">
              {editingField && (
                <textarea
                  value={activeConfig[editingField]}
                  onChange={(e) =>
                    handleConfigChange(editingField, e.target.value)
                  }
                  className="flex-1 w-full h-full p-5 text-base font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-mula-dark dark:focus:ring-mula resize-none overflow-y-auto leading-relaxed shadow-sm placeholder:text-zinc-300"
                  placeholder="Ketik instruksi atau aturan di sini..."
                />
              )}
            </div>

            <DrawerFooter className="pt-4 pb-6 shrink-0 mt-auto border-t border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
              <DrawerClose asChild>
                <Button className="w-full h-14 text-base font-bold bg-zinc-900 hover:bg-mula-dark text-white hover:text-zinc-900 shadow-md transition-colors rounded-xl">
                  Simpan Teks & Tutup Panel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
