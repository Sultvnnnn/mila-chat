"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  Wrench,
  Settings,
  Menu,
  PanelLeft,
  LogOut,
  RefreshCcw,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ShortcutListener } from "@/components/ShortcutListener";

// navigation items
// prettier-ignore
const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Conversations", href: "/admin/conversations", icon: MessageSquare },
    { name: "Knowledge Base", href: "/admin/knowledge", icon: Database },
    { name: "Tools & Functions", href: "/admin/tools", icon: Wrench },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // init Supabase for logout
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // shortcut listener for sidebar
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsCollapsed((prev) => !prev);
    };

    window.addEventListener("toggle-sidebar-event", handleToggleSidebar);
    // prettier-ignore
    return () => window.removeEventListener("toggle-sidebar-event", handleToggleSidebar);
  }, []);

  const pathLast = pathname.split("/").pop();
  const pageTitle =
    !pathLast || pathLast === "admin"
      ? "Dashboard"
      : pathLast.replace(/-/g, " ");

  return (
    <>
      <style jsx global>{`
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        [data-theme-transition="expand"]::view-transition-old(root) {
          z-index: 1;
        }
        [data-theme-transition="expand"]::view-transition-new(root) {
          z-index: 2;
        }
        [data-theme-transition="shrink"]::view-transition-old(root) {
          z-index: 2;
        }
        [data-theme-transition="shrink"]::view-transition-new(root) {
          z-index: 1;
        }
      `}</style>

      <div className="flex h-[100dvh] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
        {/* OVERLAY UNTUK MOBILE */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isCollapsed ? "lg:w-20" : "lg:w-72"
          } ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}`}
        >
          {/* Sidebar Header (Logo) - Bersih dari tombol toggle */}
          <div
            className={`flex h-16 shrink-0 items-center border-b border-zinc-200 dark:border-zinc-800 transition-all ${isCollapsed ? "justify-center" : "px-6"}`}
          >
            {isCollapsed ? (
              <span className="font-serif text-4xl tracking-widest uppercase text-zinc-900 dark:text-zinc-100 drop-shadow-sm leading-none">
                M
              </span>
            ) : (
              // Logo Full
              <div className="flex flex-col select-none pt-1">
                <span className="font-serif italic text-lg mb-[-8px] mr-16 text-zinc-700 dark:text-zinc-400">
                  me
                </span>
                <div className="flex items-baseline">
                  <h1 className="font-serif text-4xl tracking-widest uppercase text-zinc-900 dark:text-zinc-100 drop-shadow-sm leading-none">
                    MULA
                  </h1>
                  <span className="font-serif italic text-xl text-zinc-900 dark:text-zinc-100 lowercase ml-1">
                    i
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Navigasi Menu */}
          <nav className="flex-1 p-3 space-y-1 mt-2">
            {sidebarLinks.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);

              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group relative ${
                    isActive
                      ? "bg-mula text-zinc-900 shadow-sm dark:bg-mula/90 dark:text-zinc-900 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-mula-light/50 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  } ${isCollapsed ? "lg:justify-center" : ""}`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"}`}
                  />

                  <span
                    className={`text-sm truncate transition-all duration-300 ${isCollapsed ? "lg:hidden" : "block"}`}
                  >
                    {link.name}
                  </span>

                  {isCollapsed && (
                    <div className="absolute left-full ml-4 hidden rounded-md bg-zinc-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 lg:block z-50 pointer-events-none whitespace-nowrap shadow-md">
                      {link.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer (Logout) */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all ${
                isCollapsed ? "lg:justify-center" : ""
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span
                className={`text-sm font-medium transition-all ${isCollapsed ? "lg:hidden" : "block"}`}
              >
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950">
          {/* HEADER TOP BAR */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Tombol Hamburger (Mobile) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden text-zinc-600 dark:text-zinc-400"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Tombol Toggle Sidebar (Desktop) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <PanelLeft className="h-5 w-5" />
              </Button>

              {/* Divider */}
              <div className="hidden lg:block h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

              {/* Judul Halaman */}
              <h2 className="text-lg font-semibold tracking-tight capitalize text-zinc-800 dark:text-zinc-100 hidden sm:block">
                {pageTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {pathname === "/admin" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    window.dispatchEvent(new Event("refresh-dashboard"))
                  }
                  className="md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  title="Segarkan Data"
                >
                  <RefreshCcw className="h-5 w-5" />
                </Button>
              )}
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hidden sm:block">
                MULA Studio
              </span>
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </div>
        </main>

        <ShortcutListener />
      </div>
    </>
  );
}
