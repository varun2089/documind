import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generateAnswer(question: string, contextChunks: string[]): Promise<string> {
  const context = contextChunks.join("\n\n---\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `Answer the user's question based only on the provided context. If the answer is not contained in the context, say "I don't have enough information in the provided documents to answer that."`,
    messages: [
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type === "text") {
    return block.text;
  }
  return "";
}
