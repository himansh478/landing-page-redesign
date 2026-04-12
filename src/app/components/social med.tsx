import { motion } from 'motion/react';
import { ArrowLeft, BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function SocialMediaManagementPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 transition-colors font-semibold group"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl sm:text-7xl font-black text-slate-900 mb-6 tracking-tight">
              Social Media <span className="text-gradient">Management</span>
            </h1>
            <p className="text-xl text-slate-500 font-light max-w-3xl mx-auto">
              Strategic growth, automated posting schedules, community engagement, and data-driven analytics.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                title: 'Content Strategy',
                description: 'Custom content calendars tailored to your brand voice and audience growth goals.'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Scheduling',
                description: 'Optimal timing across all platforms for maximum reach and viral potential.'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Engagement',
                description: 'Proactive community management, DM automation, and real-time audience interaction.'
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Analytics',
                description: 'Comprehensive performance reports with actionable insights to scale your presence.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
              >
                <div className="inline-flex p-4 rounded-2xl bg-indigo-50 text-indigo-600 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-lg font-light leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 active:scale-95">
              Launch Your Social Growth
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}