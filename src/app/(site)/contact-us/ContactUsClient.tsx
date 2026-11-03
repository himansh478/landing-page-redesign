'use client';

import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Instagram, Youtube, Linkedin } from 'lucide-react';
import { useState } from 'react';
import { PageShell } from '@/components/editorial/PageIntro';
import { RevealLines } from '@/components/motion/RevealLines';
import { btnPrimary, fieldClass, labelClass, selectClass, textareaClass } from '@/components/editorial/styles';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const message = `New inquiry from contact form`;
    window.open(`https://wa.me/918120317074?text=${encodeURIComponent(message)}`, '_blank');
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <PageShell>
      <div className="flex justify-between items-center gap-4 pb-5 mb-10 sm:mb-12 border-b border-ink/15">
        <p className="slate text-editorial">Global Presence</p>
        <p className="slate text-ink/50 text-right">Sehore, MP · Pan-India</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-14 lg:gap-10">
        {/* Contact Info Side */}
        <div className="lg:col-span-6">
          <RevealLines
            as="h1"
            onScroll={false}
            className="font-display font-extrabold text-ink tracking-[-0.04em] !leading-[0.95] [font-size:clamp(2.6rem,0.9rem+6vw,7rem)]"
            lines={['Get in', <span key="touch" className="text-editorial">Touch.</span>]}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
            className="text-lg text-ink/70 leading-relaxed mt-8 max-w-lg"
          >
            Have a vision? We have the tools. Let&apos;s collaborate and create something extraordinary together.
          </motion.p>

          <dl className="mt-12 border-t border-ink/20">
            {[
              { icon: <Mail className="w-4 h-4" />, label: "Email Us", value: "Sudhanshugour89@gmail.com", href: "mailto:Sudhanshugour89@gmail.com" },
              { icon: <Phone className="w-4 h-4" />, label: "Call Us", value: "+91 81203 17074", href: "tel:+918120317074" },
              { icon: <MapPin className="w-4 h-4" />, label: "Location", value: "Indore-Bhopal Road, Sehore, MP, India", href: "https://maps.google.com" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 + i * 0.08, ease: EASE }}
                className="group flex items-center gap-5 py-5 border-b border-ink/15"
              >
                <span
                  aria-hidden="true"
                  className="w-11 h-11 flex-shrink-0 rounded-full border border-ink/20 text-ink flex items-center justify-center transition-colors duration-500 group-hover:bg-coral group-hover:border-coral"
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <dt className="slate text-ink/50 mb-1">{item.label}</dt>
                  <dd>
                    <a href={item.href} className="pencil-link font-display text-lg sm:text-xl font-bold text-ink [overflow-wrap:anywhere]">
                      {item.value}
                    </a>
                  </dd>
                </div>
              </motion.div>
            ))}
          </dl>

          <ul className="mt-10 flex gap-3" aria-label="Social channels">
            {[
              { icon: <Instagram className="w-4 h-4" />, label: 'Instagram', href: "https://www.instagram.com/creative_shiva_01?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" },
              { icon: <Youtube className="w-4 h-4" />, label: 'YouTube', href: "https://youtube.com/@creativeshivavlogs?si=sIwTtBGWIiB3k7q1" },
              { icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn', href: "https://linkedin.com" },
              { icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp community', href: "https://chat.whatsapp.com/Ftagt0XUzkQI0zSfHZMXxI" },
            ].map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-11 h-11 rounded-full bg-ink text-ivory flex items-center justify-center transition-colors duration-300 hover:bg-coral hover:text-ink"
                >
                  <span aria-hidden="true">{social.icon}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Form Side */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          className="lg:col-span-6 self-start bg-paper border border-ink/15 rounded-[4px] overflow-hidden shadow-[0_40px_80px_-50px_rgb(var(--ink-rgb)/0.5)]"
        >
          <div className="h-1 bg-coral" aria-hidden="true" />
          <div className="p-6 sm:p-10">
            {submitted ? (
              <div className="text-center py-16" role="status">
                <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-7 h-7 text-ink" aria-hidden="true" />
                </div>
                <h2 className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em] mb-3">Message Received!</h2>
                <p className="text-ink/65 mb-8">Our team will get back to you within 24 hours.</p>
                <button type="button" onClick={() => setSubmitted(false)} className="pencil-link slate text-editorial">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="cu-name" className={labelClass}>Full Name</label>
                    <input id="cu-name" required type="text" placeholder="John Doe" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="cu-email" className={labelClass}>Email Address</label>
                    <input id="cu-email" required type="email" placeholder="john@example.com" className={fieldClass} />
                  </div>
                </div>

                <div>
                  <label htmlFor="cu-service" className={labelClass}>Service Required</label>
                  <select id="cu-service" className={selectClass}>
                    <option>Video Editing</option>
                    <option>Professional Shoot</option>
                    <option>Social Media Management</option>
                    <option>Web Development</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cu-message" className={labelClass}>Your Message</label>
                  <textarea id="cu-message" required rows={5} placeholder="Tell us about your project vision..." className={textareaClass} />
                </div>

                <button disabled={isSubmitting} className={`${btnPrimary} w-full`}>
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      Book Now
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
