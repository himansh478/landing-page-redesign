import { Menu, X, Share2, Sparkles, Package } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchBar } from './SearchBar';
import { Link } from 'react-router';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleShare = async () => {
    const websiteUrl = window.location.origin;
    const shareData = {
      title: 'Cwaya — Premium Creative & Tech Services',
      text: 'Check out Cwaya for premium video editing, photography, social media management, and AI solutions!',
      url: websiteUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(websiteUrl);
        alert('Website link copied to clipboard! Share it with your friends.');
      } catch {
        // Clipboard unavailable — silently fail
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-200/60 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition duration-300" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-2 flex items-center justify-center">
                <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
            </div>
            <span className="text-slate-900 text-lg sm:text-xl font-black text-gradient">
              Cwaya
            </span>
          </motion.a>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-end gap-6 lg:gap-8 card-3d-wrap">
            {/* Blog Button */}
            <Link
              to="/blog"
              className="relative text-slate-700 hover:text-indigo-600 px-4 py-2 font-semibold transition-colors flex items-center justify-center"
            >
              Blog
            </Link>

            {/* Connect Button */}
            <button
              onClick={() => window.dispatchEvent(new Event('open-auth-gate'))}
              className="relative text-slate-700 hover:text-indigo-600 px-4 py-2 font-semibold transition-colors flex items-center justify-center"
            >
              Connect
            </button>

            {/* My Packages Button */}
            <Link
              to="/packages"
              className="relative card-3d bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 lg:py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg overflow-hidden group flex items-center justify-center gap-2 font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              <Package className="w-5 h-5 relative z-10" />
              <span className="relative z-10">My Packages</span>
            </Link>

            {/* Share Button */}
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative card-3d bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white p-2 lg:p-2.5 rounded-lg transition-all shadow-md hover:shadow-lg overflow-hidden group flex items-center justify-center"
              aria-label="Share website"
              title="Share this website"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              <Share2 className="w-5 h-5 relative z-10" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-700 p-2.5 hover:bg-slate-100 rounded-lg transition-all"
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/60"
          >
            <div className="px-4 py-6 space-y-3 max-w-sm mx-auto">
              <div className="mb-4">
                <SearchBar />
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-slate-50 hover:bg-indigo-50 text-slate-700 px-6 py-3 rounded-lg transition-all font-semibold border border-slate-200 text-base flex items-center justify-center gap-2"
                >
                  Blog
                </Link>
                <button
                  onClick={() => {
                    window.dispatchEvent(new Event('open-auth-gate'));
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-50 hover:bg-indigo-50 text-slate-700 px-6 py-3 rounded-lg transition-all font-semibold border border-slate-200 text-base flex items-center justify-center gap-2"
                >
                  Connect
                </button>
                <Link
                  to="/packages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg transition-all font-semibold shadow-md text-base flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  My Packages
                </Link>
                <motion.button
                  onClick={() => {
                    handleShare();
                    setMobileMenuOpen(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-6 py-3 rounded-lg transition-all font-semibold border border-emerald-200 text-base flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share Website
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
