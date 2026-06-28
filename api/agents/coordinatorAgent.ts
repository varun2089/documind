import Anthropic from "@anthropic-ai/sdk";
import {
  searchDocumentsToolDefinition,
  executeSearchDocuments,
} from "../tools/searchDocumentsTool";
import {
  extractDataToolDefinition,
  executeExtractData,
} from "../tools/extractDataTool";
import type { VectorEntry } from "../ingestion/vectorStore";

let client: Anthropic;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

const tools = [searchDocumentsToolDefinition, extractDataToolDefinition];

const SYSTEM_PROMPT = `You are a document intelligence assistant with access to two tools:

- search_documents: Use this to find relevant content from the indexed document store when the user asks general questions that might be answered by document content.
- extract_data: Use this when the user wants specific structured fields extracted from text, such as asking for data in JSON format or asking to "extract" specific information.

Choose the appropriate tool based on the user's intent.

When the user explicitly asks for output in JSON format or asks you to "extract" data as structured output, your final response must contain ONLY the raw JSON object with no surrounding explanation, commentary, markdown formatting, or code fences. For all other questions, respond conversationally as normal.

IMPORTANT — Source attribution: Each search result includes a "source" field with the originating document filename. When your answer uses information from document content, you MUST end your response with a line in exactly this format:

SOURCES: filename1.pdf, filename2.pdf

List ONLY the documents whose content you actually used to construct your answer — not every document that appeared in search results. List each source once even if you used it multiple times. If your answer does not use any document content (e.g. a purely conversational reply), do not include a SOURCES line.`;

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  const textBlock = content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === "text"
  );
  return textBlock?.text ?? "";
}

function toContentBlockParams(
  content: Anthropic.Messages.ContentBlock[]
): Anthropic.Messages.ContentBlockParam[] {
  return content.map((block) => {
    if (block.type === "text") {
      return { type: "text" as const, text: block.text };
    }
    if (block.type === "tool_use") {
      return {
        type: "tool_use" as const,
        id: block.id,
        name: block.name,
        input: block.input,
      };
    }
    return block as unknown as Anthropic.Messages.ContentBlockParam;
  });
}

async function executeToolUseBlocks(
  blocks: Anthropic.Messages.ToolUseBlock[],
  store: VectorEntry[]
): Promise<Anthropic.Messages.ToolResultBlockParam[]> {
  const results: Anthropic.Messages.ToolResultBlockParam[] = [];
  for (const block of blocks) {
    let result: object;
    if (block.name === "search_documents") {
      const input = block.input as { query: string; top_k?: number };
      result = await executeSearchDocuments(store, input);
    } else if (block.name === "extract_data") {
      const input = block.input as { text: string; schema: object };
      result = await executeExtractData(input);
    } else {
      result = { error: `Unknown tool: ${block.name}` };
    }
    results.push({
      type: "tool_result",
      tool_use_id: block.id,
      content: JSON.stringify(result),
    });
  }
  return results;
}

const SOURCES_REGEX = /\n?SOURCES:\s*(.+)$/;

const MAX_TOOL_ROUNDS = 5;

export type CoordinatorResult = { answer: string; sources: string[] };

function parseSources(rawAnswer: string): CoordinatorResult {
  const match = rawAnswer.match(SOURCES_REGEX);
  if (!match) return { answer: rawAnswer, sources: [] };

  const answer = rawAnswer.replace(SOURCES_REGEX, "").trimEnd();
  const sources = match[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { answer, sources };
}

export async function runCoordinator(
  question: string,
  store: VectorEntry[]
): Promise<CoordinatorResult> {
  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: question },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await getClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    if (response.stop_reason !== "tool_use") {
      return parseSources(extractText(response.content));
    }

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.Messages.ToolUseBlock =>
        block.type === "tool_use"
    );

    const toolResults = await executeToolUseBlocks(toolUseBlocks, store);

    messages.push({ role: "assistant", content: toContentBlockParams(response.content) });
    messages.push({ role: "user", content: toolResults });
  }

  return parseSources(
    extractText(
      (messages[messages.length - 1] as { content: Anthropic.Messages.ContentBlock[] }).content
    )
  );
}
