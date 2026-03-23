import { notFound } from "next/navigation";
import CardReader from "@/components/CardReader";
import { getCourseBySlug, getSubtopic } from "@/lib/learn-data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ courseSlug: string; subtopicSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug, subtopicSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) return { title: "Not Found" };
  const subtopic = getSubtopic(course, subtopicSlug);
  if (!subtopic) return { title: "Not Found" };

  return {
    title: `${subtopic.title} — ${course.title} — KRUX Learn`,
    description: subtopic.learningOutcome,
  };
}

export default async function SubtopicReaderPage({ params }: Props) {
  const { courseSlug, subtopicSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const subtopic = getSubtopic(course, subtopicSlug);
  if (!subtopic || subtopic.cards.length === 0) notFound();

  return <CardReader course={course} subtopic={subtopic} basePath="/learn-v1-test" />;
}
