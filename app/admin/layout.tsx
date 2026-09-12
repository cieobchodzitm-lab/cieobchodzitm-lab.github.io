import Link from "next/link";
import { requireSessionUser } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser();

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="site-header__brand">
            <span className="mark">⌁</span> THE BRIDGE
          </Link>
          <nav className="site-header__nav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/services">Services</Link>
            <Link href="/admin/proposals">Proposals</Link>
          </nav>
          <div className="site-header__user">
            <span>◈ {user}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="site-footer">
        <p>
          <span className="gold">Ad Astra Una</span> · ConstitutionalAudit:
          SMA-WEB-DEPLOY-20260817
        </p>
      </footer>
    </>
  );
}