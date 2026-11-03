'use client';

import { motion } from 'motion/react';
import { blogPosts } from '@/data/blogPosts';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';

export default function BlogPage() {
  return (
    <PageShell>
      <PageIntro
        label="Studio Insights"
        note={<span className="tabular">{String(blogPosts.length).padStart(2, '0')} articles</span>}
        title={['The', 'Journal']}
        lede="Expert perspectives on cinema, technology, and the future of digital storytelling."
      />

      {/* Blog Grid */}
      {blogPosts.length === 0 ? (
        <div className="mt-16 border-y border-ink/15 py-16 text-center">
          <p className="slate text-ink/50">Articles are currently being finalized.</p>
        </div>
      ) : (
        <ul className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {blogPosts.map((post, idx) => (
            <motion.li
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: (idx % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-ink ring-1 ring-ink/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-reveal group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-3 left-3 slate !text-[10px] bg-coral text-ink px-2 py-1 rounded-[3px]">{post.category}</span>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-ivory text-ink flex items-center justify-center transition-transform duration-500 ease-reveal group-hover:-rotate-45 group-hover:scale-110"
                  >
                    <ArrowUpRight className="w-4 h-4 rotate-45" />
                  </span>
                </div>

                <div className="pt-5">
                  <p className="slate text-ink/50 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="tabular">{post.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.author}</span>
                  </p>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-[-0.02em] leading-tight mt-3 line-clamp-2 transition-colors group-hover:text-editorial">
                    {post.title}
                  </h2>
                  <p className="text-sm text-ink/65 leading-relaxed mt-3 line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
