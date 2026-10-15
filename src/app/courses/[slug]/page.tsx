import { notFound } from 'next/navigation';
import { getCourseBySlug, getPublicLessons } from '@/app/actions/courses';
import { CourseBuyBox } from '@/components/CourseBuyBox';
import { PlayCircle, Lock, CheckCircle2 } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const lessons = await getPublicLessons(course.id);
  const freePreview = lessons.find((l) => l.is_free_preview);

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">{course.title}</h1>
            <p className="text-slate-600 mt-3">{course.description}</p>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-indigo-600" /> What&apos;s inside ({lessons.length} lessons)
            </h2>
            {lessons.length === 0 ? (
              <p className="text-sm text-slate-400">Lessons are being uploaded — check back soon.</p>
            ) : (
              <ul className="space-y-2">
                {lessons.map((lesson, i) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm text-slate-700 font-medium">
                      {i + 1}. {lesson.title}
                    </span>
                    {lesson.is_free_preview ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Free preview
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <CourseBuyBox course={course} freePreviewLessonId={freePreview?.id || null} />
        </div>
      </div>
    </div>
  );
}
