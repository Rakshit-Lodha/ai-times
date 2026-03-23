"use client";

import SwipeDeck from "@/components/SwipeDeck";
import { type Article } from "@/components/StoryCard";

type HomeShellProps = {
  articles: Article[];
  startIndex?: number;
  initialTodayFilter?: boolean;
};

export default function HomeShell({ articles, startIndex, initialTodayFilter = false }: HomeShellProps) {
  return (
    <SwipeDeck
      articles={articles}
      startIndex={startIndex}
      initialTodayFilter={initialTodayFilter}
    />
  );
}
