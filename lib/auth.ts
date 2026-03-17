import { cookies } from "next/headers";
import { isAgentSecretValid } from "@/lib/env";

export const ADMIN_COOKIE = "cb_admin_auth";

export function isValidSecret(secret: string | null): boolean {
  return isAgentSecretValid(secret);
}

export function isAdminAuthed(): boolean {
  const value = cookies().get(ADMIN_COOKIE)?.value || null;
  return isValidSecret(value);
}
