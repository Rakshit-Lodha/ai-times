import { notFound } from "next/navigation";
import CourseDetail from "@/components/CourseDetail";
import { getCourseBySlug } from "@/lib/learn-data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ courseSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) return { title: "Course Not Found" };

  return {
    title: `${course.emoji} ${course.title} — KRUX Learn`,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);

  if (!course) notFound();

  return <CourseDetail course={course} basePath="/learn-v1-test" />;
}
