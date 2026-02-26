export default function Loading() {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-xs tracking-[0.3em] text-foreground/30 uppercase">
        Mila
      </p>
    </div>
  );
}
