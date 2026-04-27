import { motion } from 'motion/react';

const brands = [
  'Believe in quality of work',
  'client satisfaction',
  'smooth editing',
  'Professional work flow',
  'quality work',
  'punctuality',
];

// stat cards data
const stats = [
  { value: '500+', label: 'Happy Clients', colors: 'from-cyan-500 to-blue-600', bg: 'from-cyan-100/50 to-blue-100/50' },
  { value: '200+', label: 'Projects Delivered', colors: 'from-purple-500 to-pink-600', bg: 'from-purple-100/50 to-pink-100/50' },
  { value: '100%', label: 'Quality Work', colors: 'from-emerald-500 to-teal-600', bg: 'from-emerald-100/50 to-teal-100/50' },
  { value: '100%', label: 'Satisfaction Rate', colors: 'from-rose-500 to-red-600', bg: 'from-rose-100/50 to-red-100/50' },
];

export function ClientWall() {
  return (
    <section className="relative py-16 sm:py-24 bg-deep-space overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-2 sm:mb-4 tracking-tight px-2">
            More <span className="text-gradient">About Us</span>
          </h2>
          <p className="text-sm sm:text-lg text-slate-500 font-light px-2">
            Regarding our clients and their experience with us. We have worked with a wide range of clients across various industries.
          </p>
        </motion.div>

        {/* scrolling marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden py-8 sm:py-12 border-t border-b border-slate-200 glass-panel-light my-8 rounded-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8fafc] via-transparent to-[#f8fafc] z-20 pointer-events-none" />
          <div className="flex animate-marquee">
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-4 sm:mx-8 text-sm sm:text-lg font-semibold text-slate-400 hover:text-indigo-600 transition-colors duration-300"
              >
                ✦ {brand}
              </div>
            ))}
          </div>
        </motion.div>

        {/* stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16 card-3d-wrap perspective-1000"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, translateZ: 20 }}
              className="relative group bg-white/80 border border-slate-200 card-3d rounded-xl p-6 transition-all shadow-sm hover:shadow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.bg} opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className={`text-2xl sm:text-4xl font-black bg-gradient-to-r ${stat.colors} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-base text-slate-600 font-light">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
