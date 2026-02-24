const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = process.env.OLLAMA_MODEL || 'nomic-embed-text';
  
  const response = await fetch(`${OLLAMA_BASE_URL}/v1/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: text }),
  });
  
  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }
  
  const data = await response.json() as { data: Array<{ embedding: number[] }> };
  return data.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = process.env.OLLAMA_MODEL || 'nomic-embed-text';
  
  const response = await fetch(`${OLLAMA_BASE_URL}/v1/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: texts }),
  });
  
  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }
  
  const data = await response.json() as { data: Array<{ embedding: number[] }> };
  return data.data.map(d => d.embedding);
}
