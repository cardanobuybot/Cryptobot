'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useMemo, useState } from 'react';

type Props = {
  agentSecret: string;
};

type Result = {
  id: number;
  slug: string;
  status: string;
  title: string;
};

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(148, 163, 184, 0.35)',
  background: 'rgba(15, 23, 42, 0.6)',
  color: '#e5eefc',
  fontSize: 16,
  boxSizing: 'border-box'
};

export default function AiArticleForm({ agentSecret }: Props) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const requestTopic = useMemo(() => {
    const cleanKeywords = keywords
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (cleanKeywords.length === 0) {
      return topic.trim();
    }

    return `${topic.trim()}\n\nKeywords: ${cleanKeywords.join(', ')}`;
  }, [keywords, topic]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!topic.trim()) {
      setError('Topic is required.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/internal/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-secret': agentSecret
        },
        body: JSON.stringify({
          topic: requestTopic,
          publish
        })
      });

      const data = (await response.json()) as Result | { error?: string };

      if (!response.ok) {
        throw new Error('error' in data && data.error ? data.error : 'Failed to generate article');
      }

      setResult(data as Result);
      setTopic('');
      setKeywords('');
      setPublish(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to generate article');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
      <label style={{ display: 'grid', gap: 8 }}>
        <span>Topic</span>
        <input
          type="text"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="How to accept crypto payments safely"
          style={fieldStyle}
        />
      </label>

      <label style={{ display: 'grid', gap: 8 }}>
        <span>Keywords</span>
        <input
          type="text"
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
          placeholder="payments, security, merchants"
          style={fieldStyle}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="checkbox"
          checked={publish}
          onChange={(event) => setPublish(event.target.checked)}
        />
        <span>Publish immediately</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px 16px',
          borderRadius: 10,
          border: '1px solid rgba(45, 212, 255, 0.35)',
          background: loading ? 'rgba(71, 85, 105, 0.5)' : 'rgba(37, 99, 235, 0.9)',
          color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600
        }}
      >
        {loading ? 'Generating…' : 'Generate article'}
      </button>

      {error ? (
        <p style={{ margin: 0, color: '#fda4af' }}>{error}</p>
      ) : null}

      {result ? (
        <div
          style={{
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: 12,
            padding: 16,
            background: 'rgba(15, 23, 42, 0.45)'
          }}
        >
          <p style={{ margin: '0 0 10px', color: '#86efac', fontWeight: 600 }}>Article generated successfully.</p>
          <p style={{ margin: '0 0 8px' }}><strong>Title:</strong> {result.title}</p>
          <p style={{ margin: '0 0 8px' }}><strong>Status:</strong> {result.status}</p>
          <p style={{ margin: 0 }}><strong>Link:</strong> /blog/{result.slug}</p>
        </div>
      ) : null}
    </form>
  );
}
