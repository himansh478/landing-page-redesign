'use client';

import { motion } from 'motion/react';
import { blogPosts } from '@/data/blogPosts';
import { Calendar, User, Tag, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50 text-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <Sparkles className="w-3 h-3" />
            Studio Insights
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter leading-none"
          >
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">Journal</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Expert perspectives on cinema, technology, and the future of digital storytelling.
          </motion.p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-32 relative z-10 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link 
                  href={`/blog/${post.slug}`}
                  className="group block bg-white border border-slate-200 shadow-sm rounded-[32px] overflow-hidden hover:border-indigo-300 hover:shadow-xl transition-all duration-500"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-6">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">{post.category}</span>
                      <span className="flex items-center gap-1.5 text-slate-500"><Calendar className="w-3 h-3" /> {post.date}</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4 tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-slate-500 text-sm font-light leading-relaxed mb-8 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px]">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-900" />
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{post.author}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {blogPosts.length === 0 && (
            <div className="text-center py-32">
              <p className="text-slate-400 text-xl font-light uppercase tracking-widest">Articles are currently being finalized.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
