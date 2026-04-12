import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Phone, CheckCircle2, Video, Camera, Clock, CalendarDays, HelpCircle, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const CONTACT_NUMBER = "8120317074";
const WHATSAPP_LINK = `https://wa.me/+91${8120317074}`;

const pricingPlans = [
    {
        title: "Single Reel",
        price: "Rs 2500/-",
        subtitle: "Per REEL",
        features: [
            "We Shoot it.",
            "On your Given Location",
            "Get Reel After 3hr of Shoot",
            "Normal Level editing",
            "Its a combo pack of 1 Reels"
        ],
        icon: Video,
        color: "from-blue-500 to-cyan-500",
        shadow: "shadow-[0_0_15px_rgba(56,189,248,0.3)]"
    },
    {
        title: "1 Professional Reel",
        price: "Rs 3000/-",
        subtitle: "per/reel",
        features: [
            "We Shoot it",
            "Best Quality & Editing",
            "Get Reel After 3to4hr of shoot",
            "Professional transition or Sfx",
            "More Than 1 Reel 10% off on total amount"
            ],
        icon: Camera,
        color: "from-purple-500 to-pink-500",
        shadow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
        featured: true
    },
    {
        title: "best pack",
        price: "Rs 13,999/-",
        subtitle: "Shoot & edit Price",
        features: [
            "handle your social media account",
            "upload 2 video in a week",
            "3 posts in a week ",
            "2 time shoot in a month on your location"
        ],
        icon: Clock,
        color: "from-emerald-500 to-teal-500",
        shadow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]"
    },
    {
        title: "1 DAY Charge",
        price: "Rs 3000/-",
        subtitle: "Only Shoot Price",
        features: [
            "Editing Charge Exclude",
            "Travel Exclude",
            "Charges Extend When Time Extend",
            "Beneficial For Wedding or Event"
        ],
        icon: Clock,
        color: "from-emerald-500 to-teal-500",
        shadow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]"
    },
    {
        title: "grand pack",
        price: "Rs 12,999/-",
        subtitle: "Monthly Subscription",
        features: [
            "We Shoot it.",
            "On your Given Location",
            "1 Cinematic Video Free",
            "Festival Banner Include",
            "10 Reels In 1 Month"
        ],
        icon: CalendarDays,
        color: "from-orange-500 to-red-500",
        shadow: "shadow-[0_0_15px_rgba(249,115,22,0.3)]"
    }
];

const faqs = [
    {
        q: "How soon can I get my edited video?",
        a: "Depending on the package, you can get your video in as little as 3-4 hours after the shoot!"
    },
    {
        q: "Do you travel for shoots?",
        a: "Yes, we travel to your location. Travel charges may apply depending on the package."
    },
    {
        q: "Can I get a custom package?",
        a: "Absolutely! We can tailor a package specific to your needs. Just book a discovery call."
    }
];

export function PackagesPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.05)_0%,transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none" />

            <Header />

            <main className="pt-24 pb-20">
                {/* Hero Section */}
                <section className="relative px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto text-center">
                    <motion.a
                        href="/"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-0 left-4 sm:left-8 mt-4 inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold">Back to Home</span>
                    </motion.a>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-8">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm font-black text-emerald-700 tracking-wide uppercase">Creative_Shiva_07 - Pan India Travel Available</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-none text-slate-900">
                            Bring Your <span className="text-gradient">Vision</span> to Life
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                            Premium Video Production for Brands who want to stand out. Weddings, Reels, Cinematic Events & much more.
                        </p>

                        <motion.a
                            href={WHATSAPP_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative inline-flex items-center justify-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95"
                        >
                            <Phone className="w-6 h-6" />
                            <span>Call Me: {8120317074}</span>
                        </motion.a>
                    </motion.div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">Our <span className="text-gradient">Pricing</span></h2>
                        <p className="text-slate-500 font-light text-lg">Professional packages for every production scale.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {pricingPlans.map((plan, index) => {
                            const Icon = plan.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    className={`bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden flex flex-col shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group ${plan.featured ? 'border-indigo-500/50 ring-4 ring-indigo-500/5' : ''}`}
                                >
                                    {plan.featured && (
                                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-2xl uppercase">
                                            POPULAR
                                        </div>
                                    )}
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{plan.title}</h3>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-4xl font-black text-slate-900 leading-none">{plan.price.split('/')[0]}</span>
                                        <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">{plan.price.includes('/') ? '/' + plan.price.split('/')[1] : '/-'}</span>
                                    </div>
                                    <div className="text-xs font-bold text-indigo-500/70 mb-8 tracking-widest uppercase">{plan.subtitle}</div>
                                    
                                    <ul className="space-y-4 mb-10 flex-grow">
                                        {plan.features.map((feature, fIndex) => (
                                            <li key={fIndex} className="flex items-start gap-4 text-slate-600 group/item">
                                                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-emerald-500 transition-colors">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover/item:text-white transition-colors" />
                                                </div>
                                                <span className="text-sm font-medium leading-tight group-hover/item:text-slate-900 transition-colors">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <motion.a
                                        href={WHATSAPP_LINK}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full py-4 rounded-2xl font-black text-center transition-all bg-slate-900 hover:bg-indigo-600 text-white shadow-xl shadow-slate-200/50 hover:shadow-indigo-500/30 uppercase tracking-widest text-xs`}
                                    >
                                        Select Package
                                    </motion.a>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* What I can do for You section */}
                <section className="px-4 sm:px-6 lg:px-8 py-32 bg-slate-900 relative z-10 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-transparent pointer-events-none" />
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tight">What I Can Do <span className="text-indigo-400">For You</span></h2>
                            <p className="text-xl text-slate-300 font-light mb-12 leading-relaxed">
                                I provide full-spectrum cinematography and editing. Whether it's a high-octane automotive reel or a cinematic wedding story, I bring a unique vision to every frame.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 mb-14">
                                {['Car Delivery', 'Events', 'Business Promo', 'Wedding', 'Cinematic'].map((tag, i) => (
                                    <span key={i} className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-bold border border-white/10 text-white uppercase tracking-widest">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <motion.a
                                href={WHATSAPP_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-2xl text-xl font-black hover:bg-slate-100 transition-all shadow-2xl active:scale-95"
                            >
                                Book Your Session
                            </motion.a>
                        </motion.div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="px-4 sm:px-6 lg:px-8 py-32 max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl font-black mb-4 tracking-tight">Common <span className="text-gradient">Questions</span></h2>
                        <p className="text-slate-500 font-light text-lg">Everything you need to know before we start filming.</p>
                    </motion.div>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="mt-1 w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors duration-300">
                                        <HelpCircle className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black mb-3 tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">{faq.q}</h3>
                                        <p className="text-slate-500 text-lg font-light leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-24 text-center">
                        <motion.a
                            href={WHATSAPP_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-4 bg-indigo-600 text-white px-10 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            Start Project Together
                        </motion.a>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
