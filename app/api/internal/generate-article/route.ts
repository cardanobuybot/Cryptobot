import { NextRequest, NextResponse } from "next/server";
import { createArticle } from "@/lib/articles";
import { isAgentSecretValid } from "@/lib/env";
import { generateArticle } from "@/lib/openai";

interface GenerateArticleBody {
  topic?: string;
  keywords?: string[];
  tone?: string;
  publish?: boolean;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-agent-secret");
  if (!isAgentSecretValid(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: GenerateArticleBody;
  try {
    body = (await req.json()) as GenerateArticleBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.topic || body.topic.trim().length < 3) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  try {
    const generated = await generateArticle({
      topic: body.topic,
      keywords: Array.isArray(body.keywords) ? body.keywords : undefined,
      tone: body.tone,
    });

    const publish = Boolean(body.publish);
    const nowIso = new Date().toISOString();

    const article = await createArticle({
      slug: generated.slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content: generated.content,
      status: publish ? "published" : "draft",
      tags: generated.tags,
      seoTitle: generated.seoTitle,
      seoDescription: generated.seoDescription,
      sourceTopic: body.topic,
      publishedAt: publish ? nowIso : null,
    });

    return NextResponse.json({
      id: article.id,
      slug: article.slug,
      title: article.title,
      status: article.status,
      url: `/blog/${article.slug}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
