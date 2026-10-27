import { NextResponse } from "next/server";
import { audit, getDb } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** POST /api/contact — wiadomość z formularza kontaktowego. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const imie = typeof b.imie === "string" ? b.imie.trim().slice(0, 80) : "";
  const email =
    typeof b.email === "string" ? b.email.trim().slice(0, 120).toLowerCase() : "";
  const temat = typeof b.temat === "string" ? b.temat.trim().slice(0, 80) : "";
  const wiadomosc =
    typeof b.wiadomosc === "string" ? b.wiadomosc.trim().slice(0, 3000) : "";

  if (imie.length < 2)
    return NextResponse.json({ error: "Podaj imię." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "Podaj poprawny e-mail." }, { status: 400 });
  if (wiadomosc.length < 10)
    return NextResponse.json(
      { error: "Wiadomość jest za krótka (min. 10 znaków)." },
      { status: 400 }
    );

  const db = getDb();
  db.prepare(
    "INSERT INTO messages (imie, email, temat, wiadomosc) VALUES (?, ?, ?, ?)"
  ).run(imie, email, temat, wiadomosc);
  audit(db, "sklep", "message.received", `${email} · ${temat || "bez tematu"}`);
  return NextResponse.json({ ok: true }, { status: 201 });
}
