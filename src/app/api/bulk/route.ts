import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  try {
    const { entries, targetTable = "knowledge_entries" } = await req.json();

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "Empty payload!" }, { status: 400 });
    }

    // format text for embedding
    const textsToEmbed = entries.map(
      (entry: any) => `Title: ${entry.title}\nContent: ${entry.content}`,
    );

    // batch create embeddings
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: textsToEmbed,
      encoding_format: "float",
    });

    // map embeddings back to payload
    const payload = entries.map((entry: any, index: number) => {
      const row: any = {
        title: entry.title,
        content: entry.content,
        category: entry.category || "General",
        embedding: embeddingResponse.data[index].embedding,
      };

      if (targetTable === "knowledge_entries") {
        row.status = "active";
      }

      return row;
    });

    // bulk insert to supabase
    const { data, error } = await supabase
      .from(targetTable)
      .insert(payload)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data.length,
      message: `${data.length} entries imported!`,
    });
  } catch (error: any) {
    console.error(`Bulk import error: ${error.message}`);
    return NextResponse.json(
      { error: error.message || "An error occurred during bulk import" },
      { status: 500 },
    );
  }
}
