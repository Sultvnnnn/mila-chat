import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

//! init supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender, pushName, messages } = body;

    //? ID unique untuk whatsapp biar connect ke dashboard
    const chatId = `wa-${sender}`;
    console.log(
      `\n[API SYSTEM] Processing incoming WhatsApp request for chat ID: ${chatId}`,
    );

    const lastMessageObj = messages[messages.length - 1];
    const lastUserMessage = lastMessageObj?.content || "";

    //! SHORTCUT /h
    if (lastUserMessage.trim().toLowerCase() === "/h") {
      console.log(
        `[ESCALATION] User ${sender} requested manual escalation via /h`,
      );

      //? save history percakapan biar "/h" terekam di DB
      await supabase.from("conversations").upsert(
        {
          id: chatId,
          channel: "whatsapp",
          messages: messages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      //? langsung tembak tiket ke Supabase
      const { error: insertError } = await supabase.from("escalations").insert({
        conversation_id: chatId,
        reason: `[Nama WA: ${pushName || "Unknown"}] Pengguna meminta bantuan admin secara manual via /h`,
        status: "pending",
      });

      if (insertError) {
        console.error(
          "[API ERROR] Failed to create escalation ticket:",
          insertError,
        );
      }

      //? return balasan langsung di chat berikutnya bot otomatis mute karena tiket sudah 'pending'.
      return NextResponse.json({
        reply:
          "Baik Kak, Mila akan segera menyambungkan Kakak dengan tim admin kami. Mohon ditunggu sebentar ya.",
      });
    }

    //? cek apakah lagi dihandle oleh admin
    const { data: activeEscalation, error: checkError } = await supabase
      .from("escalations")
      .select("id, status")
      .eq("conversation_id", chatId)
      .eq("status", "pending")
      .maybeSingle();

    if (checkError) {
      console.error(
        "[API ERROR] Failed to check active escalation status:",
        checkError,
      );
    }

    if (activeEscalation) {
      console.log(
        `[API SYSTEM] Chat ${chatId} is currently locked for human staff. MILA is muted.`,
      );

      // Opsional: Tetap simpan chat user ke database biar riwayatnya masuk di bubble chat dashboard
      await supabase.from("conversations").upsert(
        {
          id: chatId,
          channel: "whatsapp",
          messages: messages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      // sinyal ke Baileys untuk diam
      return NextResponse.json({ handledByAdmin: true });
    }

    const [
      { data: aiSettings, error: personaError },
      { data: kbIndo, error: kbIndoError },
      { data: kbEnglish, error: kbEnError },
    ] = await Promise.all([
      supabase.from("ai_settings").select("*").eq("id", 1).single(),
      supabase
        .from("knowledge_entries")
        .select("title, content")
        .eq("status", "active"),
      supabase.from("documents_en").select("title, content"),
    ]);

    if (personaError)
      console.error(
        "[API ERROR] Failed to fetch persona settings:",
        personaError,
      );
    if (kbIndoError)
      console.error(
        "[API ERROR] Failed to fetch Indonesian knowledge entries:",
        kbIndoError,
      );
    if (kbEnError)
      console.error(
        "[API ERROR] Failed to fetch English documents:",
        kbEnError,
      );

    const personaID = aiSettings
      ? `${aiSettings.role_id || ""}\n${aiSettings.rules_id || ""}\n${aiSettings.guardrails_id || ""}\n${aiSettings.reschedule_id || ""}\n${aiSettings.style_id || ""}`
      : "";

    let dataID = "=== DATA REFERENSI (INDONESIA) ===\n";
    if (kbIndo && kbIndo.length > 0) {
      dataID += kbIndo.map((k) => `[${k.title}]\n${k.content}`).join("\n\n");
    }

    const personaEN = aiSettings
      ? `${aiSettings.role_en || ""}\n${aiSettings.rules_en || ""}\n${aiSettings.guardrails_en || ""}\n${aiSettings.reschedule_en || ""}\n${aiSettings.style_en || ""}`
      : "";

    let dataEN = "=== REFERENCE DATA (ENGLISH) ===\n";
    if (kbEnglish && kbEnglish.length > 0) {
      dataEN += kbEnglish.map((k) => `[${k.title}]\n${k.content}`).join("\n\n");
    }

    //! PROMPT ENGINEERING
    const systemPrompt = `You are a highly capable bilingual AI assistant for MULA Yoga Studio named MILA.
    Analyze the language used by the user in the conversation history and adapt your response accordingly.

    <IF_USER_SPEAKS_INDONESIAN>
    Strictly apply this persona and rules:
    ${personaID}

    Strictly use this knowledge base to answer:
    ${dataID}
    </IF_USER_SPEAKS_INDONESIAN>

    <IF_USER_SPEAKS_ENGLISH>
    Strictly apply this persona and rules:
    ${personaEN}

    Strictly use this knowledge base to answer:
    ${dataEN}
    </IF_USER_SPEAKS_ENGLISH>

    CRITICAL INSTRUCTION: Never mix the languages. If the user speaks English, answer entirely in English using the English rules. If Indonesian, answer entirely in Indonesian using the Indonesian rules.

    ATURAN KENDALA & KESEHATAN (SANGAT PENTING)
    Jika terjadi salah satu dari 3 kondisi ini:
    1. Pengguna menanyakan hal di luar konteks bisnis / pengetahuanmu.
    2. Informasi yang dicari TIDAK ADA di dalam database (Supabase/Knowledge Base).
    3. Pengguna mengeluhkan rasa sakit fisik, cedera, kram, atau kendala medis lainnya (terutama saat/setelah mengikuti kelas yoga).

    MAKA, KAMU WAJIB MENJAWAB DENGAN SANGAT SINGKAT, PADAT, DAN JELAS. Jangan bertele-tele dan DILARANG menambahkan kalimat penutup apapun.
    Gunakan format ini persis (tanpa format tebal/bintang):
    "Mila turut prihatin Kak. Untuk keluhan ini, mari konsultasikan langsung dengan staff kami. Silakan balas dengan mengetik /h ya!"

    ESCALATION RULE (Kata Kunci AI):
    If the user explicitly asks to speak to a human, admin, or staff directly without using "/h", OR if you cannot resolve their issue, you MUST append this exact tag at the very end of your response: [ESCALATE]
    Example response: "Baik Kak, Mila akan sambungkan dengan staff kami ya. Mohon ditunggu sebentar. [ESCALATE]"`;

    //? Sanitasi Data (Menghapus properti asing seperti isAdmin sebelum masuk ke Anthropic)
    const sanitizedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: sanitizedMessages,
    });

    // @ts-ignore
    let replyMessage = response.content[0].text;

    //? DETEKSI & EKSEKUSI ESKALASI VIA AI (Kata kunci manual)
    if (replyMessage.includes("[ESCALATE]")) {
      // potong tag rahasia agar ga terbaca oleh user di WhatsApp
      replyMessage = replyMessage.replace("[ESCALATE]", "").trim();
      console.log(
        `[API SYSTEM] Escalation triggered by AI for chat ID: ${chatId}`,
      );

      const finalMessages = [
        ...messages,
        { id: crypto.randomUUID(), role: "assistant", content: replyMessage },
      ];

      // save riwayat chat utuh ke tabel conversations
      await supabase.from("conversations").upsert(
        {
          id: chatId,
          channel: "whatsapp",
          messages: finalMessages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      // otomatis buat baris tiket baru di tabel escalations agar langsung muncul di halaman Dashboard
      const { error: insertError } = await supabase.from("escalations").insert({
        conversation_id: chatId,
        reason: `[Nama WA: ${pushName || "Unknown"}] User di-eskalasi otomatis oleh MILA.`,
        status: "pending",
      });

      if (insertError) {
        console.error(
          "[API ERROR] Failed to insert new escalation ticket:",
          insertError.message,
        );
      }
    } else {
      // save histori chat biasa tanpa membuat tiket baru
      const finalMessages = [
        ...messages,
        { id: crypto.randomUUID(), role: "assistant", content: replyMessage },
      ];
      await supabase.from("conversations").upsert(
        {
          id: chatId,
          channel: "whatsapp",
          messages: finalMessages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    }

    console.log(
      `[API SYSTEM] Successfully generated response for chat ID ${sender}`,
    );
    return NextResponse.json({ reply: replyMessage });
  } catch (error) {
    console.error(
      "\n[API ERROR] Failed to process request or communicate with MILA.",
      error,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
