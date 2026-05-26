import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { conversationId, messageContent } = await req.json();

    if (!conversationId || !messageContent) {
      console.error(
        "[ADMIN API ERROR] Missing required fields: conversationId or messageContent.",
      );
      return NextResponse.json(
        { success: false, error: "Missing fields." },
        { status: 400 },
      );
    }

    //! Fetch existing messages from the database
    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("messages")
      .eq("id", conversationId)
      .single();

    if (fetchError || !conversation) {
      console.error(
        `[ADMIN API ERROR] Conversation not found for ID: ${conversationId}`,
      );
      return NextResponse.json(
        { success: false, error: "Conversation not found." },
        { status: 404 },
      );
    }

    //! Create the admin message payload
    const adminMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: messageContent,
      timestamp: new Date().toISOString(),
      isAdmin: true,
    };

    const currentMessages = Array.isArray(conversation.messages)
      ? conversation.messages
      : [];

    const updatedMessages = [...currentMessages, adminMessage];

    //! Update the database (This triggers the Supabase Realtime in Baileys!)
    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (updateError) {
      throw updateError;
    }

    console.log(
      `[ADMIN API SYSTEM] Successfully saved admin reply for chat ID: ${conversationId}`,
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "\n[ADMIN API CRITICAL ERROR] Failed to process admin reply:",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
