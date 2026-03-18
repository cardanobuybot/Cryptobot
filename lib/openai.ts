import OpenAI from 'openai';
import { getEnv } from './env.js';

export type GeneratedArticle = {
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
};

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) {
    return client;
  }

  client = new OpenAI({ apiKey: getEnv().OPENAI_API_KEY });
  return client;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid generated article field: ${field}`);
  }
  return value.trim();
}

export async function generateArticle(topic: string): Promise<GeneratedArticle> {
  const openai = getClient();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.5,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You write high quality crypto/business blog articles. Respond with JSON keys: title, excerpt, content, seoTitle, seoDescription.'
      },
      {
        role: 'user',
        content:
          `Write a complete markdown article about: ${topic}. Content should be practical and original. Excerpt should be 1-2 sentences.`
      }
    ]
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI did not return article content');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('OpenAI response was not valid JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('OpenAI response JSON has invalid shape');
  }

  const data = parsed as Record<string, unknown>;

  return {
    title: asString(data.title, 'title'),
    excerpt: asString(data.excerpt, 'excerpt'),
    content: asString(data.content, 'content'),
    seoTitle: asString(data.seoTitle, 'seoTitle'),
    seoDescription: asString(data.seoDescription, 'seoDescription')
  };
}
