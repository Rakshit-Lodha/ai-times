import { listArticles } from "@/lib/db";
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

  const articles = listArticles({
    topic: topicSlug ? TOPIC_MAP[topicSlug] : undefined,
    since: todayFilter === "1" ? getIstMidnight() : undefined,
    offset,
    limit: BATCH_SIZE,
  });

  return NextResponse.json({
    articles,
    hasMore: articles.length === BATCH_SIZE,
  });
}
