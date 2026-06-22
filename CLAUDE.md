# Documind

## Project Overview

Documind is a multi-agent document intelligence assistant built with the Claude API, RAG (Retrieval-Augmented Generation), and agentic tool use. It ingests PDF and DOCX files, chunks and embeds their content using Voyage AI, stores vectors in an in-memory store, and answers questions via a coordinator agent that selects and executes tools in an agentic loop.

## Architecture

### Ingestion Pipeline (`api/ingestion/`)

- `parseDocument.ts` — Extracts raw text from `.pdf` (via pdf-parse) and `.docx` (via mammoth) files.
- `chunkText.ts` — Splits text into overlapping chunks (default 1000 chars, 200 overlap).
- `generateEmbedding.ts` — Produces embeddings via Voyage AI (`voyage-4-lite`).
- `vectorStore.ts` — In-memory vector store with cosine similarity search. Exports `VectorEntry` and `SearchResult` type aliases.

### Agents (`api/agents/`)

- `coordinatorAgent.ts` — The main orchestrator. Routes between `search_documents` and `extract_data` based on user intent. Sends the user query to Claude with tool definitions, executes all `tool_use` blocks in the response, and loops (up to 5 rounds) until the model produces a final text answer. Enforces JSON-only output (no markdown, no commentary) when the user explicitly requests structured/JSON output.

### Tools (`api/tools/`)

- `searchDocumentsTool.ts` — Embeds the query and runs cosine similarity search against the vector store. Returns top-k matching chunks.
- `extractDataTool.ts` — Uses Claude to extract structured JSON from text according to a caller-provided JSON schema.

### Server (`api/server.ts`)

An Express server (with CORS enabled) exposing two endpoints:

- `POST /ingest` — Accepts `{ filePath: string }`. Parses the document at that path, chunks it, generates embeddings, and adds all chunks to a shared in-memory vector store. Returns `{ success: true, chunksAdded: number }`.
- `POST /chat` — Accepts `{ question: string }`. Runs the coordinator agent against the current vector store and returns `{ answer: string }`.

The vector store is in-memory only and does not persist across server restarts.

## Development Commands

```bash
# Start the server
npx tsx api/server.ts

# Run test scripts (located in api/scripts/)
npx tsx api/scripts/test-coordinator.ts
npx tsx api/scripts/test-extract.ts

# Example: ingest a document
curl -X POST http://localhost:3001/ingest \
  -H "Content-Type: application/json" \
  -d '{"filePath": "./sample.pdf"}'

# Example: ask a question
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the payment terms?"}'
```

## Code Standards

- All new tools must export a tool definition object with a clear `description` and `input_schema`, plus an `execute*` function.
- Always handle all `tool_use` blocks in a response, not just the first one.
- Never commit `.env` — it is in `.gitignore`.
- This project does not use classes or interfaces. Prefer plain functions and type aliases.
