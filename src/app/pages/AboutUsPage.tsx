import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Users, Target, Shield, Zap } from 'lucide-react';

export function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-200/30 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-200/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
              About <span className="text-gradient">Cwaya</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
              We are a team of visionary creatives and technical experts dedicated to transforming ideas into digital realities.
            </p>
          </div>

          <div className="bg-white/80 border border-slate-200 p-8 rounded-2xl mb-12 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-4">Our Story</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Born from a passion for storytelling and technological innovation, Cwaya started as a small creative studio. Today, we stand as a powerhouse delivering premium video editing, professional shoots, web development, and AI solutions. Our mission is to democratize high-end digital services securely, transparently, and affordably.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We believe in the power of visual communication and robust digital infrastructure. Whether you are a startup needing a digital presence or a creator needing masterful editing, our expertise ensures your success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/80 border border-slate-200 p-6 rounded-xl flex items-start gap-4 hover:scale-[1.02] hover:shadow-lg transition-all">
              <Target className="text-pink-500 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-slate-900 font-bold mb-2">Our Mission</h3>
                <p className="text-slate-500 text-sm">To provide budget-friendly, professional-standard creative solutions that empower businesses worldwide.</p>
              </div>
            </div>
            <div className="bg-white/80 border border-slate-200 p-6 rounded-xl flex items-start gap-4 hover:scale-[1.02] hover:shadow-lg transition-all">
              <Users className="text-indigo-500 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-slate-900 font-bold mb-2">Who We Are</h3>
                <p className="text-slate-500 text-sm">A diverse team of videographers, developers, and AI enthusiasts driving modern digital transformation.</p>
              </div>
            </div>
            <div className="bg-white/80 border border-slate-200 p-6 rounded-xl flex items-start gap-4 hover:scale-[1.02] hover:shadow-lg transition-all">
              <Shield className="text-purple-500 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-slate-900 font-bold mb-2">Trust & Integrity</h3>
                <p className="text-slate-500 text-sm">We value our clients' intellectual property and guarantee discretion and security in all our projects.</p>
              </div>
            </div>
            <div className="bg-white/80 border border-slate-200 p-6 rounded-xl flex items-start gap-4 hover:scale-[1.02] hover:shadow-lg transition-all">
              <Zap className="text-orange-500 w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-slate-900 font-bold mb-2">Innovation</h3>
                <p className="text-slate-500 text-sm">Leveraging cutting-edge AI and the latest web technologies to deliver lightning-fast, premium results.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
