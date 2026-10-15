'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2, PlayCircle } from 'lucide-react';
import type { Course } from '@/types';

export default function MyCoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/my-courses');
        return;
      }

      const { data } = await supabase
        .from('course_purchases')
        .select('course_id, courses(id, slug, title, description, cover_image_url, price, published, created_at)')
        .eq('status', 'SUCCESS');

      type Row = { courses: Course | Course[] | null };
      const rows = (data || []) as unknown as Row[];
      const list = rows
        .map((p) => (Array.isArray(p.courses) ? p.courses[0] : p.courses))
        .filter((c): c is Course => !!c);
      setCourses(list);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8">My Courses</h1>
        {courses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">You haven&apos;t bought any courses yet.</p>
            <Link href="/courses" className="text-indigo-600 font-bold hover:underline">
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/my-courses/${course.slug}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-video bg-slate-900 flex items-center justify-center">
                  {course.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <PlayCircle className="w-10 h-10 text-white/70" />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-slate-900">{course.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
