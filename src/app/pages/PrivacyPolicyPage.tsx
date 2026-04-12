import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-200/30 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-200/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-slate-500 font-light italic">Last updated: April 5, 2026</p>
          </div>

          <div className="bg-white/80 border border-slate-200 p-8 rounded-2xl space-y-8 text-slate-600 leading-relaxed shadow-sm">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p>
                Welcome to Cwaya. We value your privacy and are committed to protecting your personal data. This privacy policy informs you how we look after your personal data when you visit our website and tells you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. The Data We Collect</h2>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li><strong className="text-slate-800">Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong className="text-slate-800">Contact Data</strong> includes email address and telephone numbers.</li>
                <li><strong className="text-slate-800">Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
                <li><strong className="text-slate-800">Usage Data</strong> includes information about how you use our website, products and services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Cookies and Third-Party Advertising</h2>
              <p>
                Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site.
              </p>
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mt-6">
                <p className="text-slate-800 font-semibold mb-2">Google AdSense & DoubleClick Cookie</p>
                <p className="text-sm">
                  Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the advertising cookie enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Ad Settings</a>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. How We Use Your Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide our services, manage our relationship with you, and improve our website performance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact our data privacy manager at: <strong className="text-slate-800">hello@socialshiva.com</strong>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
