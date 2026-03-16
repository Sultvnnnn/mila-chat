import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// init openai & supabase
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    const {
      title,
      category,
      content,
      status,
      targetTable = "knowledge_entries",
    } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 },
      );
    }

    // generate embedding using OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: `Title: ${title}\nContent: ${content}`,
      encoding_format: "float",
    });

    const embedding = embeddingResponse.data[0].embedding;

    const payload: any = {
      title,
      category: category || "General",
      content,
      embedding,
    };

    if (targetTable === "knowledge_entries" && status) {
      payload.status = status;
    }

    const { data, error } = await supabase
      .from(targetTable)
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`Error in knowledge UPDATE API: ${error}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
