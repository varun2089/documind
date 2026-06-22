import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export const extractDataToolDefinition = {
  name: "extract_data",
  description:
    "Extracts structured data from provided text according to a given JSON schema. Returns a JSON object matching the specified schema.",
  input_schema: {
    type: "object" as const,
    properties: {
      text: {
        type: "string",
        description: "The text to extract structured data from.",
      },
      schema: {
        type: "object",
        description:
          "The JSON schema describing the desired output structure.",
      },
    },
    required: ["text", "schema"],
  },
};

export async function executeExtractData(input: {
  text: string;
  schema: object;
}): Promise<object> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system:
      "You are a structured data extraction assistant. Extract data from the provided text according to the given JSON schema. Return ONLY valid JSON matching the schema with no other text, no markdown formatting, and no explanation. If a field's value cannot be determined from the text with certainty, return null for that field rather than guessing or assuming a default value. Only fill in a field if the information is explicitly stated or directly calculable from the text.",
    messages: [
      {
        role: "user",
        content: `Extract data from the following text according to this JSON schema.\n\nSchema:\n${JSON.stringify(input.schema, null, 2)}\n\nText:\n${input.text}`,
      },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === "text"
  );
  const raw = textBlock?.text ?? "";
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    return { error: true, raw };
  }
}
