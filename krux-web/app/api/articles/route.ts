import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const BATCH_SIZE = 20;

const TOPIC_MAP: Record<string, string> = {
  "for-work": "Workflow improvement",
  funding: "Funding",
  reports: "Report",
  others: "Others",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const topicSlug = searchParams.get("topic");

  let query = supabase
    .from("hundred_word_articles")
    .select("id, headline, output, news_date, image_url, sources, topic")
    .order("news_date", { ascending: false });

  if (topicSlug && TOPIC_MAP[topicSlug]) {
    query = query.eq("topic", TOPIC_MAP[topicSlug]);
  }

  const { data, error } = await query.range(offset, offset + BATCH_SIZE - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    articles: data ?? [],
    hasMore: (data?.length ?? 0) === BATCH_SIZE,
  });
}
