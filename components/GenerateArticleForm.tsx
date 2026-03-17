"use client";

import { useState } from "react";

type Result = { url?: string; error?: string };

export function GenerateArticleForm() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("practical and clear");
  const [publish, setPublish] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const secret = window.localStorage.getItem("article_agent_secret") || "";
    const res = await fetch("/api/internal/generate-article", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-agent-secret": secret,
      },
      body: JSON.stringify({
        topic,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        tone,
        publish,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setResult({ error: data.error || "Failed" });
    } else {
      setResult({ url: data.url });
    }

    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="card stack">
      <label>Topic<input value={topic} onChange={(e) => setTopic(e.target.value)} required /></label>
      <label>Keywords (comma-separated)<input value={keywords} onChange={(e) => setKeywords(e.target.value)} /></label>
      <label>Tone<input value={tone} onChange={(e) => setTone(e.target.value)} /></label>
      <label className="row"><input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />Publish immediately</label>
      <button disabled={loading}>{loading ? "Generating..." : "Generate article"}</button>
      {result?.url && <p>Created: <a href={result.url}>{result.url}</a></p>}
      {result?.error && <p className="error">{result.error}</p>}
    </form>
  );
}
