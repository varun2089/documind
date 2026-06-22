import { generateEmbedding } from "../ingestion/generateEmbedding";
import { searchStore, VectorEntry, SearchResult } from "../ingestion/vectorStore";

export const searchDocumentsToolDefinition = {
  name: "search_documents",
  description:
    "Searches the indexed document store for relevant chunks given a query. Returns the top matching text chunks ranked by semantic similarity.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "The search query to find relevant document chunks.",
      },
      top_k: {
        type: "number",
        description:
          "The number of top results to return. Defaults to 5.",
      },
    },
    required: ["query"],
  },
};

export async function executeSearchDocuments(
  store: VectorEntry[],
  input: { query: string; top_k?: number }
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(input.query);
  return searchStore(store, queryEmbedding, input.top_k ?? 5);
}
