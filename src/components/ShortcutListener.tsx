"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

// Samakan dengan default di Settings
const defaultShortcuts = [
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

export function ShortcutListener() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika lagi ada modal ganti tombol di settings terbuka
      if (document.body.getAttribute("data-recording-shortcut") === "true")
        return;

      // ignore if focus is on input or textarea
      if (e.key.startsWith("F") && !isNaN(parseInt(e.key.substring(1)))) return;

      const target = e.target as HTMLElement;
      // prettier-ignore
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // button shortcuts logic
      let keyName = e.key === " " ? "Space" : e.key;
      let keyLabel = keyName.length === 1 ? keyName.toUpperCase() : keyName;
      if (e.ctrlKey || e.metaKey) keyLabel = `Ctrl + ${keyLabel}`;
      if (e.altKey) keyLabel = `Alt + ${keyLabel}`;
      if (e.shiftKey && keyName.length === 1) keyLabel = `Shift + ${keyLabel}`;

      let activeShortcuts = [...defaultShortcuts];

      // Retrieve and MERGE data dari cache (Sama kayak di Settings)
      const savedStr = localStorage.getItem("mila_shortcuts");
      if (savedStr) {
        try {
          const parsedSaved = JSON.parse(savedStr);
          activeShortcuts = defaultShortcuts.map((defItem) => {
            const savedItem = parsedSaved.find((s: any) => s.id === defItem.id);
            return savedItem ? { ...defItem, key: savedItem.key } : defItem;
          });
        } catch (err) {
          console.error(
            `Gagal mem-parsing shortcuts dari localStorage. Error: ${err}`,
          );
        }
      }

      // check if the button that was pressed is on the list
      const matchedShortcut = activeShortcuts.find((s) => s.key === keyLabel);

      if (!matchedShortcut) return;

      if (
        isTyping &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.key !== "Escape"
      ) {
        return;
      }

      // MAIN LOGIC
      switch (matchedShortcut.id) {
        case "open_dashboard":
          e.preventDefault();
          router.push("/admin");
          toast({
            title: "🏠 Ke Dashboard",
            description: "Kembali ke halaman utama.",
          });
          break;

        case "open_conversations":
          e.preventDefault();
          router.push("/admin/conversations");
          toast({
            title: "💬 Conversations",
            description: "Membuka riwayat obrolan.",
          });
          break;

        case "open_escalations":
          e.preventDefault();
          router.push("/admin/escalations");
          toast({
            title: "🚨 Escalations",
            description: "Membuka halaman Eskalasi.",
          });
          break;

        case "open_settings":
          e.preventDefault();
          router.push("/admin/settings");
          toast({
            title: "⚙️ Settings",
            description: "Membuka halaman Pengaturan.",
          });
          break;

        case "open_knowledge":
          e.preventDefault();
          router.push("/admin/knowledge");
          toast({
            title: "📚 Knowledge",
            description: "Membuka Knowledge Base.",
          });
          break;

        case "focus_chat":
          e.preventDefault();
          const chatInput = document.getElementById("chat-input");
          if (chatInput) {
            chatInput.focus();
            toast({ description: "Input chat aktif." });
          } else {
            router.push("/admin");
            toast({ description: "Menuju chat dashboard..." });
          }
          break;

        case "clear_chat":
          e.preventDefault();
          if (isTyping) {
            target.blur();
          } else {
            window.dispatchEvent(new Event("clear-chat-event"));
            toast({
              title: "🧹 Obrolan Dibersihkan",
              description: "Perintah clear chat dikirim.",
            });
          }
          break;

        case "toggle_sidebar":
          e.preventDefault();
          window.dispatchEvent(new Event("toggle-sidebar-event"));
          break;

        case "toggle_theme":
          e.preventDefault();
          const newTheme = theme === "dark" ? "light" : "dark";
          setTheme(newTheme);
          toast({
            description: `Mode tampilan diubah ke ${newTheme === "dark" ? "Gelap" : "Terang"}.`,
          });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, toast, theme, setTheme]);

  return null;
}
