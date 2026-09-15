import { CartProvider } from "@/components/site/CartContext";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="l4l7-main">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
