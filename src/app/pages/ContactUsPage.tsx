import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

import { Turnstile } from '@marsidev/react-turnstile';

const fieldClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-medium";

// contact info cards
const contactInfo = [
  {
    icon: Mail, label: 'Email Us', color: 'indigo',
    value: 'Sudhanshugour89@gmail.com', href: 'mailto:Sudhanshugour89@gmail.com'
  },
  {
    icon: Phone, label: 'Call Us', color: 'purple',
    value: '+91 81203 17031', href: 'tel:+918120317031'
  },
  {
    icon: MapPin, label: 'Visit Us', color: 'pink',
    value: 'Indore–Bhopal Road, Near Bus Stand\nSehore – 466001, MP, India'
  },
];

import { Helmet } from 'react-helmet-async';

export function ContactUsPage() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Honeypot check (Bots fill hidden fields, humans don't)
    const fd = new FormData(e.currentTarget);
    if (fd.get('website_url')) {
      console.warn('Bot detected via honeypot');
      return;
    }

    if (!turnstileToken) {
      alert('Please complete the CAPTCHA check.');
      return;
    }

    setFormState('loading');

    try {
      const { error } = await supabase.from('querries').insert([{
        full_name: fd.get('name') as string,
        email: fd.get('email') as string,
        subject: fd.get('subject') as string,
        message: fd.get('message') as string,
      }]);

      if (error) {
        console.error('DB insert error:', error);
        setFormState('error');
      } else {
        setFormState('success');
        (e.target as HTMLFormElement).reset();
        setTurnstileToken(null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setFormState('error');
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <Helmet>
        <title>Contact Us — Cwaya Creative Studio</title>
        <meta name="description" content="Get in touch with Cwaya for premium video editing, photography, and technical solutions. We are ready to bring your vision to life." />
        <link rel="canonical" href="https://www.cwaya.me/contact" />
      </Helmet>
      <Header />
      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* bg blobs */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-200/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-200/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Contact <span className="text-gradient">Us</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-light max-w-3xl mx-auto leading-relaxed">
              Have a project in mind? Reach out and let's create something extraordinary together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* left side: contact info + social */}
            <div className="space-y-10">
              <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-xl shadow-slate-200/50">
                <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Get in Touch</h2>
                <div className="space-y-8">
                  {contactInfo.map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-start gap-6 group">
                        <div className={`w-14 h-14 bg-${item.color}-50 border border-${item.color}-100 rounded-2xl flex items-center justify-center text-${item.color}-500 group-hover:bg-${item.color}-600 group-hover:text-white transition-all duration-300 shadow-sm`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-slate-900 font-bold text-lg mb-1">{item.label}</h3>
                          {item.href ? (
                            <a href={item.href} className="text-slate-500 font-medium hover:text-indigo-600 transition-colors">
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-slate-500 font-medium leading-relaxed whitespace-pre-line">
                              {item.value}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 rounded-3xl text-white shadow-2xl shadow-indigo-500/20">
                <h3 className="text-2xl font-black mb-4 tracking-tight">Connect Digitally</h3>
                <p className="text-indigo-100 font-light text-lg mb-6">Follow us on Instagram and YouTube for the latest updates and behind-the-scenes content.</p>
                <a
                  href="https://www.instagram.com/creative_shiva_01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >Follow Now</a>
              </div>
            </div>

            {/* right side: contact form */}
            <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-xl shadow-slate-200/50">
              {formState === 'success' ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-20">
                  <CheckCircle className="w-20 h-20 text-green-500" />
                  <h3 className="text-3xl font-black text-slate-900">Message Sent!</h3>
                  <p className="text-slate-500 text-lg">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setFormState('idle')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Send Another</button>
                </div>
              ) : (
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-slate-800 font-bold tracking-tight">Full Name</label>
                      <input required type="text" name="name" className={fieldClass} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-800 font-bold tracking-tight">Email Address</label>
                      <input required type="email" name="email" className={fieldClass} placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-slate-800 font-bold tracking-tight">Subject</label>
                    <input required type="text" name="subject" className={fieldClass} placeholder="Project Inquiry" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-slate-800 font-bold tracking-tight">How can we help?</label>
                    <textarea required name="message" rows={5} className={fieldClass + " resize-none"} placeholder="Tell us about your project or vision..." />
                  </div>

                  {/* Honeypot field (hidden from humans) */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Cloudflare Turnstile CAPTCHA */}
                  <div className="flex justify-center py-2">
                    <Turnstile 
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                      onSuccess={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                    />
                  </div>

                  {formState === 'error' && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm font-medium">Something went wrong. Please try again or email us directly.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formState === 'loading'}
                    className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formState === 'loading' ? (
                      <><Loader className="w-5 h-5 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-6 h-6" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
