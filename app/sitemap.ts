import type { MetadataRoute } from "next";
import { ARTWORKS } from "@/lib/art";

const BASE = "https://cieobchodzitm-lab.github.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/galeria",
    "/o-mnie",
    "/cennik",
    "/faq",
    "/kontakt",
    "/koszyk",
    "/zamowienie",
    "/regulamin",
    "/prywatnosc",
  ].map((p) => ({
    url: `${BASE}${p || "/"}`.replace(/\/$/, "/") === `${BASE}/` ? `${BASE}/` : `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const works = ARTWORKS.map((a) => ({
    url: `${BASE}/galeria/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...works];
}
