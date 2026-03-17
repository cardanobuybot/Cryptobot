import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidSecret } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const secret = String(form.get("secret") || "");

  if (!isValidSecret(secret)) {
    return NextResponse.redirect(new URL("/internal/ai-articles?error=1", req.url));
  }

  const res = NextResponse.redirect(new URL("/internal/ai-articles", req.url));
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: secret,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
