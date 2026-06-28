import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { parseDocument } from "../ingestion/parseDocument";
import { chunkText } from "../ingestion/chunkText";
import { generateEmbeddings } from "../ingestion/generateEmbedding";
import { createVectorStore, addToStore } from "../ingestion/vectorStore";
import { runCoordinator } from "../agents/coordinatorAgent";

async function main() {
  const text = await parseDocument("./sample.pdf");
  const chunks = chunkText(text);
  const embeddings = await generateEmbeddings(chunks);

  const store = createVectorStore();
  for (let i = 0; i < chunks.length; i++) {
    addToStore(store, `chunk-${i}`, chunks[i], embeddings[i]);
  }

  console.log(`Indexed ${chunks.length} chunks.\n`);

  console.log("=== Question 1 (search_documents) ===");
  const answer1 = await runCoordinator(
    "what happens if I pay my invoice late",
    store
  );
  console.log(answer1);

  console.log("\n=== Question 2 (extract_data) ===");
  const answer2 = await runCoordinator(
    'extract the vendor name and total monthly fee from this contract as JSON, using schema { vendor: string, total_amount: number }',
    store
  );
  console.log(answer2);
}

main();
