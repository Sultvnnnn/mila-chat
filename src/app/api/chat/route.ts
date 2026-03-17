import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/openai";
import buildSystemPrompt from "@/lib/prompts/systemPrompt";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const dynamic = "force-dynamic";

//? LANGUAGE DETECTOR
const isEnglishLanguage = (text: string): boolean => {
  const englishPattern =
    /\b(the|is|are|am|what|where|when|why|how|can|could|would|should|i|you|my|your|help|schedule|price|cost|class)\b/i;
  return englishPattern.test(text);
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const coreMessages = messages.map((msg: any) => ({
      role: msg.role,
      content:
        msg.content ||
        (msg.parts ? msg.parts.map((p: any) => p.text).join("") : ""),
    }));

    const lastMessage = coreMessages[coreMessages.length - 1];

    const query = lastMessage.content;

    // detect language
    const isEnglish = isEnglishLanguage(query);
    const langCode = isEnglish ? "EN" : "ID";

    // generate embedding
    const embedding = await generateEmbedding(query);

    // hybrid search
    let documents;
    let searchError;

    if (isEnglish) {
      const { data, error } = await supabase.rpc("hybrid_search_en", {
        query_embedding: embedding,
        query_text: query,
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

    const systemPrompt = buildSystemPrompt(
      langCode,
      hariIni,
      timeString,
      contextText || "",
    );

    const result = streamText({
      model: anthropic("claude-3-haiku-20240307"),
      system: systemPrompt,
      messages: coreMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(`Chat API error: ${error}`);
    return new Response(JSON.stringify({ error: "Gagal memproses chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
