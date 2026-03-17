import { isAdminAuthed } from "@/lib/auth";
import { GenerateArticleForm } from "@/components/GenerateArticleForm";

export default function InternalAiArticlesPage({ searchParams }: { searchParams: { error?: string } }) {
  const authed = isAdminAuthed();

  if (!authed) {
    return (
      <main className="container">
        <h1>Internal AI Articles</h1>
        <form action="/api/internal/login" method="post" className="card stack">
          <label>Admin secret<input type="password" name="secret" required /></label>
          <button>Enter</button>
          {searchParams.error ? <p className="error">Invalid secret</p> : null}
        </form>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Internal AI Articles</h1>
      <p>Before generating, save secret in browser console once: <code>localStorage.setItem('article_agent_secret', 'YOUR_SECRET')</code></p>
      <GenerateArticleForm />
    </main>
  );
}
