import type { Metadata } from "next";
import { CartView } from "@/components/site/CartView";

export const metadata: Metadata = {
  title: "Koszyk",
  description: "Twój koszyk w galerii L4L7art — sprawdź wybrane prace i przejdź do finalizacji zamówienia.",
};

export default function KoszykPage() {
  return (
    <section className="l4l7-section">
      <p className="l4l7-kicker">Sklep</p>
      <h1 className="l4l7-page-title">Koszyk</h1>
      <CartView />
    </section>
  );
}
