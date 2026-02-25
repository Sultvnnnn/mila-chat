import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/openai";
import buildSystemPrompt from "@/lib/prompts/systemPrompt";
import Anthropic from "@anthropic-ai/sdk";

//? INIT
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    const query = `${message}`;
    const embedding = await generateEmbedding(query);

    // hybrid search
    const { data: documents, error } = await supabase.rpc("hybrid_search", {
      query_embedding: embedding,
      query_text: query,
      match_count: 6,
    });

    if (error) {
      console.error("Error Supabase:", error);
      throw error;
    }

    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
      hour12: false,
    };

    const timeString = now.toLocaleString("id-ID", options);
    const hariIni = now.toLocaleDateString("id-ID", {
      weekday: "long",
      timeZone: "Asia/Jakarta",
    });

    const contextText = documents
      ?.map((doc: any) => `SUMBER: ${doc.title}\nISI: ${doc.content}`)
      .join("\n\n");

    const system = buildSystemPrompt(hariIni, timeString, contextText || "");

    // claude's response
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: message }],
    });

    // @ts-ignore
    const firstBlock = response.content[0];
    let replyText =
      firstBlock?.type === "text"
        ? firstBlock.text
        : "Maaf, Mila sedang mediasi sebentar. Coba tanya lagi ya Ka? 🙏";

    replyText = replyText
      .replace(/\[(IF|JIKA|DETECT|START|END|USER).*?\]/gi, "")
      .trim();

    replyText = replyText.replace(/^\n+/, "");

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error(`Chat error: ${error}`);
    return NextResponse.json(
      { error: "Gagal memproses chat" },
      { status: 500 },
    );
  }
}
