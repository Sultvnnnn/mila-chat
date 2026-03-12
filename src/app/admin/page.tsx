export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Overview of your MILA AI assistant's performance.
        </p>
      </div>

      {/* Grid Statistik */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Total Knowledge */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Total Knowledge Entries
          </h3>
          <p className="mt-2 text-4xl font-bold">24</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Active Q&A pairs
          </p>
        </div>

        {/* Card 2: Conversations Today */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Conversations Today
          </h3>
          <p className="mt-2 text-4xl font-bold">12</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            +3 from yesterday
          </p>
        </div>

        {/* Card 3: Recent Escalations */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Recent Escalations
          </h3>
          <p className="mt-2 text-4xl font-bold text-amber-600 dark:text-amber-500">
            2
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Needs staff attention
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 min-h-[300px] flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Conversation charts will appear here...
        </p>
      </div>
    </div>
  );
}
