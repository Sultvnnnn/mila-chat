import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/openai";
import { getSystemPrompt } from "@/lib/prompts/systemPrompt";
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
    const body = await req.json();
    const { messages, id: conversationId } = body;

    const chatId = conversationId || crypto.randomUUID();

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
    const langCode = isEnglish ? "en" : "id";

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
      console.error(`Supabase Search Error: ${JSON.stringify(searchError)}`);
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

    const systemPrompt = await getSystemPrompt(
      langCode,
      hariIni,
      timeString,
      contextText || "",
    );

    const result = streamText({
      model: anthropic("claude-3-haiku-20240307"),
      system: systemPrompt,
      messages: coreMessages,
      async onFinish({ text }) {
        const finalMessage = [
          ...messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: text,
          },
        ];

        const { error: dbError } = await supabase.from("conversations").upsert(
          {
            id: chatId,
            channel: "web",
            messages: finalMessage,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

        if (dbError) {
          console.error(
            `Database Error: Failed to save conversation history to Supabase. Details: ${JSON.stringify(dbError)}`,
          );
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(`Chat API error: ${error}`);
    return new Response(
      JSON.stringify({
        error: "Terjadi kesalahan sistem saat memproses chat.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
