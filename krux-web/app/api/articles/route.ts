import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const BATCH_SIZE = 20;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const { data, error } = await supabase
    .from("hundred_word_articles")
    .select("id, headline, output, news_date, image_url, sources")
    .order("news_date", { ascending: false })
    .range(offset, offset + BATCH_SIZE - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    articles: data ?? [],
    hasMore: (data?.length ?? 0) === BATCH_SIZE,
  });
}
