import { parseDocument } from "./ingestion/parseDocument";
import { chunkText } from "./ingestion/chunkText";
import { generateEmbedding, generateEmbeddings } from "./ingestion/generateEmbedding";
import { createVectorStore, addToStore, searchStore } from "./ingestion/vectorStore";

async function main() {
  const text = await parseDocument("./sample.pdf");
  const chunks = chunkText(text);
  const store = createVectorStore();

  console.log(`Parsed ${chunks.length} chunks. Generating embeddings...`);

  const embeddings = await generateEmbeddings(chunks);
  for (let i = 0; i < chunks.length; i++) {
    addToStore(store, String(i), chunks[i], embeddings[i]);
  }
  console.log(`Stored ${chunks.length} embeddings.`);

  const query = "what happens if I pay my invoice late";
  console.log(`\nQuery: "${query}"\n`);

  const queryEmbedding = await generateEmbedding(query);
  const results = searchStore(store, queryEmbedding, 2);

  for (const result of results) {
    console.log(`--- Result (id=${result.id}, score=${result.score.toFixed(4)}) ---`);
    console.log(result.text);
    console.log();
  }
}

main();
