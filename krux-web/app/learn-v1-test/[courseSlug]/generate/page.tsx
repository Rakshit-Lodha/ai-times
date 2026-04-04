import { notFound } from "next/navigation";
import GenerateWizard from "@/components/GenerateWizard";
import { getCourseBySlug } from "@/lib/learn-data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ courseSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) return { title: "Not Found" };

  return {
    title: `Generate Voice Profile — ${course.title} — KRUX Learn`,
    description: "Generate your LinkedIn voice profile, banned phrases, and project instructions.",
  };
}

export default async function GeneratePage({ params }: Props) {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);

  if (!course) notFound();

  return <GenerateWizard courseSlug={courseSlug} basePath="/learn-v1-test" />;
}
