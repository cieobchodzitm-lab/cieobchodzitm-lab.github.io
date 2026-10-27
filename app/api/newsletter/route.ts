import { NextResponse } from "next/server";
import { audit, getDb } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** POST /api/newsletter — zapis do „Listu z pracowni”. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  const email =
    typeof body === "object" && body !== null && typeof (body as Record<string, unknown>).email === "string"
      ? ((body as Record<string, unknown>).email as string).trim().slice(0, 120).toLowerCase()
      : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Podaj poprawny adres e-mail." },
      { status: 400 }
    );
  }

  const db = getDb();
  // Ten sam komunikat dla nowych i istniejących — nie zdradzamy bazy.
  db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(email);
  audit(db, "sklep", "newsletter.signup", email);
  return NextResponse.json({ ok: true }, { status: 201 });
}
