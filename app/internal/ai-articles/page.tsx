import AiArticleForm from './AiArticleForm';
import { getEnv } from '../../../lib/env.js';

export default async function InternalAiArticlesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const providedSecret = params.secret;
  const secret = Array.isArray(providedSecret) ? providedSecret[0] : providedSecret;
  const env = getEnv();
  const authorized = typeof secret === 'string' && secret === env.ARTICLE_AGENT_SECRET;

  if (!authorized) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0b1023',
          color: '#e5eefc',
          padding: 24,
          fontFamily: 'Inter, Arial, sans-serif'
        }}
      >
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 12 }}>Access denied</h1>
          <p style={{ margin: 0, color: '#9fb1d1' }}>
            Open this page with the correct <code>?secret=</code> value.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0b1023',
        color: '#e5eefc',
        padding: '48px 20px',
        fontFamily: 'Inter, Arial, sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: 24,
          borderRadius: 16,
          border: '1px solid rgba(148, 163, 184, 0.2)',
          background: 'rgba(15, 23, 42, 0.72)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)'
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Internal AI Articles</h1>
        <p style={{ marginTop: 0, marginBottom: 24, color: '#9fb1d1' }}>
          Manually generate and save one AI article using the existing internal backend endpoint.
        </p>
        <AiArticleForm agentSecret={env.ARTICLE_AGENT_SECRET} />
      </div>
    </main>
  );
}
