export type VectorEntry = { id: string; text: string; embedding: number[] };
export type SearchResult = { id: string; text: string; score: number };

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}

export function createVectorStore(): VectorEntry[] {
  return [];
}

export function addToStore(store: VectorEntry[], id: string, text: string, embedding: number[]): void {
  store.push({ id, text, embedding });
}

export function searchStore(store: VectorEntry[], queryEmbedding: number[], topK: number = 5): SearchResult[] {
  return store
    .map((entry) => ({
      id: entry.id,
      text: entry.text,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
