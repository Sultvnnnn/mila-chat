import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/openai";
import { getSystemPrompt } from "@/lib/prompts/systemPrompt";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

// LANGUAGE DETECTOR
const isEnglishLanguage = (text: string): boolean => {
  const englishPattern =
    /\b(the|is|are|am|what|where|when|why|how|can|could|would|should|i|you|my|your|help|schedule|price|cost|class)\b/i;
  return englishPattern.test(text);
};

// ESCALATION: KEYWORD FAST-PATH
const ESCALATION_KEYWORDS_ID = [
  "bicara dengan manusia",
  "hubungi admin",
  "minta staff",
  "minta tolong manusia",
  "sambungkan ke staff",
  "sambungkan ke manusia",
  "hubungi cs",
  "customer service",
  "mau ngobrol sama manusia",
  "mau bicara sama orang",
  "minta bantuan staff",
  "operator",
];

const ESCALATION_KEYWORDS_EN = [
  "speak to human",
  "talk to agent",
  "connect me to staff",
  "talk to a real person",
  "speak with someone",
  "human agent",
  "live agent",
  "customer service",
  "real person",
  "connect to human",
];

function hasEscalationKeyword(message: string, isEnglish: boolean): boolean {
  const lower = message.toLowerCase();
  const keywords = isEnglish ? ESCALATION_KEYWORDS_EN : ESCALATION_KEYWORDS_ID;
  return keywords.some((kw) => lower.includes(kw));
}

// ESCALATION: AI CLASSIFIER (FALLBACK)
async function checkEscalationWithAI(message: string): Promise<boolean> {
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 5,
      system: `You are a binary intent classifier. Reply ONLY with "YES" or "NO".
Does this message indicate the user wants to speak with a human staff/agent/admin instead of an AI chatbot?`,
      messages: [{ role: "user", content: message }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return text.trim().toUpperCase().startsWith("YES");
  } catch (err) {
    console.error("Escalation classifier error:", err);
    return false;
  }
}

// ESCALATION: HYBRID CHECKER
async function isEscalationRequest(
  message: string,
  isEnglish: boolean,
): Promise<boolean> {
  if (hasEscalationKeyword(message, isEnglish)) return true;
  return await checkEscalationWithAI(message);
}

// MAIN POST HANDLER
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

    // CEK ESKALASI
    const escalation = await isEscalationRequest(query, isEnglish);

    if (escalation) {
      const escalationMsg = isEnglish
        ? "Of course! I'll connect you with our team right away. Please wait a moment — our staff will reach out to you shortly. 🙏"
        : "Baik Ka! Mila sambungkan ke tim kami ya. Mohon tunggu sebentar, staff kami akan segera menghubungi Kakak. 🙏";

      // Upsert conversation dulu supaya ada foreign key-nya
      const finalMessages = [
        ...messages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: escalationMsg,
        },
      ];

      await supabase.from("conversations").upsert(
        {
          id: chatId,
          channel: "web",
          messages: finalMessages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      // Baru insert escalation (setelah conversation ada)
      const { error: escError } = await supabase.from("escalations").insert({
        conversation_id: chatId,
        reason: query,
        status: "pending",
      });

      if (escError) {
        console.error("Failed to insert escalation:", escError.message);
      }

      // Return stream response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(`0:${JSON.stringify(escalationMsg)}\n`),
          );
          controller.enqueue(
            encoder.encode(
              `d:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 } })}\n`,
            ),
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "x-vercel-ai-data-stream": "v1",
        },
      });
    }
    // ──────────────────────────────────────────────────────────────────────────

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
            "Database Error: Failed to save conversation history to Supabase.",
            dbError,
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
