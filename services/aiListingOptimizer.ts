import OpenAI from 'openai';

const MODEL = 'gpt-4o';
const CATEGORIES = new Set(['REAL_ESTATE', 'VEHICLE', 'ELECTRONICS', 'GENERAL']);

export interface AIOptimizedListing {
  title: string;
  category: 'REAL_ESTATE' | 'VEHICLE' | 'ELECTRONICS' | 'GENERAL';
  suggestedPriceGTQ: number;
  extractedSpecs: Record<string, string | number>;
  seoDescription: string;
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required to optimize a listing');
  return new OpenAI({ apiKey });
}

function parseListing(content: string | null | undefined): AIOptimizedListing {
  if (!content) throw new Error('OpenAI returned an empty listing response');

  let parsed: Partial<AIOptimizedListing>;
  try {
    parsed = JSON.parse(content) as Partial<AIOptimizedListing>;
  } catch {
    throw new Error('OpenAI returned invalid listing JSON');
  }

  if (typeof parsed.title !== 'string' || parsed.title.trim() === '') throw new Error('AI listing title is required');
  if (typeof parsed.category !== 'string' || !CATEGORIES.has(parsed.category)) throw new Error('AI listing category is invalid');
  if (typeof parsed.suggestedPriceGTQ !== 'number' || !Number.isFinite(parsed.suggestedPriceGTQ) || parsed.suggestedPriceGTQ < 0) throw new Error('AI listing price is invalid');
  if (!parsed.extractedSpecs || typeof parsed.extractedSpecs !== 'object' || Array.isArray(parsed.extractedSpecs)) throw new Error('AI listing specs are invalid');
  if (typeof parsed.seoDescription !== 'string' || parsed.seoDescription.trim() === '') throw new Error('AI listing description is required');

  return {
    title: parsed.title.trim(),
    category: parsed.category as AIOptimizedListing['category'],
    suggestedPriceGTQ: Number(parsed.suggestedPriceGTQ.toFixed(2)),
    extractedSpecs: parsed.extractedSpecs,
    seoDescription: parsed.seoDescription.trim()
  };
}

export async function processListingImage(imageUrl: string): Promise<AIOptimizedListing> {
  if (!URL.canParse(imageUrl)) throw new Error('imageUrl must be a valid URL');

  const response = await getOpenAIClient().chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert e-commerce cataloger for the Guatemala market. Analyze the image and return only a JSON object with:
- title: Spanish listing title
- category: REAL_ESTATE, VEHICLE, ELECTRONICS, or GENERAL
- suggestedPriceGTQ: numeric price in Guatemalan Quetzales
- extractedSpecs: key-value object with string or numeric values
- seoDescription: search-optimized Spanish description suitable for a marketplace listing
Do not invent details that are not visible; use conservative estimates when price or specifications are uncertain.`
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract item attributes and optimize this listing.' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ],
    response_format: { type: 'json_object' }
  });

  return parseListing(response.choices[0]?.message?.content);
}
