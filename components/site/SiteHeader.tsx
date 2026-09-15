"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartContext";

const LINKS = [
  { href: "/", label: "Start" },
  { href: "/galeria", label: "Galeria" },
  { href: "/o-mnie", label: "O mnie" },
  { href: "/cennik", label: "Cennik" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="l4l7-header">
      <div className="l4l7-header__inner">
        <Link href="/" className="l4l7-brand" onClick={() => setOpen(false)}>
          <span className="l4l7-brand__mark">◈</span>
          <span className="l4l7-brand__text">
            L4L7<span className="gold">art</span>
          </span>
        </Link>

        <nav className={`l4l7-nav ${open ? "l4l7-nav--open" : ""}`}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/koszyk"
            className={`l4l7-cart-link ${isActive("/koszyk") ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            Koszyk
            {count > 0 && <span className="l4l7-cart-badge">{count}</span>}
          </Link>
        </nav>

        <div className="l4l7-header__actions">
          <Link
            href="/koszyk"
            className="l4l7-cart-btn"
            aria-label={`Koszyk, ${count} prac`}
          >
            ❖<span className="l4l7-cart-btn__label">Koszyk</span>
            {count > 0 && <span className="l4l7-cart-badge">{count}</span>}
          </Link>
          <button
            className="l4l7-burger"
            aria-label={open ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
