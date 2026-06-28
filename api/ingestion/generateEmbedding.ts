import { VoyageAIClient } from "voyageai";

let client: VoyageAIClient;
function getClient() {
  if (!client) client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
  return client;
}

const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [10_000, 10_000];

function isRateLimitError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes("429") || msg.includes("rate limit") || msg.includes("rate_limit")) {
      return true;
    }
  }
  if (typeof err === "object" && err !== null && "statusCode" in err) {
    return (err as { statusCode: number }).statusCode === 429;
  }
  return false;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt < MAX_RETRIES && isRateLimitError(err)) {
        const delay = RETRY_DELAYS_MS[attempt];
        console.log(`Rate limited by Voyage AI, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await withRetry(() =>
    getClient().embed({
      input: text,
      model: "voyage-4-lite",
    })
  );

  return response.data![0].embedding!;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await withRetry(() =>
    getClient().embed({
      input: texts,
      model: "voyage-4-lite",
    })
  );

  return response.data!.map((d) => d.embedding!);
}
