import { isValidSecret } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { pickTopic } from "@/lib/topics";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-agent-secret");
  if (!isValidSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = req.nextUrl.origin;

  const response = await fetch(`${base}/api/internal/generate-article`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-agent-secret": secret || "",
    },
    body: JSON.stringify({
      topic: pickTopic(),
      publish: true,
      tone: "educational and practical",
    }),
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
