import { NextResponse } from "next/server";
import { audit, getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const STATUSES = ["nowe", "w realizacji", "wysłane", "zakończone", "anulowane"];

/** PATCH /api/orders/[id] — zmiana statusu (tylko panel). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "Nieprawidłowe id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  const status =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).status
      : null;
  if (typeof status !== "string" || !STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Nieprawidłowy status." },
      { status: 400 }
    );
  }

  const db = getDb();
  const row = db
    .prepare("SELECT numer FROM orders WHERE id = ?")
    .get(orderId) as { numer: string } | undefined;
  if (!row) return NextResponse.json({ error: "Brak zamówienia." }, { status: 404 });

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);
  audit(db, user, "order.status", `${row.numer} → ${status}`);
  return NextResponse.json({ ok: true });
}
