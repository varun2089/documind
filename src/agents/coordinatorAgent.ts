import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import {
  searchDocumentsToolDefinition,
  executeSearchDocuments,
} from "../tools/searchDocumentsTool";
import type { VectorEntry } from "../ingestion/vectorStore";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a document intelligence assistant. You have access to a document search tool that can find relevant content from an indexed document store. Whenever the user asks a question that might be answered by document content, use the search_documents tool to find relevant information before answering.`;

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  const textBlock = content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === "text"
  );
  return textBlock?.text ?? "";
}

export async function runCoordinator(
  question: string,
  store: VectorEntry[]
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [searchDocumentsToolDefinition],
    messages: [{ role: "user", content: question }],
  });

  if (response.stop_reason !== "tool_use") {
    return extractText(response.content);
  }

  const toolUseBlocks = response.content.filter(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use"
  );

  const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
  for (const block of toolUseBlocks) {
    const input = block.input as { query: string; top_k?: number };
    const results = await executeSearchDocuments(store, input);
    toolResults.push({
      type: "tool_result",
      tool_use_id: block.id,
      content: JSON.stringify(results),
    });
  }

  const assistantContent: Anthropic.Messages.ContentBlockParam[] =
    response.content.map((block) => {
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

  const followUp = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [searchDocumentsToolDefinition],
    messages: [
      { role: "user", content: question },
      { role: "assistant", content: assistantContent },
      { role: "user", content: toolResults },
    ],
  });

  return extractText(followUp.content);
}
