import type { Metadata } from "next";
import { CheckoutForm } from "@/components/site/CheckoutForm";

export const metadata: Metadata = {
  title: "Finalizacja zamówienia",
  description: "Sfinalizuj zamówienie w L4L7art: dane, dostawa (kurier lub odbiór w Bydgoszczy) i płatność przelewem.",
};

export default function ZamowieniePage() {
  return (
    <section className="l4l7-section">
      <p className="l4l7-kicker">Krok 2 z 2</p>
      <h1 className="l4l7-page-title">Finalizacja zamówienia</h1>
      <p className="l4l7-lead">
        Uzupełnij dane — dostępność każdej pracy potwierdzam osobiście
        e-mailem w 24 godziny. Płacisz przelewem dopiero po potwierdzeniu.
      </p>
      <CheckoutForm />
    </section>
  );
}
