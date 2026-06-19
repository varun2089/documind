import { parseDocument } from "./ingestion/parseDocument";
import { chunkText } from "./ingestion/chunkText";

async function main() {
  const text = await parseDocument("./sample.pdf");
  const chunks = chunkText(text);

  console.log(`Total chunks: ${chunks.length}\n`);

  console.log("=== Chunk 1 ===");
  console.log(chunks[0]);
  console.log("\n=== Chunk 2 ===");
  console.log(chunks[1]);
}

main();
