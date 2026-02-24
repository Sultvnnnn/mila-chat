import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/openai";
import Anthropic from "@anthropic-ai/sdk";

//? INIT
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

//? MAIN FUNCTION
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    const embedding = await generateEmbedding(message);

    // hybrid search
    const { data: documents, error } = await supabase.rpc("hybrid_search", {
      query_embedding: embedding,
      query_text: message,
      match_count: 3, // ambil 3 data yg relevan
    });

    if (error) throw error;

    const safeDocs = documents || [];
    const contextText = safeDocs
      .map((doc: any) => `Info: ${doc.title}\nDetail: ${doc.content}`)
      .join("\n\n");

    const hariIni = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // claude's response
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      system: `Kamu adalah Mila, asisten virtual untuk MULA Yoga Studio. Gaya komunikasi kamu harus mengayomi (nurturing), profesional, dan ramah (friendly).
      Hari ini adalah: ${hariIni}.

      Gunakan HANYA informasi berikut untuk menjawab pertanyaan:

      <contekan>
      ${contextText}
      </contekan>

      Aturan membalas pelanggan:
      1. Buka percakapan dengan "Halo ka" atau "Hi Ka". Jika pelanggan mengucapkan Assalamualaikum, balas dengan "Walaikumsalam". Lanjutkan dengan "Ada yang bisa dibantu?".
      2. Jika ditanya tentang jadwal "hari ini", "besok", atau "lusa", hitung harinya berdasarkan tanggal hari ini dan cari jadwal yang sesuai di <contekan>.
      3. Jika ditanya tentang medis, penyakit, atau kesehatan mental, tolak dengan halus dan penuh empati, lalu arahkan ke staf manusia kami.
      4. Jawab dengan bahasa Indonesia yang natural, hangat, sopan, dan tidak kaku, selayaknya seorang profesional yang peduli pada pelanggannya.
      5. Jika jawaban tidak ada di <contekan>, mohon maaf dengan sopan, sampaikan bahwa kamu belum memiliki informasi tersebut, dan tawarkan bantuan dari staf manusia.`,
      messages: [{ role: "user", content: message }],
    });

    // return response
    // @ts-ignore
    const firstBlock = response.content[0];
    const replyText =
      firstBlock?.type === "text"
        ? firstBlock.text
        : "Maaf, AI gagal merangkai kata.";

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error(`Chat error: ${error}`);
    return NextResponse.json(
      { error: "Gagal memproses chat" },
      { status: 500 },
    );
  }
}
