"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/agi-content";

/** Section nav for the public Angel Guardian Industry pages. */
export function AgiNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav className="site-header__nav">
      {NAV.map((item) => {
        const active =
          item.href === "/agi" ? pathname === "/agi" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? "active" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
