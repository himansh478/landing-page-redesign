import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Users, Target, Shield, Zap } from 'lucide-react';

const values = [
  { icon: Target, color: 'text-pink-500', title: 'Our Mission', text: 'To provide budget-friendly, professional-standard creative solutions that empower businesses worldwide.' },
  { icon: Users, color: 'text-indigo-500', title: 'Who We Are', text: 'A diverse team of videographers, developers, and AI enthusiasts driving modern digital transformation.' },
  { icon: Shield, color: 'text-purple-500', title: 'Trust & Integrity', text: "We value our clients' intellectual property and guarantee discretion and security in all our projects." },
  { icon: Zap, color: 'text-orange-500', title: 'Innovation', text: 'Leveraging cutting-edge AI and the latest web technologies to deliver lightning-fast, premium results.' },
];

export function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* bg blobs */}
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
            {values.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white/80 border border-slate-200 p-6 rounded-xl flex items-start gap-4 hover:scale-[1.02] hover:shadow-lg transition-all">
                  <Icon className={`${item.color} w-8 h-8 flex-shrink-0`} />
                  <div>
                    <h3 className="text-slate-900 font-bold mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-sm">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
