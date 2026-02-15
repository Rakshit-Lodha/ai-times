import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { buildStoryPath, getBaseUrl } from "@/lib/story";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const { data } = await supabase
    .from("hundred_word_articles")
    .select("id, headline, created_at, news_date")
    .order("news_date", { ascending: false })
    .limit(5000);

  const storyUrls = (data ?? []).map((story) => ({
    url: `${baseUrl}${buildStoryPath(story.id, story.headline)}`,
    lastModified: new Date(story.created_at || story.news_date),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...storyUrls,
  ];
}
