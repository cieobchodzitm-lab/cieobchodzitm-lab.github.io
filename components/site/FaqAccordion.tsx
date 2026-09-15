"use client";

import { useState } from "react";

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="l4l7-faq">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={`l4l7-faq__item ${isOpen ? "l4l7-faq__item--open" : ""}`}
          >
            <button
              className="l4l7-faq__q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{item.q}</span>
              <span className="l4l7-faq__icon" aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && <p className="l4l7-faq__a">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
