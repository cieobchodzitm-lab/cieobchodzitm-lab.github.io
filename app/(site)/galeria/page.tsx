import { Suspense } from "react";
import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/site/GalleryExplorer";

export const metadata: Metadata = {
  title: "Galeria — wszystkie prace",
  description:
    "Przeglądaj wszystkie prace L4L7art: unikatowe obrazy olejne i akrylowe, grafiki muzealne giclée oraz numerowane edycje limitowane z certyfikatem.",
};

export default function GaleriaPage() {
  return (
    <section className="l4l7-section">
      <p className="l4l7-kicker">Kolekcja</p>
      <h1 className="l4l7-page-title">Galeria prac</h1>
      <p className="l4l7-lead">
        Każdy oryginał istnieje w jednym egzemplarzu, każda edycja jest
        numerowana i certyfikowana. Kliknij pracę, by zobaczyć szczegóły,
        wymiary i cenę.
      </p>
      <Suspense fallback={<p className="loading">Ładowanie galerii…</p>}>
        <GalleryExplorer />
      </Suspense>
    </section>
  );
}
