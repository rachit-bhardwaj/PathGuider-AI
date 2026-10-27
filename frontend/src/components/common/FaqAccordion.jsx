import { useState } from 'react';
import { HiPlus } from 'react-icons/hi2';

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      {items.map(({ question, answer }, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={question}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-shadow hover:shadow-lifted"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-ink"
              aria-expanded={isOpen}
            >
              {question}
              <HiPlus
                className={`h-4 w-4 shrink-0 text-navy-600 transition-transform duration-300 ${
                  isOpen ? 'rotate-45' : ''
                }`}
              />
            </button>
            <div className={`faq-panel ${isOpen ? 'is-open' : ''}`}>
              <div>
                <p className="px-5 pb-4 text-sm leading-relaxed text-ink-soft">{answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
