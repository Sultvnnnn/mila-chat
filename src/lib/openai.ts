import OpenAI from "openai";

//? INIT
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//! MAIN FUNCTION: EMBEDDING
export async function generateEmbedding(text: string) {
  const cleanText = text.replace(/\n/g, " ").trim();

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cleanText,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error(`Error generating embedding: ${error}`);
    return null;
  }
}
