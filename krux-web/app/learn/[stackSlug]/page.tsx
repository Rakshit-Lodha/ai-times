import { getPublishedStack } from "@/lib/db";
import { notFound } from "next/navigation";
import StackDeck from "@/components/StackDeck";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ stackSlug: string }>;
};

function getStack(slug: string) {
  return getPublishedStack(slug);
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
