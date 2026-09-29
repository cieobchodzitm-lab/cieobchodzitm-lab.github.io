import Link from "next/link";
import type { Metadata } from "next";
import { AgiNav } from "@/components/AgiNav";
import { AGI } from "@/lib/agi-content";

export const metadata: Metadata = {
  title: {
    // `absolute` so the root layout's "%s · THE BRIDGE" template is not applied
    // to this section's own landing page.
    absolute: "Angel Guardian Industry",
    template: "%s · Angel Guardian Industry",
  },
  description:
    "Public overview of Angel Guardian Industry: PHANTOM RESCUE, PHANTOM SCOUT and the Global Rescue Initiative. Claims are labelled as confirmed, self-reported or planned.",
};

export default function AgiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/agi" className="site-header__brand">
            <span className="mark">🛡</span> {AGI.name}
          </Link>
          <AgiNav />
          <div className="site-header__user">
            <Link href="/" title="L4L7art — galeria i sklep">
              L4L7art
            </Link>
            <Link href="/admin" title="THE BRIDGE — konsola">
              ⌁ Konsola
            </Link>
          </div>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="site-footer">
        <p>
          <span className="gold">{AGI.licenceShort}</span> · © {AGI.year}{" "}
          {AGI.name} · All rights reserved
        </p>
        <p className="footer-note">
          Page republishes the organisation&apos;s own material with verification labels
          attached. Nothing here has been independently audited.
        </p>
        <p className="footer-note">
          <em>“{AGI.mottoPl}”</em> — {AGI.mottoPlEn}
        </p>
      </footer>
    </>
  );
}
