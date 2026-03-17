import OpenAI from "openai";
import { requireEnv } from "@/lib/env";
import { createUniqueSlug } from "@/lib/slug";

const MODEL = "gpt-4o-mini";

let client: OpenAI | undefined;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
  }
  return client;
}

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

interface OpenAIArticlePayload {
  title: string;
  excerpt: string;
  contentMarkdown: string;
  seoTitle: string;
  seoDescription: string;
  tags?: string[];
}

function buildPrompt(input: GenerateInput): string {
  const keywords = (input.keywords ?? []).join(", ");

  return [
    "Write one SEO-friendly article for cryptobot.ltd.",
    `Topic: ${input.topic}`,
    `Keywords: ${keywords || "none"}`,
    `Tone: ${input.tone || "clear, practical, trustworthy"}`,
    "",
    "Rules:",
    "- readable and useful",
    "- include intro, main sections with headings, and conclusion",
    "- natural language, no spam",
    "- no fake statistics, no unsupported guarantees",
    "- if uncertain, keep claims general",
    "- output JSON only with keys: title, excerpt, contentMarkdown, seoTitle, seoDescription, tags",
  ].join("\n");
}

function parsePayload(raw: string): OpenAIArticlePayload {
  const parsed = JSON.parse(raw) as Partial<OpenAIArticlePayload>;

  if (!parsed.title || !parsed.excerpt || !parsed.contentMarkdown || !parsed.seoTitle || !parsed.seoDescription) {
    throw new Error("OpenAI returned incomplete article data");
  }

  return {
    title: parsed.title,
    excerpt: parsed.excerpt,
    contentMarkdown: parsed.contentMarkdown,
    seoTitle: parsed.seoTitle,
    seoDescription: parsed.seoDescription,
    tags: Array.isArray(parsed.tags) ? parsed.tags.filter((tag): tag is string => typeof tag === "string") : [],
  };
}

export async function generateArticle(input: GenerateInput): Promise<GeneratedArticle> {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are an expert fintech SEO writer." },
      { role: "user", content: buildPrompt(input) },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned an empty response");
  }

  const payload = parsePayload(raw);

  return {
    title: payload.title,
    excerpt: payload.excerpt,
    content: payload.contentMarkdown,
    seoTitle: payload.seoTitle,
    seoDescription: payload.seoDescription,
    slug: await createUniqueSlug(payload.title || input.topic),
    tags: payload.tags && payload.tags.length > 0 ? payload.tags : input.keywords ?? [],
  };
}
