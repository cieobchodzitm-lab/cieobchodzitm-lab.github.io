import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cieobchodzitm-lab.github.io"),
  title: {
    default: "L4L7art — Pracownia sztuki | Obrazy, grafiki, edycje limitowane",
    template: "%s · L4L7art",
  },
  description:
    "L4L7art — pracownia sztuki w Bydgoszczy. Unikatowe obrazy olejne, grafiki muzealne giclée i limitowane edycje kolekcjonerskie z certyfikatem. Gdzie struktura spotyka ducha.",
  keywords: [
    "L4L7art",
    "galeria sztuki",
    "obrazy olejne",
    "grafika cyfrowa",
    "edycje limitowane",
    "sklep z obrazami",
    "sztuka współczesna",
    "Bydgoszcz",
  ],
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "L4L7art",
    title: "L4L7art — Pracownia sztuki",
    description:
      "Unikatowe obrazy, grafiki muzealne i edycje limitowane z certyfikatem. Gdzie struktura spotyka ducha.",
    images: ["/works/silentium-aurum.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230c0e12'/%3E%3Ctext x='16' y='22' font-size='18' text-anchor='middle' fill='%23d4af37'%3E%E2%97%88%3C/text%3E%3C/svg%3E"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
