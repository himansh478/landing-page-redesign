import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { getCourseBySlug, getPublicLessons } from '@/app/actions/courses';
import { CourseBuyBox } from '@/components/CourseBuyBox';
import { RevealLines } from '@/components/motion/RevealLines';
import { toDuration } from '@/lib/timecode';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const lessons = await getPublicLessons(course.id);
  const freePreview = lessons.find((l) => l.is_free_preview);
  const totalSeconds = lessons.reduce((sum, l) => sum + (l.duration_seconds ?? 0), 0);

  return (
    <div className="grain relative bg-ivory min-h-screen pt-28 sm:pt-32 pb-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4 pb-5 mb-10 border-b border-ink/15">
          <Link href="/courses" className="pencil-link slate text-editorial inline-flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            All courses
          </Link>
          <p className="slate text-ink/50 tabular">
            {lessons.length} lessons{totalSeconds > 0 ? ` · ${toDuration(totalSeconds)}` : ''}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10">
          <div className="lg:col-span-7">
            <RevealLines
              as="h1"
              onScroll={false}
              className="font-display font-extrabold text-ink tracking-[-0.04em] !leading-[0.98] [font-size:clamp(2.5rem,1.2rem+4.4vw,5.5rem)]"
              lines={[course.title]}
            />
            {course.description && <p className="text-xl text-ink/75 leading-relaxed mt-6 max-w-2xl">{course.description}</p>}

            <section className="mt-14" aria-labelledby="reel-log">
              <div className="flex items-baseline justify-between mb-4">
                <h2 id="reel-log" className="slate text-ink/55 !font-sans">
                  Reel log
                </h2>
                <span className="slate text-ink/40">Lesson · Length</span>
              </div>
              {lessons.length === 0 ? (
                <p className="border-y border-ink/15 py-8 text-ink/60">Lessons are being uploaded — check back soon.</p>
              ) : (
                <ol className="border-t border-ink/20">
                  {lessons.map((lesson, i) => (
                    <li key={lesson.id} className="flex items-center gap-4 sm:gap-6 py-4 border-b border-ink/15">
                      <span className="slate text-ink/40 w-8 flex-shrink-0 tabular">{String(i + 1).padStart(2, '0')}</span>
                      <span className="flex-1 font-semibold text-ink">{lesson.title}</span>
                      {lesson.is_free_preview ? (
                        <span className="slate !text-[10px] bg-coral text-ink px-2 py-1 rounded-[3px]">Free preview</span>
                      ) : (
                        <Lock className="w-4 h-4 text-ink/35" aria-label="Unlocks after purchase" />
                      )}
                      <span className="slate text-ink/50 tabular w-14 text-right flex-shrink-0">
                        {lesson.duration_seconds ? toDuration(lesson.duration_seconds) : '—'}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <CourseBuyBox course={course} freePreviewLessonId={freePreview?.id || null} />
          </div>
        </div>
      </div>
    </div>
  );
}
