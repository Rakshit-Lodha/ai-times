import { listPublishedStacks } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const stacks = listPublishedStacks().map(
    ({ id, slug, title, emoji, description, cover_gradient, cover_image_url, card_count }) => ({
      id, slug, title, emoji, description, cover_gradient, cover_image_url, card_count,
    })
  );

  return NextResponse.json({ stacks });
}
