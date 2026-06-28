# Documind

AI-powered multi-agent document intelligence assistant using Claude API, RAG, and agentic orchestration.

Upload PDFs or Word documents, ask questions in plain English, and get cited answers grounded in your actual documents.

## Example

> **Q: If I terminate the contract today, what do I still owe, and does the current invoice count toward that?**
>
> Based on the contract's termination clause and the current invoice: you owe the outstanding invoice amount ($269.50, currently unpaid), since the contract requires payment of all outstanding fees up to the termination date. The termination notice period (30–60 days) gives significantly more lead time than the invoice's 14-day payment window.
>
> *Source: sample_contract.pdf, sample_invoice.pdf*

## Architecture

![Documind architecture](./docs/architecture.svg)

A coordinator agent routes each question to the right tool — semantic search for general questions, structured JSON extraction for specific data — looping through multiple rounds when needed and citing exactly which documents it used.

## Features

- RAG pipeline (chunking, Voyage AI embeddings, cosine similarity search)
- Agentic tool routing with multi-round reasoning
- Accurate, self-reported source citations
- Multi-file upload with per-file error handling
- Structured JSON extraction with null-handling for missing data
- Retry/backoff for rate-limited API calls

## Tech Stack

React 19 · TypeScript · Express · Tailwind CSS · Claude API · Voyage AI

## Getting Started

```bash
npm install
# add ANTHROPIC_API_KEY and VOYAGE_API_KEY to a .env file at the root

npm run dev:api        # starts the backend on :3001
npm run dev:frontend   # starts the frontend on :5173
```

## Known Limitations

Built and tested as a demo of agentic architecture and RAG — not a production deployment.

- In-memory vector store (no persistence across restarts)
- No schema validation on extracted JSON
- No automated test suite
- Open CORS policy (local dev only)