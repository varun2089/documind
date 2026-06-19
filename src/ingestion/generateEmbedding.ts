import "dotenv/config";
import { VoyageAIClient } from "voyageai";

const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await client.embed({
    input: text,
    model: "voyage-4-lite",
  });

  return response.data![0].embedding!;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await client.embed({
    input: texts,
    model: "voyage-4-lite",
  });

  return response.data!.map((d) => d.embedding!);
}
