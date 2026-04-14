import { Menu, X, Share2, Sparkles, Package, Instagram, Youtube, Send } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchBar } from './SearchBar';
import { Link } from 'react-router';

const socialLinks = [
  {
    href: 'https://www.instagram.com/creative_shiva_01?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    label: 'Instagram',
    hoverClass: 'hover:bg-gradient-to-tr hover:from-pink-500 hover:to-orange-500 hover:border-transparent hover:text-white',
    icon: <Instagram className="w-4 h-4" />,
  },
  {
    href: 'https://chat.whatsapp.com/Ftagt0XUzkQI0zSfHZMXxI',
    label: 'WhatsApp',
    hoverClass: 'hover:bg-green-500 hover:border-transparent hover:text-white',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    href: 'https://youtube.com/@creativeshivavlogs?si=sIwTtBGWIiB3k7q1',
    label: 'YouTube',
    hoverClass: 'hover:bg-red-600 hover:border-transparent hover:text-white',
    icon: <Youtube className="w-4 h-4" />,
  },
  {
    href: 'https://t.me/creativeshiva01',
    label: 'Telegram',
    hoverClass: 'hover:bg-blue-500 hover:border-transparent hover:text-white',
    icon: <Send className="w-4 h-4" />,
  },
];

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
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-200/60 dark:border-white/[0.06] shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-40 transition duration-300" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-2 flex items-center justify-center">
                <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
            </div>
            <span className="text-slate-900 dark:text-white text-lg sm:text-xl font-black text-gradient" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
              Cwaya
            </span>
          </motion.a>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-end gap-3 lg:gap-4">

            {/* Social Icons — Desktop */}
            <div className="flex items-center gap-1.5 mr-1">
              {socialLinks.map(social => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                    bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
                    text-slate-500 dark:text-slate-400 shadow-sm
                    ${social.hoverClass}`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />

            {/* Blog */}
            <Link
              to="/blog"
              className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 font-semibold transition-colors text-sm"
            >
              Blog
            </Link>

            {/* Connect */}
            <button
              onClick={() => window.dispatchEvent(new Event('open-auth-gate'))}
              className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 font-semibold transition-colors text-sm"
            >
              Connect
            </button>

            {/* My Packages */}
            <Link
              to="/packages"
              className="relative bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg overflow-hidden group flex items-center gap-2 font-semibold text-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              <Package className="w-4 h-4 relative z-10" />
              <span className="relative z-10">My Packages</span>
            </Link>

            {/* Share */}
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg group flex items-center justify-center"
              aria-label="Share website"
              title="Share this website"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-700 dark:text-slate-300 p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all"
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
            className="md:hidden bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/[0.06]"
          >
            <div className="px-4 py-6 space-y-3 max-w-sm mx-auto">
              <div className="mb-4">
                <SearchBar />
              </div>

              {/* Social Icons — Mobile */}
              <div className="flex gap-2 justify-center pb-2">
                {socialLinks.map(social => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all
                      bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10
                      text-slate-500 dark:text-slate-400
                      ${social.hoverClass}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg transition-all font-semibold border border-slate-200 dark:border-white/10 text-base flex items-center justify-center"
                >
                  Blog
                </Link>
                <button
                  onClick={() => {
                    window.dispatchEvent(new Event('open-auth-gate'));
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg transition-all font-semibold border border-slate-200 dark:border-white/10 text-base flex items-center justify-center"
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
                  className="w-full bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 px-6 py-3 rounded-lg transition-all font-semibold border border-emerald-200 dark:border-emerald-800/40 text-base flex items-center justify-center gap-2"
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
