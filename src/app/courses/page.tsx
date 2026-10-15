import Link from 'next/link';
import { getPublishedCourses } from '@/app/actions/courses';
import { PlayCircle } from 'lucide-react';

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Editing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Courses</span>
          </h1>
          <p className="text-slate-600 mt-3 max-w-xl mx-auto">
            Learn our exact editing workflow. Watch on this site only — nothing to download.
          </p>
        </div>

        {courses.length === 0 ? (
          <p className="text-center text-slate-400">No courses published yet. Check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="aspect-video bg-slate-200 relative overflow-hidden">
                  {course.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <PlayCircle className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-lg text-slate-900 mb-1">{course.title}</h2>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{course.description}</p>
                  <p className="text-indigo-600 font-black text-xl">₹{course.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
