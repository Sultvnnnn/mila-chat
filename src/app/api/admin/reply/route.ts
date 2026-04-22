import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { conversationId, messageContent } = await req.json();

    if (!conversationId || !messageContent) {
      return Response.json(
        { success: false, error: "Missing fields." },
        { status: 400 },
      );
    }

    // Ambil pesan yang ada
    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("messages")
      .eq("id", conversationId)
      .single();

    if (fetchError || !conversation) {
      return Response.json(
        { success: false, error: "Conversation not found." },
        { status: 404 },
      );
    }

    // Buat pesan admin
    const adminMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: messageContent,
      createdAt: new Date().toISOString(),
      isAdmin: true,
    };

    const currentMessages = Array.isArray(conversation.messages)
      ? conversation.messages
      : [];

    const updatedMessages = [...currentMessages, adminMessage];

    // Update ke DB — trigger Supabase Realtime ke client
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

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error sending admin reply:", error);
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
