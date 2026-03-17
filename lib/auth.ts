import { cookies } from "next/headers";
import { requireEnv } from "@/lib/env";

export const ADMIN_COOKIE = "cb_admin_auth";

export function isValidSecret(secret: string | null): boolean {
  if (!secret) return false;
  return secret === requireEnv("ARTICLE_AGENT_SECRET");
}

export function isAdminAuthed(): boolean {
  const value = cookies().get(ADMIN_COOKIE)?.value || null;
  return isValidSecret(value);
}
