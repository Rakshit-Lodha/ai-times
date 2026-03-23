import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { buildStoryPath, getBaseUrl } from "@/lib/story";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const { data } = await supabase
    .from("hundred_word_articles")
    .select("id, headline, created_at, news_date")
    .order("created_at", { ascending: false })
    .limit(5000);

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const storyUrls = (data ?? []).map((story) => {
    const modified = new Date(story.created_at || story.news_date);
    const isRecent = now - modified.getTime() < sevenDaysMs;
    return {
      url: `${baseUrl}${buildStoryPath(story.id, story.headline)}`,
      lastModified: modified,
      changeFrequency: "weekly" as const,
      priority: isRecent ? 0.9 : 0.7,
    };
  });

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
