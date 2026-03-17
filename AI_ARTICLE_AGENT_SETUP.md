# AI Article Agent Setup

## Environment variables
- `OPENAI_API_KEY`
- `ARTICLE_AGENT_SECRET`
- `DATABASE_URL`
- `SITE_URL` (example: `https://cryptobot.ltd`)

## Database migration
Run SQL from `db/migrations.sql` against your Postgres database.

## Local run
```bash
npm install
npm run dev
```

## Manual generation API example
```bash
curl -X POST 'https://cryptobot.ltd/api/internal/generate-article' \
  -H 'content-type: application/json' \
  -H 'x-agent-secret: YOUR_SECRET' \
  -d '{
    "topic": "What is a crypto trading bot",
    "keywords": ["crypto bot", "telegram trading", "risk management"],
    "tone": "practical",
    "publish": true
  }'
```

## Internal UI
1. Open `/internal/ai-articles`
2. Login with `ARTICLE_AGENT_SECRET`
3. In browser console set:
   `localStorage.setItem('article_agent_secret', 'YOUR_SECRET')`
4. Fill the form and click **Generate article**.
