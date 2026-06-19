export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  if (overlap >= chunkSize) {
    throw new Error(`overlap (${overlap}) must be less than chunkSize (${chunkSize})`);
  }

  if (text.length === 0) return [];

  const chunks: string[] = [];
  const step = chunkSize - overlap;
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += step;
  }

  return chunks;
}
