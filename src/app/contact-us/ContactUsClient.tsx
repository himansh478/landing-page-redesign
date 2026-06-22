'use client';

import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Instagram, Youtube, Linkedin, Globe } from 'lucide-react';
import { useState } from 'react';

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
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Contact Info Side */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
              >
                <Globe className="w-3 h-3" />
                Global Presence
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-none"
              >
                Get in <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Touch.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-slate-500 font-light leading-relaxed mb-16 max-w-lg"
              >
                Have a vision? We have the tools. Let's collaborate and create something extraordinary together.
              </motion.p>

              <div className="space-y-12">
                {[
                  { icon: <Mail />, label: "Email Us", value: "Sudhanshugour89@gmail.com", href: "mailto:Sudhanshugour89@gmail.com" },
                  { icon: <Phone />, label: "Call Us", value: "+91 81203 17074", href: "tel:+918120317074" },
                  { icon: <MapPin />, label: "Location", value: "Indore-Bhopal Road, Sehore, MP, India", href: "https://maps.google.com" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-6 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                      <a href={item.href} className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                        {item.value}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-20 flex gap-4">
                {[
                  { icon: <Instagram />, href: "https://www.instagram.com/creative_shiva_01?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" },
                  { icon: <Youtube />, href: "https://youtube.com/@creativeshivavlogs?si=sIwTtBGWIiB3k7q1" },
                  { icon: <Linkedin />, href: "https://linkedin.com" },
                  { icon: <MessageCircle />, href: "https://chat.whatsapp.com/Ftagt0XUzkQI0zSfHZMXxI" },
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ scale: 1.1, y: -5 }}
                    href={social.href}
                    target="_blank"
                    className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Form Side */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 md:p-14 rounded-[60px] bg-white border border-slate-200 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10" />
                
                {submitted ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Send className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Message Received!</h2>
                    <p className="text-slate-500 font-light mb-8">Our team will get back to you within 24 hours.</p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-indigo-600 font-black text-xs uppercase tracking-widest"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                        <input required type="text" placeholder="John Doe" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                        <input required type="email" placeholder="john@example.com" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Service Required</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium">
                        <option>Video Editing</option>
                        <option>Professional Shoot</option>
                        <option>Social Media Management</option>
                        <option>Web Development</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Your Message</label>
                      <textarea required rows={5} placeholder="Tell us about your project vision..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium resize-none" />
                    </div>

                    <button
                      disabled={isSubmitting}
                      className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Book Now
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
