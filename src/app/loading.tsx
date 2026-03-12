import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6">
        {/* Breathing Circle Animation */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-mula-light dark:bg-mula-dark/10 shadow-inner">
          {/* efek gelombang di belakang */}
          <div className="absolute h-full w-full animate-ping rounded-full bg-mula opacity-20 duration-1000"></div>

          {/* efek denyut di tengah */}
          <div className="absolute h-14 w-14 animate-pulse rounded-full bg-mula/50 dark:bg-mula-dark/40 duration-1000"></div>

          <Sparkles className="relative z-10 h-7 w-7 text-mula-dark dark:text-mula animate-pulse" />
        </div>

        {/* Typography */}
        <div className="flex flex-col items-center select-none animate-pulse duration-1000">
          <span className="font-serif italic text-sm text-zinc-500 dark:text-zinc-400 mb-[-4px]">
            just a moment,
          </span>
          <span className="font-serif text-xl tracking-[0.3em] text-zinc-800 dark:text-zinc-200 drop-shadow-sm ml-2">
            MILA is almost ready
          </span>
        </div>
      </div>
    </div>
  );
}
