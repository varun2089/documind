# Documind

## Project Overview

Documind is a multi-agent document intelligence assistant built with the Claude API, RAG (Retrieval-Augmented Generation), and agentic tool use. It ingests PDF and DOCX files, chunks and embeds their content using Voyage AI, stores vectors in an in-memory store, and answers questions via a coordinator agent that selects and executes tools in an agentic loop.

## Project Structure

This is an npm workspaces monorepo with two packages:

- `api/` — Express backend (RAG pipeline, agents, tools)
- `frontend/` — React + Vite + Tailwind chat UI

Each workspace has its own `package.json` and `tsconfig.json`. Dependencies are installed from the root via `npm install`, which hoists shared packages.

### Ingestion Pipeline (`api/ingestion/`)

- `parseDocument.ts` — Extracts raw text from `.pdf` (via pdf-parse) and `.docx` (via mammoth) files.
- `chunkText.ts` — Splits text into overlapping chunks (default 1000 chars, 200 overlap).
- `generateEmbedding.ts` — Produces embeddings via Voyage AI (`voyage-4-lite`). Includes retry-with-backoff logic for rate limit errors (HTTP 429): up to `MAX_RETRIES = 2` attempts with a fixed 10-second delay between retries.
- `vectorStore.ts` — In-memory vector store with cosine similarity search. Exports `VectorEntry` and `SearchResult` type aliases.

### Agents (`api/agents/`)

- `coordinatorAgent.ts` — The main orchestrator. Routes between `search_documents` and `extract_data` based on user intent. Sends the user query to Claude with tool definitions, executes all `tool_use` blocks in the response, and loops (up to 5 rounds) until the model produces a final text answer. Enforces JSON-only output (no markdown, no commentary) when the user explicitly requests structured/JSON output.

#### Source Citation System

The coordinator's system prompt instructs Claude to append a `SOURCES: file1.pdf, file2.pdf` line at the end of any response that draws on ingested document content. A `parseSources()` helper extracts this line into a separate `sources: string[]` array and strips it from the answer text before it reaches the client, so citations never appear inline in the displayed message.

### Tools (`api/tools/`)

- `searchDocumentsTool.ts` — Embeds the query and runs cosine similarity search against the vector store. Returns top-k matching chunks.
- `extractDataTool.ts` — Uses Claude to extract structured JSON from text according to a caller-provided JSON schema.

### Server (`api/server.ts`)

An Express server (with CORS enabled) exposing two endpoints:

- `POST /ingest` — Accepts multipart form-data with a `files` field (multiple files, handled by multer). Processes each uploaded file individually through the full parse → chunk → embed → store pipeline, with per-file error handling so one failure does not abort the rest. Returns `{ success: true, results: [{ fileName, chunksAdded?, error? }] }`.
- `POST /chat` — Accepts `{ question: string }`. Runs the coordinator agent against the current vector store and returns `{ answer: string, sources: string[] }`.

The vector store is in-memory only and does not persist across server restarts. `server.ts` also registers process-level `unhandledRejection` and `uncaughtException` handlers so crashes are logged rather than failing silently.

### Frontend (`frontend/`)

React + TypeScript + Tailwind v4 chat interface built with Vite. Components use arrow function syntax and `lucide-react` for icons.

- `App.tsx` — Main layout (header, sidebar, chat area)
- `components/Sidebar.tsx` — Document list with multi-file upload via a hidden `<input type="file" multiple>`, posts to `/ingest` as multipart form-data
- `components/ChatArea.tsx` — Scrollable message thread
- `components/ChatMessage.tsx` — Individual message card with source citation tags; renders answer text via `react-markdown` + `remark-gfm` (supports tables, bold, lists, etc.)
- `components/ChatInput.tsx` — Text input with send button
- `components/ThinkingIndicator.tsx` — Animated loading state; shown when a message has `isThinking: true`

## Development Commands

```bash
# Install all dependencies (from root)
npm install

# Start the API server
npm run dev --workspace=api

# Start the frontend dev server
npm run dev --workspace=frontend

# Run test scripts
npx tsx api/scripts/test-coordinator.ts
npx tsx api/scripts/test-extract.ts

# Example: ingest one or more documents (multipart form-data)
curl -X POST http://localhost:3001/ingest \
  -F "files=@./sample.pdf" \
  -F "files=@./contract.docx"
# Response: { "success": true, "results": [{ "fileName": "sample.pdf", "chunksAdded": 12 }, ...] }

# Example: ask a question
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the payment terms?"}'
# Response: { "answer": "...", "sources": ["contract.docx"] }
```

## Code Standards

- All new tools must export a tool definition object with a clear `description` and `input_schema`, plus an `execute*` function.
- Always handle all `tool_use` blocks in a response, not just the first one.
- Never commit `.env` — it is in `.gitignore`.
- This project does not use classes or interfaces. Prefer plain functions and type aliases.
- Frontend components use arrow function syntax with separate `export default` statements.
- Frontend uses `lucide-react` for icons — do not write inline SVGs.
- `server.ts` must include process-level `unhandledRejection` and `uncaughtException` handlers so all crashes are logged rather than failing silently.
