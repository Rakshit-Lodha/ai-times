import { NextRequest, NextResponse } from "next/server";

// Swipe reactions used to be counted in Supabase. Krux no longer has a hosted
// database, so reactions are only validated here; Google Analytics (already on
// the site) remains the source of engagement data.
export async function POST(request: NextRequest) {
  const { articleId, reaction } = await request.json();

  if (!articleId || !["like", "skip"].includes(reaction)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
