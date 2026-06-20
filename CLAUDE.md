# Documind

## Project Overview

Documind is a multi-agent document intelligence assistant built with the Claude API, RAG (Retrieval-Augmented Generation), and agentic tool use. It ingests PDF and DOCX files, chunks and embeds their content using Voyage AI, stores vectors in an in-memory store, and answers questions via a coordinator agent that selects and executes tools in an agentic loop.

## Architecture

### Ingestion Pipeline (`src/ingestion/`)

- `parseDocument.ts` — Extracts raw text from `.pdf` (via pdf-parse) and `.docx` (via mammoth) files.
- `chunkText.ts` — Splits text into overlapping chunks (default 1000 chars, 200 overlap).
- `generateEmbedding.ts` — Produces embeddings via Voyage AI (`voyage-4-lite`).
- `vectorStore.ts` — In-memory vector store with cosine similarity search. Exports `VectorEntry` and `SearchResult` type aliases.

### Agents (`src/agents/`)

- `coordinatorAgent.ts` — The main orchestrator. Sends the user query to Claude with tool definitions, executes all `tool_use` blocks in the response, and loops (up to 5 rounds) until the model produces a final text answer.

### Tools (`src/tools/`)

- `searchDocumentsTool.ts` — Embeds the query and runs cosine similarity search against the vector store. Returns top-k matching chunks.
- `extractDataTool.ts` — Uses Claude to extract structured JSON from text according to a caller-provided JSON schema.

### Other

- `generateAnswer.ts` — Standalone RAG answer generator (context + question → Claude response). Used before the coordinator agent was introduced.

## Development Commands

```bash
# Run any test/script file
npx tsx src/<file>.ts

# Example: run the coordinator agent test
npx tsx src/test-coordinator.ts

# Start the server (once implemented)
npx tsx src/server.ts
```

## Code Standards

- All new tools must export a tool definition object with a clear `description` and `input_schema`, plus an `execute*` function.
- Always handle all `tool_use` blocks in a response, not just the first one.
- Never commit `.env` — it is in `.gitignore`.
- This project does not use classes or interfaces. Prefer plain functions and type aliases.
