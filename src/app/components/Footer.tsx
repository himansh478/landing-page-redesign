import { Camera, Mail, Phone, MapPin, Instagram, Youtube, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="relative overflow-hidden
      bg-slate-50 dark:bg-[#05050a]
      border-t border-slate-200 dark:border-white/[0.06]"
    >
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-40 bg-indigo-500/6 dark:bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-40" />
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-2 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span
                className="text-slate-900 dark:text-white text-2xl font-black tracking-tight text-gradient"
                style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
              >
                Cwaya
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Your complete creative and tech powerhouse. Premium results, unbeatable prices.
            </p>
            <div className="flex gap-2.5">
              <a
                href="https://www.instagram.com/creative_shiva_01?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
                  text-slate-500 dark:text-slate-400
                  hover:bg-gradient-to-tr hover:from-pink-500 hover:to-orange-500 hover:border-transparent hover:text-white hover:scale-110 shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://chat.whatsapp.com/Ftagt0XUzkQI0zSfHZMXxI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
                  text-slate-500 dark:text-slate-400
                  hover:bg-green-500 hover:border-transparent hover:text-white hover:scale-110 shadow-sm"
                aria-label="WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@creativeshivavlogs?si=sIwTtBGWIiB3k7q1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
                  text-slate-500 dark:text-slate-400
                  hover:bg-red-600 hover:border-transparent hover:text-white hover:scale-110 shadow-sm"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/creativeshiva01"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10
                  text-slate-500 dark:text-slate-400
                  hover:bg-blue-500 hover:border-transparent hover:text-white hover:scale-110 shadow-sm"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3
              className="text-slate-900 dark:text-white font-bold mb-5 text-xs tracking-widest uppercase"
              style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
            >
              Services
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/masterful-editing', label: 'Video Editing' },
                { href: '/professional-shoots', label: 'Professional Shoots' },
                { href: '/social-media-management', label: 'Social Media Management' },
                { href: '/technical-solutions', label: 'Web Development / AI bots' },
                { href: '/theme-based', label: 'Theme Based Shoots' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3
              className="text-slate-900 dark:text-white font-bold mb-5 text-xs tracking-widest uppercase"
              style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
            >
              Company
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/wedding-portfolio', label: 'Portfolio' },
                { href: '/packages', label: 'Pricing & Packages' },
                { href: '/packages', label: 'Membership' },
                { href: '/blog', label: 'Blog' },
                { href: '/about-us', label: 'About Us' },
                { href: '/contact-us', label: 'Contact' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.href}
                    className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-slate-900 dark:text-white font-bold mb-5 text-xs tracking-widest uppercase"
              style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
            >
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                <a href="mailto:Sudhanshugour89@gmail.com" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors break-all">
                  Sudhanshugour89@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                <span>+91 81203 17074</span>
              </li>
              <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                <span>Indore–Bhopal Road, Near Bus Stand Sehore – 466001, MP, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            © {new Date().getFullYear()} Cwaya Creative Studio. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs flex-wrap justify-center">
            <Link to="/privacy-policy" className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-conditions" className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy-policy#cookies" className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
