import OpenAI from "openai";
import { requireEnv } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { articleSlugExists } from "@/lib/articles";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export interface GenerateInput {
  topic: string;
  keywords?: string[];
  tone?: string;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  tags: string[];
}

function buildPrompt(input: GenerateInput): string {
  const keywords = (input.keywords || []).join(", ");
  return `Write one SEO-friendly article for cryptobot.ltd.\nTopic: ${input.topic}\nKeywords: ${keywords || "none"}\nTone: ${input.tone || "clear, practical, trustworthy"}.\n\nRules:\n- readable and useful\n- include intro, main sections with headings, and conclusion\n- natural language, no spam\n- no fake statistics, no unsupported guarantees\n- if uncertain, keep claims general\n- output JSON only with keys: title, excerpt, contentMarkdown, seoTitle, seoDescription, tags`;
}

export async function generateArticle(input: GenerateInput): Promise<GeneratedArticle> {
  requireEnv("OPENAI_API_KEY");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are an expert fintech SEO writer." },
      { role: "user", content: buildPrompt(input) },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned empty response");

  const parsed = JSON.parse(raw) as {
    title: string;
    excerpt: string;
    contentMarkdown: string;
    seoTitle: string;
    seoDescription: string;
    tags?: string[];
  };

  const baseSlug = slugify(parsed.title || input.topic) || `article-${Date.now()}`;
  let finalSlug = baseSlug;
  let n = 2;
  while (await articleSlugExists(finalSlug)) {
    finalSlug = `${baseSlug}-${n++}`;
  }

  return {
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.contentMarkdown,
    seoTitle: parsed.seoTitle,
    seoDescription: parsed.seoDescription,
    slug: finalSlug,
    tags: parsed.tags || input.keywords || [],
  };
}
