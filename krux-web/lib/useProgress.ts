"use client";

import { useState, useEffect, useCallback } from "react";

type CourseProgress = {
  completedCards: number[];
  completedSubtopics: number[];
};

const EMPTY: CourseProgress = { completedCards: [], completedSubtopics: [] };

function getKey(courseSlug: string) {
  return `krux-progress-${courseSlug}`;
}

function read(courseSlug: string): CourseProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(getKey(courseSlug));
    if (!raw) return EMPTY;
    return JSON.parse(raw) as CourseProgress;
  } catch {
    return EMPTY;
  }
}

function write(courseSlug: string, progress: CourseProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getKey(courseSlug), JSON.stringify(progress));
}

export function useCourseProgress(courseSlug: string) {
  const [progress, setProgress] = useState<CourseProgress>(EMPTY);

  useEffect(() => {
    setProgress(read(courseSlug));
  }, [courseSlug]);

  const markCardComplete = useCallback((cardId: number) => {
    setProgress((prev) => {
      if (prev.completedCards.includes(cardId)) return prev;
      const next = { ...prev, completedCards: [...prev.completedCards, cardId] };
      write(courseSlug, next);
      return next;
    });
  }, [courseSlug]);

  const markSubtopicComplete = useCallback((subtopicId: number) => {
    setProgress((prev) => {
      if (prev.completedSubtopics.includes(subtopicId)) return prev;
      const next = { ...prev, completedSubtopics: [...prev.completedSubtopics, subtopicId] };
      write(courseSlug, next);
      return next;
    });
  }, [courseSlug]);

  const isCardComplete = useCallback((cardId: number) => {
    return progress.completedCards.includes(cardId);
  }, [progress.completedCards]);

  const isSubtopicComplete = useCallback((subtopicId: number) => {
    return progress.completedSubtopics.includes(subtopicId);
  }, [progress.completedSubtopics]);

  return {
    progress,
    markCardComplete,
    markSubtopicComplete,
    isCardComplete,
    isSubtopicComplete,
    completedSubtopicCount: progress.completedSubtopics.length,
    completedCardCount: progress.completedCards.length,
  };
}
