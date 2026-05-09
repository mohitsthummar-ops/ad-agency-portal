import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, LogIn, UserPlus, LayoutDashboard, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/campaign-templates', label: 'Campaign Templates' },
    { to: '/contact', label: 'Contact' },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, isAdmin, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => setMenuOpen(false), [location]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm'
                : 'bg-white/50 backdrop-blur-md'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-lg transition-all">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-xl text-blue-900 tracking-tight">AdAgency</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === link.to
                                    ? 'text-blue-700 bg-blue-50'
                                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate(isAdmin() ? '/admin' : '/dashboard')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium btn-glow text-white shadow-md shadow-blue-500/20"
                            >
                                {isAdmin() ? <Shield className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                                {isAdmin() ? 'Admin Panel' : 'Dashboard'}
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all"
                                >
                                    <LogIn className="w-4 h-4" /> Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium btn-glow text-white shadow-md shadow-blue-500/20"
                                >
                                    <UserPlus className="w-4 h-4" /> Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-200 bg-white shadow-lg overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-3 border-t border-slate-100 space-y-2">
                                {isAuthenticated ? (
                                    <button
                                        onClick={() => navigate(isAdmin() ? '/admin' : '/dashboard')}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium btn-glow text-white"
                                    >
                                        {isAdmin() ? 'Admin Panel' : 'Go to Dashboard'}
                                    </button>
                                ) : (
                                    <>
                                        <Link to="/login" className="block px-4 py-2.5 text-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                                            Login
                                        </Link>
                                        <Link to="/register" className="block px-4 py-2.5 text-center rounded-lg text-sm font-medium btn-glow text-white">
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
