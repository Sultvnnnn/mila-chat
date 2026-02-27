import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/openai";
import yogaData from "@/lib/data/yogaData";

export async function GET() {
  try {
    // looping data
    for (const item of yogaData) {
      // embedding
      const embedding = await generateEmbedding(
        `${item.title}\n${item.content}`,
      );

      // save to supabase
      const { error } = await supabase.from("knowledge_entries").insert({
        title: item.title,
        content: item.content,
        category: item.category,
        embedding: embedding,
      });

      if (error) {
        console.error(`Error insert: ${(error.message, error.details)}`);
      }
    }

    return NextResponse.json({
      message: "Data Yoga sukses dimasukkan ke Supabase!",
    });
  } catch (error) {
    console.error(`Error seeding data: ${error}`);
    return NextResponse.json({ error: "Gagal masukin data" }, { status: 500 });
  }
}
