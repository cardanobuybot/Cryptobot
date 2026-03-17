import { NextRequest, NextResponse } from "next/server";
import { isAgentSecretValid } from "@/lib/env";
import { pickTopic } from "@/lib/topics";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-agent-secret");
  if (!secret || !isAgentSecretValid(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUrl = new URL("/api/internal/generate-article", req.nextUrl.origin);

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-agent-secret": secret,
    },
    body: JSON.stringify({
      topic: pickTopic(),
      publish: true,
      tone: "educational and practical",
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as unknown;
  return NextResponse.json(data, { status: response.status });
}
