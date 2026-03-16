import { FaqItem } from '@/lib/types';

export function FAQBlock({ faq }: { faq: FaqItem[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold">FAQ</h2>
      <div className="mt-4 space-y-3">
        {faq.map((item) => (
          <details key={item.question} className="rounded-xl bg-white p-4 shadow-sm">
            <summary className="cursor-pointer font-semibold">{item.question}</summary>
            <p className="mt-2 text-slate-700">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
