import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { createVectorStore, addToStore, VectorEntry } from "./ingestion/vectorStore";
import { parseDocument } from "./ingestion/parseDocument";
import { chunkText } from "./ingestion/chunkText";
import { generateEmbeddings } from "./ingestion/generateEmbedding";
import { runCoordinator } from "./agents/coordinatorAgent";

const app = express();
app.use(cors());
app.use(express.json());

const store: VectorEntry[] = createVectorStore();

app.post("/ingest", async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body as { filePath: string };
    const text = await parseDocument(filePath);
    const chunks = chunkText(text);
    const embeddings = await generateEmbeddings(chunks);

    for (let i = 0; i < chunks.length; i++) {
      const id = `${filePath}:chunk-${i}`;
      addToStore(store, id, chunks[i], embeddings[i]);
    }

    res.json({ success: true, chunksAdded: chunks.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.post("/chat", async (req: Request, res: Response) => {
  try {
    const { question } = req.body as { question: string };
    const answer = await runCoordinator(question, store);
    res.json({ answer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.listen(3001, () => {
  console.log("Documind server listening on http://localhost:3001");
});
