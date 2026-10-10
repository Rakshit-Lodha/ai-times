import { getPublishedStack } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stackSlug: string }> }
) {
  const { stackSlug } = await params;

  const data = getPublishedStack(stackSlug);
  if (!data) {
    return NextResponse.json({ error: "Stack not found" }, { status: 404 });
  }

  const { id, slug, title, emoji, description } = data.stack;
  return NextResponse.json({ stack: { id, slug, title, emoji, description }, cards: data.cards });
}
