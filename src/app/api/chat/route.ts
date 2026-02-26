import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/openai";
import buildSystemPrompt from "@/lib/prompts/systemPrompt";
import Anthropic from "@anthropic-ai/sdk";

//? INIT
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

//? LANGUAGE DETECTOR
const isEnglishLanguage = (text: string): boolean => {
  const englishPattern =
    /\b(the|is|are|am|what|where|when|why|how|can|could|would|should|i|you|my|your|help|schedule|price|cost|class)\b/i;
  return englishPattern.test(text);
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    // detect language
    const isEnglish = isEnglishLanguage(message);
    const langCode = isEnglish ? "EN" : "ID";

    // generate embedding
    const query = `${message}`;
    const embedding = await generateEmbedding(query);

    // hybrid search
    let documents;
    let searchError;

    if (isEnglish) {
      const { data, error } = await supabase.rpc("match_documents_en", {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 6,
      });
      documents = data;
      searchError = error;
    } else {
      const { data, error } = await supabase.rpc("hybrid_search", {
        query_embedding: embedding,
        query_text: query,
        match_count: 6,
      });
      documents = data;
      searchError = error;
    }

    if (searchError) {
      console.error(`Error Supabase: ${JSON.stringify(searchError)}`);
      throw searchError;
    }

    const now = new Date();
    const locale = isEnglish ? "en-US" : "id-ID";
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

    const timeString = now.toLocaleString(locale, options);
    const hariIni = now.toLocaleDateString(locale, {
      weekday: "long",
      timeZone: "Asia/Jakarta",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contextText = documents
      ?.map((doc: { content: string }) => `INFO: ${doc.content}`)
      .join("\n\n");

    const system = buildSystemPrompt(
      langCode,
      hariIni,
      timeString,
      contextText || "",
    );

    // claude's response
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: message }],
    });

    const firstBlock = response.content[0];
    let replyText =
      firstBlock?.type === "text"
        ? firstBlock.text
        : "Maaf, Mila sedang mediasi sebentar. Coba tanya lagi ya Ka? 🙏";

    replyText = replyText
      .replace(/\[(IF|JIKA|DETECT|START|END|USER).*?\]/gi, "")
      .trim()
      .replace(/^\n+/, "");

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error(`Chat error: ${error}`);
    return NextResponse.json(
      { error: "Gagal memproses chat" },
      { status: 500 },
    );
  }
}
