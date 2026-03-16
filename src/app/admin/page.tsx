import { createClient } from "@supabase/supabase-js";
import {
  Database,
  MessageCircle,
  AlertOctagon,
  ArrowUpRight,
  Activity,
  BarChart3,
  Clock,
} from "lucide-react";
import DashboardChart from "@/components/DashboardChart";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { count: totalKnowledge } = await supabase
    .from("knowledge_entries")
    .select("*", { count: "exact", head: true });

  const stats = [
    {
      title: "Total Knowledge Base",
      value: totalKnowledge || 0,
      icon: Database,
      trend: "Data aktif di Supabase",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      title: "Percakapan Hari Ini",
      value: "142",
      icon: MessageCircle,
      trend: "+5% dari kemarin",
      color:
        "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400",
    },
    {
      title: "Eskalasi ke Admin",
      value: "3",
      icon: AlertOctagon,
      trend: "Butuh perhatian segera",
      color: "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans pb-10 max-w-6xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
          Dashboard Overview
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Pantau performa MILA dan kelola pengetahuan studio MULA Yoga.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-mula-dark/50 transition-colors relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-zinc-50 dark:to-zinc-800/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {i === 0 && (
                    <span className="flex items-center text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Live
                    </span>
                  )}
                </div>
                <div className="mt-6">
                  <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                    {stat.title}
                  </h3>
                  <p className="text-4xl font-sans tracking-tight font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <Activity className="h-4 w-4 mr-2 text-zinc-400" />
                  {stat.trend}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-mula-dark dark:text-mula" />
                Tren Interaksi MILA
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Jumlah pesan masuk dari semua platform (7 hari terakhir).
              </p>
            </div>
          </div>
          <div className="flex-1 mt-4">
            <DashboardChart />
          </div>
        </div>

        {/* RECENT ACTIVITY SECTION */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-mula-dark dark:text-mula" />
            Aktivitas Terkini
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/50 p-6">
            <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full mb-4 shadow-sm">
              <MessageCircle className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-sm">
              Belum ada percakapan
            </h3>
            <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
              Riwayat obrolan dari Web Chat, WhatsApp, dan Instagram akan
              otomatis muncul di sini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
