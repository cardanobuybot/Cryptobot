const ENV_KEYS = {
  DATABASE_URL: "DATABASE_URL",
  OPENAI_API_KEY: "OPENAI_API_KEY",
  ARTICLE_AGENT_SECRET: "ARTICLE_AGENT_SECRET",
} as const;

export type RequiredEnvKey = keyof typeof ENV_KEYS;

export function requireEnv(name: RequiredEnvKey): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    return undefined;
  }
  return value;
}

export function isAgentSecretValid(secret: string | null): boolean {
  if (!secret) {
    return false;
  }
  return secret === requireEnv("ARTICLE_AGENT_SECRET");
}
