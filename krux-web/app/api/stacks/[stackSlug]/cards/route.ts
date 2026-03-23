import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stackSlug: string }> }
) {
  const { stackSlug } = await params;

  const { data: stack, error: stackError } = await supabase
    .from("learn_stacks")
    .select("id, slug, title, emoji, description")
    .eq("slug", stackSlug)
    .eq("is_published", true)
    .single();

  if (stackError || !stack) {
    return NextResponse.json({ error: "Stack not found" }, { status: 404 });
  }

  const { data: cards, error: cardsError } = await supabase
    .from("learn_stack_cards")
    .select("id, position, headline, output, image_url")
    .eq("stack_id", stack.id)
    .order("position");

  if (cardsError) {
    return NextResponse.json({ error: cardsError.message }, { status: 500 });
  }

  return NextResponse.json({ stack, cards: cards ?? [] });
}
