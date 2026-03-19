"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Users,
  Activity,
  Clock,
  Database,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  LayoutDashboard,
  RefreshCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    totalKnowledge: 0,
    escalations: 0,
    lastActive: "-",
    trends: {
      sessions: { text: "", color: "", icon: "" },
      messages: { text: "", color: "", icon: "" },
      knowledge: { text: "", color: "", icon: "" },
      escalations: { text: "", color: "", icon: "" },
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      const [
        { data: convData, error: convError },
        { data: idKnowledgeData, error: idKnowError },
        { data: enKnowledgeData, error: enKnowError },
        { data: escData, error: escError },
      ] = await Promise.all([
        supabase
          .from("conversations")
          .select("messages, updated_at")
          .order("updated_at", { ascending: false }),

        supabase.from("knowledge_entries").select("created_at"),
        supabase.from("documents_en").select("created_at"),
        supabase.from("escalations").select("created_at"),
      ]);

      if (convError)
        console.error(
          `Database Error: Failed to fetch conversations. Details: ${convError.message}`,
        );
      if (idKnowError)
        console.error(
          `Database Error: Failed to fetch ID knowledge entries count. Details: ${idKnowError.message}`,
        );
      if (enKnowError)
        console.error(
          `Database Error: Failed to fetch EN knowledge entries count. Details: ${enKnowError.message}`,
        );
      if (escError)
        console.error(
          `Database Error: Failed to fetch escalations. Details: ${escError.message}`,
        );

      if (convData) {
        const totalSessions = convData.length;
        const totalMessages = convData.reduce(
          (acc, curr) => acc + (curr.messages?.length || 0),
          0,
        );
        const totalKnowledge =
          (idKnowledgeData?.length || 0) + (enKnowledgeData?.length || 0);
        const escalationsCount = escData?.length || 0;

        // Logic Trend Harian
        const now = new Date();
        const todayStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        ).getTime();
        const yesterdayStart = todayStart - 86400000;

        let todaySessions = 0,
          yesterdaySessions = 0;
        let todayMessages = 0,
          yesterdayMessages = 0;
        let todayKnowledgeCount = 0,
          yesterdayKnowledgeCount = 0;
        let todayEsc = 0,
          yesterdayEsc = 0;

        // Hitung tren obrolan
        convData.forEach((chat) => {
          const time = new Date(chat.updated_at).getTime();
          const msgs = chat.messages?.length || 0;
          if (time >= todayStart) {
            todaySessions++;
            todayMessages += msgs;
          } else if (time >= yesterdayStart && time < todayStart) {
            yesterdaySessions++;
            yesterdayMessages += msgs;
          }
        });

        // Hitung tren knowledge
        const allKnowledge = [
          ...(idKnowledgeData || []),
          ...(enKnowledgeData || []),
        ];
        allKnowledge.forEach((doc) => {
          const time = doc.created_at ? new Date(doc.created_at).getTime() : 0;
          if (time >= todayStart) todayKnowledgeCount++;
          else if (time >= yesterdayStart && time < todayStart)
            yesterdayKnowledgeCount++;
        });

        // Hitung tren eskalasi
        escData?.forEach((esc) => {
          const time = esc.created_at ? new Date(esc.created_at).getTime() : 0;
          if (time >= todayStart) todayEsc++;
          else if (time >= yesterdayStart && time < todayStart) yesterdayEsc++;
        });

        // Helper pembentuk UI Trend
        const getTrendInfo = (today: number, yesterday: number) => {
          const diff = today - yesterday;
          if (diff > 0)
            return {
              text: `+${diff} dari kemarin`,
              color: "text-emerald-500 dark:text-emerald-400",
              icon: "up",
            };
          if (diff < 0)
            return {
              text: `${diff} dari kemarin`,
              color: "text-red-500 dark:text-red-400",
              icon: "down",
            };
          return {
            text: "Sama seperti kemarin",
            color: "text-zinc-500 dark:text-zinc-400",
            icon: "flat",
          };
        };

        // Format Waktu Terakhir
        let lastActiveFormatted = "Belum ada interaksi";
        if (convData.length > 0 && convData[0].updated_at) {
          lastActiveFormatted = new Date(convData[0].updated_at).toLocaleString(
            "id-ID",
            {
              dateStyle: "medium",
              timeStyle: "short",
            },
          );
        }

        // Generate Data untuk Chart
        const groupedByDate: Record<string, number> = {};
        convData.forEach((chat) => {
          const dateStr = new Date(chat.updated_at).toLocaleDateString(
            "id-ID",
            { month: "short", day: "numeric" },
          );
          groupedByDate[dateStr] =
            (groupedByDate[dateStr] || 0) + (chat.messages?.length || 0);
        });

        const formattedChartData = Object.keys(groupedByDate)
          .reverse()
          .map((date) => ({
            name: date,
            Pesan: groupedByDate[date],
          }));

        setChartData(formattedChartData);
        setStats({
          totalSessions,
          totalMessages,
          totalKnowledge,
          escalations: escalationsCount,
          lastActive: lastActiveFormatted,
          trends: {
            sessions: getTrendInfo(todaySessions, yesterdaySessions),
            messages: getTrendInfo(todayMessages, yesterdayMessages),
            knowledge: getTrendInfo(
              todayKnowledgeCount,
              yesterdayKnowledgeCount,
            ),
            escalations: getTrendInfo(todayEsc, yesterdayEsc),
          },
        });
      }
    } catch (error) {
      console.error(
        `Unexpected Error: Failed to fetch dashboard data. Details: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener("refresh-dashboard", fetchDashboardData);

    return () => {
      window.removeEventListener("refresh-dashboard", fetchDashboardData);
    };
  }, []);

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      {/* HEADER DESKTOP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-mula-light dark:bg-mula-dark/20 text-mula-dark dark:text-mula rounded-xl shrink-0">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
              Dashboard Analitik
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Ringkasan performa dan metrik interaksi MILA AI.
            </p>
          </div>
        </div>

        {/* TOMBOL REFRESH (HANYA MUNCUL DI DESKTOP) */}
        <Button
          onClick={fetchDashboardData}
          disabled={isLoading}
          variant="outline"
          className="hidden md:flex w-fit border-zinc-200 dark:border-zinc-800"
        >
          <RefreshCcw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Segarkan Data
        </Button>
      </div>

      {/* TOP CARDS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* CARD TOTAL SESI */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Sesi Obrolan
            </CardTitle>
            <Users className="h-4 w-4 text-mula" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {isLoading ? "..." : stats.totalSessions}
              </div>
              {!isLoading && (
                <span
                  className={`text-[10px] font-medium flex items-center ${stats.trends.sessions.color}`}
                >
                  {stats.trends.sessions.icon === "up" && (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.sessions.icon === "down" && (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.sessions.icon === "flat" && (
                    <Minus className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.sessions.text}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Jumlah pengguna terhubung
            </p>
          </CardContent>
        </Card>

        {/* CARD VOLUME PESAN */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Pesan
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-mula" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {isLoading ? "..." : stats.totalMessages}
              </div>
              {!isLoading && (
                <span
                  className={`text-[10px] font-medium flex items-center ${stats.trends.messages.color}`}
                >
                  {stats.trends.messages.icon === "up" && (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.messages.icon === "down" && (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.messages.icon === "flat" && (
                    <Minus className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.messages.text}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Pertukaran prompt & respons
            </p>
          </CardContent>
        </Card>

        {/* CARD BASIS PENGETAHUAN */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Basis Pengetahuan
            </CardTitle>
            <Database className="h-4 w-4 text-mula" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {isLoading ? "..." : stats.totalKnowledge}
              </div>
              {!isLoading && (
                <span
                  className={`text-[10px] font-medium flex items-center ${stats.trends.knowledge.color}`}
                >
                  {stats.trends.knowledge.icon === "up" && (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.knowledge.icon === "down" && (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.knowledge.icon === "flat" && (
                    <Minus className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.knowledge.text}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Dokumen tersimpan di database
            </p>
          </CardContent>
        </Card>

        {/* CARD ESKALASI */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Eskalasi Manual
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {isLoading ? "..." : stats.escalations}
              </div>
              {!isLoading && (
                <span
                  className={`text-[10px] font-medium flex items-center ${stats.trends.escalations.color}`}
                >
                  {stats.trends.escalations.icon === "up" && (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.escalations.icon === "down" && (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.escalations.icon === "flat" && (
                    <Minus className="h-3 w-3 mr-0.5" />
                  )}
                  {stats.trends.escalations.text}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Butuh bantuan admin manusia
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* CHART AREA */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-mula" />
              Tren Interaksi Harian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center text-zinc-500 text-sm">
                  Merender visualisasi data...
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-zinc-500 text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  Belum ada data interaksi untuk ditampilkan.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#52525b"
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#71717a" }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#71717a" }}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderRadius: "8px",
                        border: "none",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#bae6fd" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Pesan"
                      stroke="#0284c7"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* STATUS CARD */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-mula" />
              Status Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 mt-4">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Interaksi Terakhir Terkumpul
              </p>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {isLoading ? "..." : stats.lastActive}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                Koneksi Database
              </p>
              {isLoading ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-md w-fit border border-yellow-200 dark:border-yellow-900/50">
                  <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-[11px] font-bold tracking-wider uppercase">
                    Menghubungkan...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-md w-fit border border-emerald-200 dark:border-emerald-900/50 transition-all duration-500">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase">
                    Online
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
