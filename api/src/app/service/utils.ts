export function splitString(str: string, size: number): string[] {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, from = 0; i < numChunks; ++i, from += size) {
    chunks[i] = str.substring(from, from + size);
  }

  return chunks;
}
