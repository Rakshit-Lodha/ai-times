import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import StackDeck from "@/components/StackDeck";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ stackSlug: string }>;
};

async function getStack(slug: string) {
  const { data: stack } = await supabase
    .from("learn_stacks")
    .select("id, slug, title, emoji, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!stack) return null;

  const { data: cards } = await supabase
    .from("learn_stack_cards")
    .select("id, position, headline, output, image_url")
    .eq("stack_id", stack.id)
    .order("position");

  return { stack, cards: cards ?? [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stackSlug } = await params;
  const data = await getStack(stackSlug);
  if (!data) return { title: "Stack Not Found" };

  return {
    title: `${data.stack.emoji} ${data.stack.title} — KRUX Learn`,
    description: data.stack.description || `Learn: ${data.stack.title}`,
  };
}

export default async function LearnStackPage({ params }: Props) {
  const { stackSlug } = await params;
  const data = await getStack(stackSlug);

  if (!data || data.cards.length === 0) {
    notFound();
  }

  return (
    <StackDeck
      stack={{
        title: data.stack.title,
        slug: data.stack.slug,
        emoji: data.stack.emoji || "📚",
      }}
      cards={data.cards}
    />
  );
}
