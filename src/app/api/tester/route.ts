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
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 },
      );
    }

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    });
    const query_embedding = embeddingResponse.data[0].embedding;

    const { data, error } = await supabase.rpc("hybrid_search", {
      query_embedding: query_embedding,
      query_text: query,
      match_count: 5,
    });

    if (error) throw error;

    return NextResponse.json({ results: data });
  } catch (error: any) {
    console.error(`Search error: ${error.message}`);
    return NextResponse.json(
      { error: error.message || "An error occurred during search." },
      { status: 500 },
    );
  }
}
