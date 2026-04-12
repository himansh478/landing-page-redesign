import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 text-center">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-gradient mb-8"
                >
                    404
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Page Not Found
                    </h2>

                    <p className="text-xl text-slate-500 font-light max-w-md mx-auto mb-12 leading-relaxed">
                        Oops! The page you're looking for doesn't exist or has been moved to another dimension.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="group relative inline-flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" />
                        <span>Go Back Home</span>
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
