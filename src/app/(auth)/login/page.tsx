"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const router = useRouter();

  // init Supabase browser client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // attempt to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // redirect to admin area and refresh server components
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* LEFT PANEL: MULA Branding */}
      <div
        className={`absolute inset-y-0 left-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-mula transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showForm
            ? "w-full -translate-x-full lg:translate-x-0 lg:w-1/2"
            : "w-full translate-x-0"
        }`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-mula-dark/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center w-full max-w-2xl">
          {/* Logo Typography Treatment */}
          <div className="flex flex-col items-center select-none">
            <div className="relative flex items-baseline">
              <span className="absolute -top-9 left-1 font-serif italic text-[2.5rem] text-white drop-shadow-sm">
                me
              </span>
              <h1 className="font-serif text-[6rem] sm:text-8xl tracking-widest uppercase text-white drop-shadow-md leading-none">
                MULA
              </h1>
              <span className="font-serif italic text-3xl sm:text-4xl text-white lowercase">
                i
              </span>
            </div>
            <span className="tracking-[0.3em] text-xs sm:text-sm mt-6 font-sans font-semibold text-white uppercase">
              Yoga & Movement
            </span>
          </div>

          <p className="mt-8 text-base sm:text-lg text-zinc-800/80 font-sans font-medium max-w-md">
            MILA - Content Management System
          </p>

          {/* OPEN PORTAL BUTTON */}
          <div
            className={`mt-12 transition-all duration-500 ease-out ${
              showForm
                ? "opacity-0 scale-95 pointer-events-none absolute"
                : "opacity-100 scale-100 relative"
            }`}
          >
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-full border-2 border-zinc-700/50 bg-transparent text-zinc-800 hover:bg-zinc-800 hover:text-white px-8 h-12 text-sm tracking-widest uppercase transition-all duration-300 font-bold"
            >
              Login
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div
        className={`absolute inset-y-0 right-0 z-10 flex w-full lg:w-1/2 items-center justify-center bg-white dark:bg-zinc-950 p-8 sm:p-12 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showForm ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-full max-w-sm space-y-8 relative">
          <button
            onClick={() => setShowForm(false)}
            className="lg:hidden absolute -top-16 left-0 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          {/* Header Form */}
          <div className="space-y-2">
            <h2 className="text-4xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Welcome
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-sans">
              Sign in to manage your studio's AI.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleLogin} className="space-y-6 font-sans">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="admin@mula.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 focus-visible:ring-mula-dark transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 focus-visible:ring-mula-dark transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium bg-zinc-900 hover:bg-mula-dark hover:text-zinc-900 text-white transition-all duration-300 shadow-lg hover:shadow-mula-dark/50"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in to Dashboard"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
