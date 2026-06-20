import { parseDocument } from "./ingestion/parseDocument";
import { chunkText } from "./ingestion/chunkText";
import { generateEmbeddings } from "./ingestion/generateEmbedding";
import { createVectorStore, addToStore } from "./ingestion/vectorStore";
import { runCoordinator } from "./agents/coordinatorAgent";

async function main() {
  const text = await parseDocument("./sample.pdf");
  const chunks = chunkText(text);
  const embeddings = await generateEmbeddings(chunks);

  const store = createVectorStore();
  for (let i = 0; i < chunks.length; i++) {
    addToStore(store, `chunk-${i}`, chunks[i], embeddings[i]);
  }

  console.log(`Indexed ${chunks.length} chunks. Asking question...\n`);

  const answer = await runCoordinator(
    "what happens if I pay my invoice late",
    store
  );

  console.log("Answer:", answer);
}

main();
