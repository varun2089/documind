import { parseDocument } from "../ingestion/parseDocument";
import { executeExtractData } from "../tools/extractDataTool";

async function main() {
  const text = await parseDocument("./sample.pdf");

  const schema = {
    type: "object",
    properties: {
      invoice_number: { type: "string" },
      vendor: { type: "string" },
      total_amount: { type: "number" },
      payment_due_date: { type: "string" },
      is_paid: { type: "boolean" },
    },
    required: [
      "invoice_number",
      "vendor",
      "total_amount",
      "payment_due_date",
      "is_paid",
    ],
  };

  const result = await executeExtractData({ text, schema });
  console.log(result);
}

main();
