function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function markdownToSafeHtml(markdown: string): string {
  const escaped = escapeHtml(markdown);
  const lines = escaped.split(/\n/);

  const html = lines
    .map((line) => {
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
      if (!line.trim()) return "";
      return `<p>${line}</p>`;
    })
    .join("\n");

  return html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
}
