const REQUIRED_VARS = [
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'ARTICLE_AGENT_SECRET',
  'SITE_URL'
] as const;

type RequiredVarName = (typeof REQUIRED_VARS)[number];

export type Env = {
  [K in RequiredVarName]: string;
};

let cachedEnv: Env | null = null;

function readRequired(name: RequiredVarName): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = {
    DATABASE_URL: readRequired('DATABASE_URL'),
    OPENAI_API_KEY: readRequired('OPENAI_API_KEY'),
    ARTICLE_AGENT_SECRET: readRequired('ARTICLE_AGENT_SECRET'),
    SITE_URL: readRequired('SITE_URL')
  };

  return cachedEnv;
}
