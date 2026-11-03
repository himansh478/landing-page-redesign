import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getPublishedCourses } from '@/app/actions/courses';
import { RevealLines } from '@/components/motion/RevealLines';

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="grain relative bg-ivory min-h-screen pt-28 sm:pt-32 pb-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4 pb-5 mb-10 border-b border-ink/15">
          <p className="slate slate-mark text-editorial">Cwaya · Courses</p>
          <p className="slate text-ink/50">Stream only · No downloads</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-end mb-16">
          <RevealLines
            as="h1"
            onScroll={false}
            className="lg:col-span-8 font-display font-extrabold text-ink tracking-[-0.04em] !leading-[0.95] [font-size:clamp(2.75rem,1rem+6vw,7rem)]"
            lines={['Editing', 'courses']}
          />
          <p className="lg:col-span-4 text-lg text-ink/70 leading-relaxed">
            Learn our exact editing workflow. Watch on this site only — nothing to download.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="border-y border-ink/15 py-16 text-center">
            <p className="slate text-ink/45 mb-3">Nothing on the reel yet</p>
            <p className="font-display text-2xl font-bold text-ink">No courses published yet. Check back soon.</p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {courses.map((course, i) => (
              <li key={course.id}>
                <Link href={`/courses/${course.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-editorial ring-1 ring-ink/10 [container-type:inline-size]">
                    {course.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.cover_image_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-reveal group-hover:scale-[1.04]"
                      />
                    ) : (
                      // Typographic poster when there's no cover image
                      <div className="absolute inset-0 p-6 flex flex-col justify-between text-ivory">
                        <span className="slate text-ivory/60">Vol. {String(i + 1).padStart(2, '0')}</span>
                        {/* Sized to the card (cqi), not the viewport; hyphenate long words rather than splitting them arbitrarily */}
                        <span className="pr-12 font-display font-black leading-[0.92] tracking-[-0.045em] [font-size:clamp(1.6rem,10cqi,4rem)] text-ivory/95 hyphens-auto [overflow-wrap:anywhere]">
                          {course.title}
                        </span>
                      </div>
                    )}
                    <span className="absolute top-4 right-4 slate !text-[10px] bg-coral text-ink px-2 py-1 rounded-[3px]">Course</span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-ivory text-ink flex items-center justify-center transition-transform duration-500 ease-reveal group-hover:-rotate-45 group-hover:scale-110"
                    >
                      <ArrowUpRight className="w-4 h-4 rotate-45" />
                    </span>
                  </div>
                  <div className="pt-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl font-bold text-ink tracking-[-0.02em] group-hover:text-editorial transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-sm text-ink/65 leading-relaxed mt-1.5 line-clamp-2">{course.description}</p>
                    </div>
                    <p className="font-display text-xl font-extrabold text-ink tabular flex-shrink-0">₹{course.price}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
