import type { Metadata } from "next";
import { OG_CARD_ALTS, OG_PAGE_CARDS, socialMetadata } from "@/lib/og";
import { CartView } from "@/components/site/CartView";

export const metadata: Metadata = {
  title: "Koszyk",
  description: "Twój koszyk w galerii L4L7art — sprawdź wybrane prace i przejdź do finalizacji zamówienia.",
  ...socialMetadata(OG_PAGE_CARDS.koszyk, OG_CARD_ALTS.koszyk),
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
