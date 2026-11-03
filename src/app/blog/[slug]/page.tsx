import { blogPosts } from '@/data/blogPosts';
import { Calendar, User, ArrowLeft, Clock, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageShell } from '@/components/editorial/PageIntro';
import { CtaBand } from '@/components/editorial/CtaBand';
import { RevealLines } from '@/components/motion/RevealLines';
import { btnArrow, btnCoralOnInk } from '@/components/editorial/styles';

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

// Article body comes in as HTML strings (p, h2, ul/li, strong, em); style
// them here since the typography plugin isn't installed.
const bodyClass = [
  '[&_p]:text-lg sm:[&_p]:text-xl [&_p]:leading-[1.75] [&_p]:text-ink/80 [&_p]:mb-7',
  '[&_h2]:font-display [&_h2]:text-ink [&_h2]:text-[1.75rem] sm:[&_h2]:text-4xl [&_h2]:font-extrabold [&_h2]:tracking-[-0.03em] [&_h2]:leading-[1.1] [&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:pt-6 [&_h2]:border-t [&_h2]:border-ink/15',
  '[&_ul]:mb-8 [&_ul]:border-t [&_ul]:border-ink/15',
  '[&_li]:relative [&_li]:pl-6 [&_li]:py-3 [&_li]:border-b [&_li]:border-ink/10 [&_li]:text-lg [&_li]:text-ink/80',
  "[&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[1.35em] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:bg-coral [&_li]:before:rotate-45",
  '[&_strong]:text-ink [&_strong]:font-semibold [&_em]:text-ink',
].join(' ');

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <PageShell>
      <article className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center gap-4 pb-5 mb-10 sm:mb-12 border-b border-ink/15">
          <Link href="/blog" className="pencil-link slate text-editorial inline-flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back to Journal
          </Link>
          <span className="slate !text-[10px] bg-coral text-ink px-2 py-1 rounded-[3px]">{post.category}</span>
        </div>

        {/* Header */}
        <header className="mb-12 sm:mb-14">
          <p className="slate text-ink/55 flex flex-wrap items-center gap-x-5 gap-y-2 mb-8">
            <span className="flex items-center gap-2 tabular">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {post.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              6 min read
            </span>
          </p>

          <RevealLines
            as="h1"
            onScroll={false}
            className="font-display font-extrabold text-ink tracking-[-0.04em] !leading-[1.02] [font-size:clamp(2.25rem,1.2rem+3.6vw,4.5rem)]"
            lines={[post.title]}
          />

          <div className="flex items-center gap-4 mt-10 py-6 border-y border-ink/15">
            <span aria-hidden="true" className="w-11 h-11 rounded-full bg-ink text-ivory flex items-center justify-center">
              <User className="w-5 h-5" />
            </span>
            <div>
              <div className="slate text-ink/50 mb-1">Written by</div>
              <div className="text-sm font-semibold text-ink">{post.author}</div>
            </div>
            <button
              type="button"
              aria-label="Share"
              className="ml-auto w-11 h-11 rounded-full border border-ink/20 text-ink/70 flex items-center justify-center transition-colors hover:bg-ink hover:text-ivory hover:border-ink"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Feature Image */}
        <figure className="mb-14 sm:mb-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-[4px] ring-1 ring-ink/10 bg-ink"
          />
        </figure>

        {/* Content */}
        <div className={bodyClass}>
          {post.content.map((paragraph, index) => (
            <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
          ))}
        </div>
      </article>

      {/* Footer CTA */}
      <CtaBand
        title={['Loved this', 'insight?']}
        body="We bring the same strategic thinking to our creative projects. Let's build something elite together."
        className="mt-24 sm:mt-32"
      >
        <Link href="/contact-us" className={`${btnCoralOnInk} w-full sm:w-auto`}>
          Start a Conversation
          <ArrowRight className={btnArrow} aria-hidden="true" />
        </Link>
      </CtaBand>
    </PageShell>
  );
}
