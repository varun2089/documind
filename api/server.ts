import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

import fs from "fs";
import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import { createVectorStore, addToStore, VectorEntry } from "./ingestion/vectorStore";
import { parseDocument } from "./ingestion/parseDocument";
import { chunkText } from "./ingestion/chunkText";
import { generateEmbeddings } from "./ingestion/generateEmbedding";
import { runCoordinator } from "./agents/coordinatorAgent";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const store: VectorEntry[] = createVectorStore();

app.post("/ingest", upload.array("files", 10), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  const results: { fileName: string; chunksAdded?: number; error?: string }[] = [];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    const tempPath = `${file.path}${ext}`;
    fs.renameSync(file.path, tempPath);

    try {
      const text = await parseDocument(tempPath);
      const chunks = chunkText(text);
      const embeddings = await generateEmbeddings(chunks);

      const fileName = file.originalname;
      for (let i = 0; i < chunks.length; i++) {
        const id = `${fileName}:chunk-${i}`;
        addToStore(store, id, chunks[i], embeddings[i]);
      }

      results.push({ fileName, chunksAdded: chunks.length });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({ fileName: file.originalname, error: message });
    } finally {
      fs.unlink(tempPath, () => {});
    }
  }

  res.json({ success: true, results });
});

app.post("/chat", async (req: Request, res: Response) => {
  try {
    const { question } = req.body as { question: string };
    const { answer, sources } = await runCoordinator(question, store);
    res.json({ answer, sources });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.listen(3001, () => {
  console.log("Documind server listening on http://localhost:3001");
});
