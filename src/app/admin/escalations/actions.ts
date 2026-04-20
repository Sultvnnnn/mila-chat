"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function sendAdminReply(
  conversationId: string,
  messageContent: string,
) {
  try {
    // ambil data conversation
    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("messages")
      .eq("id", conversationId)
      .single();

    if (fetchError || !conversation) {
      throw new Error("Failed to fetch conversation data.");
    }

    // pesan balasan admin
    const adminMessage = {
      id: crypto.randomUUID(),
      role: "assistant", // tetep assistant biar dirender sebagai balasan dari sistem
      content: messageContent,
      createdAt: new Date().toISOString(),
      isAdmin: true,
    };

    // merge pesan baru dengan pesan lama
    const currentMessages = Array.isArray(conversation.messages)
      ? conversation.messages
      : [];

    const updatedMessages = [...currentMessages, adminMessage];

    // update array messages di table conversations
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

    // refresh ui
    revalidatePath(`/admin/escalations`);

    return { success: true };
  } catch (error) {
    console.error(`Error sending admin reply: ${error}`);
    return { success: false, error: "Failed to send admin reply." };
  }
}
