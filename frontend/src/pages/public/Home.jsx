import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    Zap, ArrowRight, ChevronRight, Monitor, ShoppingBag, GraduationCap,
    Plane, Utensils, Heart, Dumbbell, Film, Package,
    TrendingUp, Users, Star, BarChart3
} from 'lucide-react';

const categories = [
    { icon: Monitor, label: 'Electronics', color: '#3b82f6', bg: '#eff6ff' },
    { icon: ShoppingBag, label: 'Fashion', color: '#ec4899', bg: '#fdf2f8' },
    { icon: GraduationCap, label: 'Education', color: '#06b6d4', bg: '#ecfeff' },
    { icon: Plane, label: 'Travel', color: '#f59e0b', bg: '#fffbeb' },
    { icon: Utensils, label: 'Food', color: '#ef4444', bg: '#fef2f2' },
    { icon: Heart, label: 'Health', color: '#22c55e', bg: '#f0fdf4' },
    { icon: Dumbbell, label: 'Sports', color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: Film, label: 'Entertainment', color: '#ea580c', bg: '#fff7ed' },
    { icon: Package, label: 'Others', color: '#64748b', bg: '#f8fafc' },
];

const stats = [
    { icon: Users, value: '50+', label: 'Active Clients' },
    { icon: TrendingUp, value: '100+', label: 'Campaigns Run' },
    { icon: Star, value: '4.9★', label: 'Avg. Rating' },
    { icon: BarChart3, value: '10k+', label: 'Revenue Generated' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55, ease: 'easeOut' } }),
};

function AnimatedSection({ children, className = '' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    // On initial render (or if intersection observer fails on some hosts), ensure
    // the section still becomes visible instead of staying hidden.
    const shouldShow = inView || ref.current === null;

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={shouldShow ? 'visible' : 'hidden'}
            className={className}
        >
            {children}
        </motion.div>
    );
}


export default function Home() {
    return (
        <div className="overflow-x-hidden">
            {/* ─── HERO ───────────────────────────────────────────── */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-24">
                {/* Decorative subtle orbs */}
                <div className="orb orb-purple w-96 h-96 top-10 -left-20" />
                <div className="orb orb-pink w-72 h-72 top-40 right-10" />

                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium mb-8 shadow-sm"
                    >
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        The Future of Ad Management is Here
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.15] mb-6 tracking-tight"
                    >
                        Power Your Brand With{' '}
                        <span className="gradient-text block mt-2">Smart Advertising</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-slate-600 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Create, manage, and track your advertisement campaigns with unprecedented precision. Reach your audience effortlessly.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            to="/register"
                            className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl text-white font-semibold btn-glow text-base"
                        >
                            Get Started Free <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/about"
                            className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl text-slate-700 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-700 shadow-sm transition-all text-base font-semibold"
                        >
                            Learn More <ChevronRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ─── STATS ──────────────────────────────────────────── */}
            <section className="py-16 px-4 bg-white border-y border-slate-100">
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map(({ icon: Icon, value, label }, i) => (
                        <AnimatedSection key={label}>
                            <motion.div
                                custom={i}
                                variants={fadeUp}
                                className="flex flex-col items-center text-center p-6"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                                    <Icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">{value}</p>
                                <p className="text-slate-500 font-medium">{label}</p>
                            </motion.div>
                        </AnimatedSection>
                    ))}
                </div>
            </section>

            {/* ─── CATEGORIES ─────────────────────────────────────── */}
            <section id="categories" className="py-24 px-4 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-16">
                        <motion.div variants={fadeUp}>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                                Browse <span className="text-blue-600">Industries</span>
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                                Discover campaigns spanning multiple categories. We have robust tools designed for every market segment.
                            </p>
                        </motion.div>
                    </AnimatedSection>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {categories.map(({ icon: Icon, label, color, bg }, i) => (
                            <AnimatedSection key={label}>
                                <motion.div
                                    custom={i}
                                    variants={fadeUp}
                                >
                                    <Link
                                        to="/register"
                                        className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all card-hover group"
                                    >
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                                            style={{ backgroundColor: bg }}
                                        >
                                            <Icon className="w-7 h-7" style={{ color }} />
                                        </div>
                                        <span className="text-slate-700 font-semibold text-sm text-center group-hover:text-blue-700 transition-colors">{label}</span>
                                    </Link>
                                </motion.div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA BANNER ─────────────────────────────────────── */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection>
                        <motion.div
                            variants={fadeUp}
                            className="relative overflow-hidden rounded-[2rem] p-12 md:p-16 text-center bg-blue-900 shadow-2xl"
                        >
                            {/* Inner abstract shapes to make the dark box pop slightly */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[2rem] pointer-events-none">
                                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                    Ready to Launch Your Campaign?
                                </h2>
                                <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
                                    Join thousands of clients who trust AdAgency Portal to power their advertising strategy and maximize return on investment.
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-blue-900 bg-white hover:bg-slate-50 font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                >
                                    Get Started Now <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatedSection>
                </div>
            </section>
        </div>
    );
}
