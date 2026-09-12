import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="site-header__brand">
            <span className="mark">⌁</span> THE BRIDGE
          </Link>
          <nav className="site-header__nav" style={{ flex: 1 }} />
        </div>
      </header>

      <main className="main">
        <div className="auth-wrap">
          <div className="card auth-card">
            <div className="logo">THE BRIDGE</div>
            <p className="hint">Authorized operators only — access is audited.</p>
            <LoginForm />
            <p className="muted" style={{ fontSize: "0.8rem", marginTop: "1.2rem" }}>
              Virtue-aligned · L0–L5 · CNOTA · Meta-Jury
            </p>
          </div>
        </div>
      </main>
    </>
  );
}