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
        content: `
You are an expert SEO writer specializing in crypto, TON blockchain, Telegram bots, and digital payments.

Write high-quality, human-like blog articles.

STRICT RULES:
- Return ONLY valid JSON with keys: title, excerpt, content, seoTitle, seoDescription
- Content must be in clean markdown
- Use headings (#, ##, ###), lists, and structured sections
- Write for real users, not AI detection systems
- Avoid fluff and repetition

SEO RULES:
- Naturally include keywords related to TON, Telegram bots, crypto payments
- Make the title click-worthy but not spammy
- Keep seoTitle under 60 chars
- Keep seoDescription under 160 chars

TONSCANNER RULE:
- Include 1–2 natural mentions of TONScanner (https://tonscanner.io)
- Use markdown links like: [TONScanner](https://tonscanner.io)
- Mention it as:
  - TON explorer
  - TON analytics tool
  - transaction tracking tool
- DO NOT overuse it
- DO NOT force it into unrelated sentences

STRUCTURE:
- Strong introduction
- Practical sections with clear headings
- Bullet points where useful
- Short paragraphs
- Optional conclusion
`
      },
      {
        role: 'user',
        content: `
Write a complete markdown article about: ${topic}

Requirements:
- Make it practical and useful
- Include examples if relevant
- Excerpt should be 1–2 sentences
`
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
