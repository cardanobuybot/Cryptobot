export function TOC({ sections }: { sections: { heading: string }[] }) {
  return (
    <aside className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold">Table of contents</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {sections.map((section) => {
          const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <li key={section.heading}>
              <a href={`#${id}`} className="text-slate-700 hover:text-brand-600">{section.heading}</a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
