import { NextResponse } from "next/server";
import { all, audit, getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { getArtwork } from "@/lib/art";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface OrderItemInput {
  slug?: unknown;
  qty?: unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** GET /api/orders — lista zamówień (tylko panel). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
  const orders = all(
    `SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS pozycje
     FROM orders o ORDER BY o.id DESC LIMIT 200`
  );
  return NextResponse.json({ ok: true, orders });
}

/** POST /api/orders — publiczne składanie zamówienia ze sklepu. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const imie = str(body.imie, 80);
  const email = str(body.email, 120).toLowerCase();
  const telefon = str(body.telefon, 30);
  const adres = str(body.adres, 120);
  const miasto = str(body.miasto, 60);
  const kod = str(body.kod, 10);
  const dostawa = body.dostawa === "odbior" ? "odbior" : "kurier";
  const platnosc =
    body.platnosc === "odbior" && dostawa === "odbior" ? "odbior" : "przelew";
  const uwagi = str(body.uwagi, 1000);
  const items = Array.isArray(body.items) ? body.items : [];

  if (imie.length < 2)
    return NextResponse.json({ error: "Podaj imię i nazwisko." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "Podaj poprawny e-mail." }, { status: 400 });
  if (body.rodo !== true)
    return NextResponse.json(
      { error: "Zaakceptuj regulamin, aby złożyć zamówienie." },
      { status: 400 }
    );
  if (dostawa === "kurier" && (adres.length < 3 || miasto.length < 2 || kod.length < 3))
    return NextResponse.json(
      { error: "Uzupełnij adres dostawy (ulica, miasto, kod)." },
      { status: 400 }
    );
  if (items.length === 0 || items.length > 20)
    return NextResponse.json({ error: "Koszyk jest pusty." }, { status: 400 });

  // Weryfikacja pozycji po stronie serwera (ceny z katalogu, nie od klienta).
  const lines: { slug: string; tytul: string; cena: number; ilosc: number }[] = [];
  for (const raw of items as OrderItemInput[]) {
    if (!isRecord(raw) || typeof raw.slug !== "string") continue;
    const art = getArtwork(raw.slug);
    if (!art || art.pricePln == null || art.status === "sprzedana") {
      return NextResponse.json(
        { error: `Praca „${raw.slug}” jest niedostępna. Odśwież koszyk.` },
        { status: 409 }
      );
    }
    const max = art.category === "obrazy" ? 1 : 5;
    const qty =
      typeof raw.qty === "number" && Number.isInteger(raw.qty)
        ? Math.max(1, Math.min(max, raw.qty))
        : 1;
    lines.push({ slug: art.slug, tytul: art.title, cena: art.pricePln, ilosc: qty });
  }
  if (lines.length === 0)
    return NextResponse.json({ error: "Koszyk jest pusty." }, { status: 400 });

  const subtotal = lines.reduce((s, l) => s + l.cena * l.ilosc, 0);
  let shipping = 0;
  if (dostawa === "kurier" && subtotal < 2000) {
    const hasOriginal = lines.some(
      (l) => getArtwork(l.slug)?.category === "obrazy"
    );
    shipping = hasOriginal ? 120 : 29;
  }
  const suma = subtotal + shipping;

  const db = getDb();
  const year = new Date().getFullYear();
  const insert = db.prepare(
    `INSERT INTO orders (numer, imie, email, telefon, adres, miasto, kod, dostawa, platnosc, uwagi, suma, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'nowe')`
  );
  // Tymczasowy numer — docelowy nadajemy po poznaniu id.
  const tmp = `TMP-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const result = insert.run(tmp, imie, email, telefon, adres, miasto, kod, dostawa, platnosc, uwagi, suma);
  const id = Number(result.lastInsertRowid);
  const numer = `L4L7-${year}-${String(id).padStart(4, "0")}`;
  db.prepare("UPDATE orders SET numer = ? WHERE id = ?").run(numer, id);

  const insertItem = db.prepare(
    "INSERT INTO order_items (order_id, slug, tytul, cena, ilosc) VALUES (?, ?, ?, ?, ?)"
  );
  for (const l of lines) {
    insertItem.run(id, l.slug, l.tytul, l.cena, l.ilosc);
  }
  audit(db, "sklep", "order.created", `${numer} · ${lines.length} poz. · ${suma} zł`);

  return NextResponse.json({ ok: true, numer }, { status: 201 });
}
