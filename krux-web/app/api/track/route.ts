import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { articleId, reaction } = await request.json();

  if (!articleId || !["like", "skip"].includes(reaction)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  await supabase.rpc("increment_swipe", {
    article_id: articleId,
    swipe_type: reaction,
  });

  return NextResponse.json({ ok: true });
}
