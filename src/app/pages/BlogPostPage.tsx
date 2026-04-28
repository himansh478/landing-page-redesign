import { useParams, Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { blogPosts } from '../data/blogPosts';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { NotFoundPage } from './NotFoundPage';

import DOMPurify from 'dompurify';

/**
 * Robust HTML sanitizer using DOMPurify — prevents XSS by stripping 
 * dangerous scripts, event handlers, and malicious links.
 */
function sanitizeHtml(raw: string): string {
  return DOMPurify.sanitize(raw);
}

import { Helmet } from 'react-helmet-async';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <NotFoundPage />;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Helmet>
        <title>{post.title} — Cwaya Blog</title>
        <meta name="description" content={post.content[0].substring(0, 160)} />
        <link rel="canonical" href={`https://www.cwaya.me/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:image" content={post.imageUrl} />
      </Helmet>
      <Header />
      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* bg blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/10 blur-[120px] rounded-full pointer-events-none" />

        <article className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-slate-900">
          <Link to="/blog" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-12 font-bold group">
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" /> Back to Insights
          </Link>

          <header className="mb-16 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-indigo-600 mb-8">
              <span className="flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]"><Tag className="w-4 h-4" /> {post.category}</span>
              <span className="flex items-center gap-2 border border-slate-200 px-4 py-1.5 rounded-full text-slate-500 font-medium"><Calendar className="w-4 h-4" /> {post.date}</span>
              <span className="flex items-center gap-2 border border-slate-200 px-4 py-1.5 rounded-full text-slate-500 font-medium"><User className="w-4 h-4" /> {post.author}</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-slate-900 mb-10 leading-[1.1] tracking-tight">
              {post.title}
            </h1>
            
            <div className="w-full aspect-video rounded-[40px] overflow-hidden border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200">
              <img
                src={post.imageUrl}
                alt={post.title}
                loading="lazy"
                className="w-full h-full object-cover rounded-[32px]"
              />
            </div>
          </header>

          <div className="prose prose-xl prose-slate max-w-none pt-8 border-t border-slate-100">
             {post.content.map((paragraph, index) => {
               const safe = sanitizeHtml(paragraph);
               if (paragraph.startsWith('<h2')) {
                 return <h2 key={index} className="text-4xl font-black mt-16 mb-8 text-slate-900 tracking-tight" dangerouslySetInnerHTML={{ __html: safe.replace(/<\/?h2>/g, '') }} />;
               }
               if (paragraph.startsWith('<h3')) {
                  return <h3 key={index} className="text-3xl font-bold mt-12 mb-6 text-slate-800 tracking-tight" dangerouslySetInnerHTML={{ __html: safe.replace(/<\/?h3>/g, '') }} />;
               }
               if (paragraph.startsWith('<ul')) {
                  return <ul key={index} className="list-disc pl-8 mb-10 space-y-4 text-slate-600 marker:text-indigo-500" dangerouslySetInnerHTML={{ __html: safe.replace(/<\/?ul>/g, '') }} />;
               }
               return (
                 <p key={index} className="text-slate-600 text-lg md:text-xl leading-relaxed mb-8 font-light" dangerouslySetInnerHTML={{ __html: safe }} />
               )
             })}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
