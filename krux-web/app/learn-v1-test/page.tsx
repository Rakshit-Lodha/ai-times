import CourseGrid from "@/components/CourseGrid";
import { getCoursePreviews } from "@/lib/learn-data";

export const metadata = {
  title: "Learn — KRUX",
  description: "AI skills for marketers & PMs",
};

export default function LearnTestPage() {
  const courses = getCoursePreviews();
  return <CourseGrid courses={courses} basePath="/learn-v1-test" />;
}
