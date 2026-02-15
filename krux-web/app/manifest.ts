import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KRUX - AI News in 100 Words",
    short_name: "KRUX",
    description: "Everything about AI in 100 words. Swipe through AI news.",
    start_url: "/",
    display: "standalone",
    background_color: "#050508",
    theme_color: "#0a0f1a",
    orientation: "portrait",
    icons: [
      {
        src: "/api/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/api/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
