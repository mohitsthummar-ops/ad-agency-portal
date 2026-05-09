import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function About() {
    return (
        <div className="pt-12 pb-24 px-4 max-w-5xl mx-auto relative">
            {/* Light elegant background accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-40 left-0 w-72 h-72 bg-pink-50 rounded-full blur-3xl opacity-60 pointer-events-none transform -translate-x-1/2"></div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">AdAgency</span>
                    </h1>
                    <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
                        We're a full-service digital advertising portal helping brands reach their audience smarter and faster.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16">
                    {[
                        { title: 'Our Mission', text: 'To democratize digital advertising by giving businesses of all sizes access to smart, data-driven campaign management tools.' },
                        { title: 'Our Vision', text: 'A world where every brand, big or small, can run powerful ad campaigns with precision targeting and real-time analytics.' },
                        { title: 'What We Do', text: 'We provide a centralized platform to create, manage, track, and optimize ad campaigns across multiple platforms and categories.' },
                        { title: 'Our Values', text: 'Transparency, innovation, client-centricity, and measurable results guide everything we build and every campaign we run.' },
                    ].map(({ title, text }, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={title}
                            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">{text}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-50 border border-slate-200 shadow-sm rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-pink-500/5"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight">Ready to Work With Us?</h2>
                        <p className="text-slate-600 mb-8 max-w-lg mx-auto font-medium text-lg">Start your first campaign today — no setup fees, no contracts.</p>
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] text-lg">
                            Get Started Free
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
