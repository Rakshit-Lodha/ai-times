import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/ga/"],
      },
    ],
    sitemap: ["https://krux.news/sitemap.xml", "https://krux.news/news-sitemap.xml"],
  };
}
