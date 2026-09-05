import { Pool } from 'pg';
import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const RESULT_LIMIT = 20;

export interface SemanticListingResult {
  id: string;
  title: string;
  price: number;
  zone: string | null;
  description: string;
  similarity: number;
}

interface SearchDependencies {
  pool?: Pick<Pool, 'query'>;
  openai?: Pick<OpenAI, 'embeddings'>;
}

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required for semantic listing search');
  return new Pool({ connectionString });
}

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for semantic listing search');
  return new OpenAI({ apiKey });
}

function vectorLiteral(vector: number[]): string {
  if (!vector.length || vector.some((value) => !Number.isFinite(value))) throw new Error('Embedding response contains an invalid vector');
  return `[${vector.join(',')}]`;
}

export async function semanticListingSearch(queryText: string, dependencies: SearchDependencies = {}): Promise<SemanticListingResult[]> {
  const query = queryText.trim();
  if (!query) throw new Error('queryText is required');

  const openai = dependencies.openai || getOpenAI();
  const pool = dependencies.pool || getPool();
  const embeddingResponse = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: query });
  const vector = embeddingResponse.data[0]?.embedding;
  if (!vector) throw new Error('OpenAI returned no embedding');

  const sql = `
    SELECT id, title, price, zone, description,
           1 - (embedding <=> $1::vector) AS similarity
    FROM listings
    WHERE status = 'ACTIVE'
    ORDER BY embedding <=> $1::vector
    LIMIT $2;
  `;
  const result = await pool.query<SemanticListingResult>(sql, [vectorLiteral(vector), RESULT_LIMIT]);
  return result.rows;
}

export async function closeSemanticSearchPool(pool: Pool): Promise<void> {
  await pool.end();
}
