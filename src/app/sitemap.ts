import type { MetadataRoute } from "next";
import { demoCollections, demoWorks } from "@/data/demo-catalog";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl.toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: new URL("/catalogo", siteUrl).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: new URL("/colecciones", siteUrl).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...demoCollections.map((collection) => ({
      url: new URL(`/colecciones/${collection.slug}`, siteUrl).toString(),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...demoWorks.map((work) => ({
      url: new URL(`/obras/${work.id}`, siteUrl).toString(),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
