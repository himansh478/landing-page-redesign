import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { blogPosts } from '../data/blogPosts';
import { Calendar, User, Tag } from 'lucide-react';

export function BlogPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-200/30 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-200/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Our <span className="text-gradient">Insights</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-light max-w-3xl mx-auto leading-relaxed">
              Expert articles on video production, social media strategy, and digital innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.slug}`}
                className="bg-white/80 border border-slate-200 rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-indigo-600 mb-3">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {post.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{post.title}</h2>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-auto pt-4 border-t border-slate-200">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>{post.author}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {blogPosts.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p className="text-xl">Articles are currently being published. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
