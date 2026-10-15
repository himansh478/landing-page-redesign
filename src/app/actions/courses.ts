'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkAdminAuth } from './auth';
import type { Course, Lesson, CoursePurchase } from '@/types';

async function requireAdmin() {
  const ok = await checkAdminAuth();
  if (!ok) throw new Error('Unauthorized');
}

// ───────────── PUBLIC READS (safe columns only) ─────────────

export async function getPublishedCourses(): Promise<Course[]> {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error || !data) return null;
  return data;
}

// Safe lesson metadata only — video_key is deliberately never selected here.
// Safe to call for both logged-out visitors (course preview page) and
// logged-in buyers (the watch page); it never reveals the video location.
export async function getPublicLessons(courseId: string): Promise<Lesson[]> {
  const { data, error } = await supabaseAdmin
    .from('lessons')
    .select('id, course_id, title, description, order_index, duration_seconds, thumbnail_url, is_free_preview, status, created_at')
    .eq('course_id', courseId)
    .eq('status', 'published')
    .order('order_index', { ascending: true });
  if (error) return [];
  return data || [];
}

// ───────────── ADMIN: COURSES ─────────────

export async function listAllCoursesAdmin(): Promise<Course[]> {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createCourse(input: {
  slug: string;
  title: string;
  description?: string;
  price: number;
  cover_image_url?: string;
}) {
  await requireAdmin();
  if (!input.slug || !input.title) {
    return { success: false, error: 'Slug and title are required.' };
  }
  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert([{
      slug: input.slug,
      title: input.title,
      description: input.description || '',
      price: input.price,
      cover_image_url: input.cover_image_url || null,
      published: false,
    }])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, course: data };
}

export async function setCoursePublished(courseId: string, published: boolean) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from('courses').update({ published }).eq('id', courseId);
  return { success: !error, error: error?.message };
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from('courses').delete().eq('id', courseId);
  return { success: !error, error: error?.message };
}

// ───────────── ADMIN: LESSONS ─────────────

export async function listLessonsAdmin(courseId: string): Promise<Lesson[]> {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addLesson(input: {
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  video_key: string;
  is_free_preview?: boolean;
}) {
  await requireAdmin();
  if (!input.course_id || !input.title || !input.video_key) {
    return { success: false, error: 'course_id, title and video_key are required.' };
  }
  const { data, error } = await supabaseAdmin
    .from('lessons')
    .insert([{
      course_id: input.course_id,
      title: input.title,
      description: input.description || '',
      order_index: input.order_index,
      duration_seconds: input.duration_seconds || null,
      thumbnail_url: input.thumbnail_url || null,
      video_key: input.video_key,
      is_free_preview: !!input.is_free_preview,
      status: 'published',
    }])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, lesson: data };
}

export async function setLessonStatus(lessonId: string, status: 'draft' | 'published') {
  await requireAdmin();
  const { error } = await supabaseAdmin.from('lessons').update({ status }).eq('id', lessonId);
  return { success: !error, error: error?.message };
}

export async function deleteLesson(lessonId: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from('lessons').delete().eq('id', lessonId);
  return { success: !error, error: error?.message };
}

// ───────────── ADMIN: SALES ─────────────

export async function listPurchasesAdmin(): Promise<CoursePurchase[]> {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from('course_purchases')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
