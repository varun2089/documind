import { generateEmbedding } from "./ingestion/generateEmbedding";

async function main() {
  const embedding = await generateEmbedding("Late payments accrue interest at 1.5% per month");
  console.log(`Embedding length: ${embedding.length}`);
  console.log(`First 5 values: ${embedding.slice(0, 5)}`);
}

main();
