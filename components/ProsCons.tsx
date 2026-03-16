export function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Pros</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">{pros.map((p) => <li key={p}>{p}</li>)}</ul>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Cons</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">{cons.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
    </section>
  );
}
