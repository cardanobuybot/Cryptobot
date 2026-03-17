import { NextRequest, NextResponse } from "next/server";
import { createArticle } from "@/lib/articles";
import { generateArticle } from "@/lib/openai";
import { isValidSecret } from "@/lib/auth";

interface Body {
  topic?: string;
  keywords?: string[];
  tone?: string;
  publish?: boolean;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-agent-secret");
  if (!isValidSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.topic || body.topic.trim().length < 3) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  try {
    const generated = await generateArticle({
      topic: body.topic,
      keywords: body.keywords,
      tone: body.tone,
    });

    const publish = Boolean(body.publish);
    const now = new Date().toISOString();

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
      publishedAt: publish ? now : null,
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
