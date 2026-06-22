import { blogPosts } from '@/data/blogPosts';
import { Calendar, User, Tag, ArrowLeft, Clock, Share2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Next.js static params generation
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} — Cwaya Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.imageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <article className="relative z-10 pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Breadcrumb */}
          <Link 
            href="/blog" 
            className="group inline-flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-all mb-16 text-xs font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
            Back to Journal
          </Link>

          {/* Header */}
          <header className="mb-20">
            <div className="flex flex-wrap items-center gap-6 mb-10 text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                6 min read
              </div>
            </div>

            <h1 className="text-4xl md:text-7xl font-bold mb-12 tracking-tighter leading-none">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 py-8 border-y border-slate-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Written by</div>
                <div className="text-sm font-bold text-slate-900">{post.author}</div>
              </div>
              <button className="ml-auto w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm">
                <Share2 className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </header>

          {/* Feature Image */}
          <div className="mb-20 rounded-[40px] overflow-hidden border border-slate-200 bg-white p-2 shadow-2xl">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover rounded-[32px] aspect-video"
            />
          </div>

          {/* Content */}
          <div className="prose prose-zinc max-w-none 
            prose-h2:text-4xl prose-h2:font-bold prose-h2:tracking-tighter prose-h2:mt-20 prose-h2:mb-8 prose-h2:text-slate-900
            prose-h3:text-2xl prose-h3:font-bold prose-h3:tracking-tight prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-slate-800
            prose-p:text-xl prose-p:font-light prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mb-10
            prose-ul:list-disc prose-ul:pl-8 prose-ul:mb-10 prose-ul:space-y-4 prose-ul:text-slate-600
            prose-li:text-lg
            prose-strong:text-slate-900 prose-strong:font-bold
          ">
            {post.content.map((paragraph, index) => (
              <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-32 p-12 rounded-[40px] bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 text-center">
            <h3 className="text-3xl font-bold mb-6 tracking-tighter text-slate-900">Loved this insight?</h3>
            <p className="text-slate-600 mb-10 max-w-md mx-auto font-light">
              We bring the same strategic thinking to our creative projects. Let's build something elite together.
            </p>
            <Link 
              href="/contact-us"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest hover:bg-indigo-600 hover:scale-105 transition-all shadow-lg"
            >
              Start a Conversation
            </Link>
          </div>
        </div>
      </article>
</main>
  );
}
