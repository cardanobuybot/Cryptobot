export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSiteUrl(): string {
  return process.env.SITE_URL || "https://cryptobot.ltd";
}
