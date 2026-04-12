"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

export function ShortcutListener() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ignore if focus is on input or textarea
      if (e.key.startsWith("F") && !isNaN(parseInt(e.key.substring(1)))) return;

      const target = e.target as HTMLElement;
      // prettier-ignore
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // button shortcuts
      let keyName = e.key === " " ? "Space" : e.key;
      let keyLabel = keyName.length === 1 ? keyName.toUpperCase() : keyName;

      if (e.ctrlKey || e.metaKey) keyLabel = `Ctrl + ${keyLabel}`;
      if (e.altKey) keyLabel = `Alt + ${keyLabel}`;
      if (e.shiftKey && keyName.length === 1) keyLabel = `Shift + ${keyLabel}`;

      // retrieve data from the browser's cache
      const savedStr = localStorage.getItem("mila_shortcuts");

      // default fallback
      let shortcuts = [
        { id: "focus_chat", label: "Fokus Input Chat", key: "/" },
        { id: "clear_chat", label: "Bersihkan Obrolan", key: "Escape" },
        { id: "open_knowledge", label: "Buka Knowledge Base", key: "Ctrl + K" },
        { id: "open_settings", label: "Buka Pengaturan", key: "Ctrl + ," },
        { id: "toggle_sidebar", label: "Buka/Tutup Sidebar", key: "Ctrl + B" },
        // prettier-ignore
        { id: "toggle_theme", label: "Ganti Tema (Dark/Light)", key: "Alt + T" },
      ];

      if (savedStr) {
        try {
          shortcuts = JSON.parse(savedStr);
        } catch (err) {
          console.error(
            `Gagal mem-parsing shortcuts dari localStorage. Error: ${err}`,
          );
        }
      }

      // check if the button that was pressed is on the list
      const matchedShortcut = shortcuts.find((s) => s.key === keyLabel);

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
        case "open_settings":
          e.preventDefault();
          router.push("/admin/settings");
          toast({
            title: "⚡ Shortcut Aktif",
            description: "Membuka halaman Pengaturan.",
          });
          break;

        case "open_knowledge":
          e.preventDefault();
          router.push("/admin/knowledge");
          toast({
            title: "⚡ Shortcut Aktif",
            description: "Membuka Knowledge Base.",
          });
          break;

        case "focus_chat":
          e.preventDefault();
          const chatInput = document.getElementById("chat-input");
          if (chatInput) {
            chatInput.focus();
            toast({ description: "Fokus pada kolom input obrolan." });
          } else {
            router.push("/admin");
            toast({ description: "Menuju halaman Dashboard Obrolan..." });
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
