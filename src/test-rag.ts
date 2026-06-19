import { parseDocument } from "./ingestion/parseDocument";
import { chunkText } from "./ingestion/chunkText";
import { generateEmbedding, generateEmbeddings } from "./ingestion/generateEmbedding";
import { createVectorStore, addToStore, searchStore } from "./ingestion/vectorStore";
import { generateAnswer } from "./generateAnswer";

async function main() {
  const text = await parseDocument("./sample.pdf");
  const chunks = chunkText(text);
  const store = createVectorStore();

  console.log(`Parsed ${chunks.length} chunks. Generating embeddings...`);
  const embeddings = await generateEmbeddings(chunks);
  for (let i = 0; i < chunks.length; i++) {
    addToStore(store, String(i), chunks[i], embeddings[i]);
  }
  console.log("Embeddings stored.\n");

  const question = "what happens if I pay my invoice late";
  console.log(`Question: "${question}"\n`);

  const queryEmbedding = await generateEmbedding(question);
  const results = searchStore(store, queryEmbedding, 2);

  console.log("Retrieved chunks:");
  for (const r of results) {
    console.log(`  - chunk ${r.id} (score: ${r.score.toFixed(4)})`);
  }
  console.log();

  const answer = await generateAnswer(question, results.map((r) => r.text));
  console.log("Answer:");
  console.log(answer);
}

main();
