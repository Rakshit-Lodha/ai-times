import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const BATCH_SIZE = 20;

const TOPIC_MAP: Record<string, string> = {
  "for-work": "Workflow improvement",
  funding: "Funding",
  reports: "Report",
  others: "Others",
};

function getIstMidnight(): string {
  const istDate = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return new Date(`${istDate}T00:00:00+05:30`).toISOString();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const topicSlug = searchParams.get("topic");
  const todayFilter = searchParams.get("today");

  let query = supabase
    .from("hundred_word_articles")
    .select("id, headline, output, news_date, created_at, image_url, sources, topic")
    .order("created_at", { ascending: false });

  if (topicSlug && TOPIC_MAP[topicSlug]) {
    query = query.eq("topic", TOPIC_MAP[topicSlug]);
  }

  if (todayFilter === "1") {
    query = query.gte("created_at", getIstMidnight());
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
