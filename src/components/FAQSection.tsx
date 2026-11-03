import { ArrowUpRight } from 'lucide-react';
import { RevealLines } from './motion/RevealLines';

const faqs = [
  {
    q: "What is Cwaya's standard turnaround time?",
    a: 'We deliver studio-grade edits in as little as 3-4 hours for urgent projects. Standard turnaround is typically 24-48 hours depending on the complexity.',
  },
  {
    q: 'Do you offer on-location shoots outside of Madhya Pradesh?',
    a: 'Yes, we offer Pan-India travel. Our team regularly travels for high-end wedding, corporate, and commercial shoots across major cities in India.',
  },
  {
    q: 'How does the AI Photo Sharing system work?',
    a: "It's simple: Enter the event code, upload a selfie, and our AI instantly finds all your photos from the thousands taken at the event using advanced face recognition.",
  },
  {
    q: 'Can I get a custom package for my brand?',
    a: "Absolutely. While we have standard tiers, we specialize in building custom 'Investment Architectures' tailored specifically to your brand's growth needs.",
  },
];

// Native <details>: works without JavaScript, is keyboard-accessible by
// default, and the shared `name` makes it a one-open-at-a-time accordion
// in current browsers. Open/close styling lives in globals.css (.faq-*).
export function FAQSection() {
  return (
    <section className="bg-paper py-24 sm:py-32 border-t border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 lg:sticky lg:top-32 self-start">
          <p className="slate slate-mark text-editorial mb-5">Sc.05 — Inquiries</p>
          <RevealLines
            as="h2"
            className="font-display text-ink [font-size:clamp(2.25rem,1.2rem+3.4vw,4.5rem)]"
            lines={['Common', 'inquiries']}
          />
          <p className="text-lg text-ink/70 leading-relaxed mt-6 max-w-sm">
            Everything you need to know about the Cwaya ecosystem and our production lifecycle.
          </p>
          <a
            href="https://wa.me/918120317074"
            target="_blank"
            rel="noopener noreferrer"
            className="pencil-link inline-flex items-center gap-1.5 mt-8 font-semibold text-ink"
          >
            Ask us on WhatsApp
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        <div className="lg:col-span-7 lg:col-start-6 border-t border-ink/20">
          {faqs.map((faq, i) => (
            <details key={faq.q} name="faq" className="faq-item group border-b border-ink/20">
              <summary className="faq-summary flex items-start gap-5 sm:gap-8 py-6 sm:py-7 pl-3 cursor-pointer select-none">
                <span className="slate text-ink/45 pt-2 w-10 flex-shrink-0">Q.{String(i + 1).padStart(2, '0')}</span>
                <h3 className="flex-1 font-display text-lg sm:text-xl font-semibold text-ink tracking-[-0.01em] transition-colors duration-300 group-hover:text-editorial">
                  {faq.q}
                </h3>
                <span aria-hidden="true" className="relative w-6 h-6 mt-1 flex-shrink-0">
                  <span className="absolute left-0 right-0 top-1/2 h-[2px] -mt-px bg-ink" />
                  <span className="faq-plus-v absolute top-0 bottom-0 left-1/2 w-[2px] -ml-px bg-ink transition-transform duration-500 ease-reveal" />
                </span>
              </summary>
              {/* Indent = summary pl-3 + 2.5rem label + gap, so answers line up under the question */}
              <div className="faq-answer pb-7 pl-[4.5rem] sm:pl-[5.25rem] pr-10">
                <p className="text-ink/75 leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
