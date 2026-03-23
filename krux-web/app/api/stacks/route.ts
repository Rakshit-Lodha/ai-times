import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("learn_stacks")
    .select("id, slug, title, emoji, description, cover_gradient, cover_image_url, card_count")
    .eq("is_published", true)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stacks: data ?? [] });
}
