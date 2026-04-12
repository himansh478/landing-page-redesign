import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function TermsConditionsPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-200/30 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-200/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">
              Terms & <span className="text-gradient">Conditions</span>
            </h1>
            <p className="text-slate-500 font-light italic">Last updated: April 5, 2026</p>
          </div>

          <div className="bg-white/80 border border-slate-200 p-8 rounded-2xl space-y-8 text-slate-600 leading-relaxed shadow-sm">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing our website at Cwaya, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on Cwaya's website for personal, non-commercial transitory viewing only.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Modify or copy the materials.</li>
                <li>Use the materials for any commercial purpose.</li>
                <li>Attempt to decompile or reverse engineer any software contained on Cwaya's website.</li>
                <li>Remove any copyright or other proprietary notations from the materials.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Disclaimer</h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p>
                  The materials on Cwaya's website are provided on an 'as is' basis. Cwaya makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitations</h2>
              <p>
                In no event shall Cwaya or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Cwaya's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at: <strong className="text-slate-800">hello@socialshiva.com</strong>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
