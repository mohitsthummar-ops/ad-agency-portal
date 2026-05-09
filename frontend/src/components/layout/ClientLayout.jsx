import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, User, CreditCard, Menu, X, Zap, LogOut, Bell,
    Megaphone, ClipboardList, Package, Receipt, LayoutTemplate
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import SubscriptionBanner from '../SubscriptionBanner';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/my-requests', label: 'My Campaign Requests', icon: ClipboardList },
    { to: '/dashboard/request-ad', label: 'Create Campaign', icon: Megaphone },
    { to: '/dashboard/subscription', label: 'My Subscription', icon: Package },
    { to: '/dashboard/payment-history', label: 'Payment History', icon: Receipt },
    { to: '/dashboard/campaign-templates', label: 'Campaign Templates', icon: LayoutTemplate },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function ClientLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`
          fixed top-0 left-0 h-full z-50 w-64 md:relative md:translate-x-0
          bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:flex
        `}
            >
                {/* Brand */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-blue-900 text-lg tracking-tight">AdAgency</span>
                    </div>
                    <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User info */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-800 text-sm font-semibold truncate">{user?.name}</p>
                            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `nav-link text-sm ${isActive ? 'active' : ''}`
                            }
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="nav-link w-full text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10 sticky top-0">
                    <button
                        className="md:hidden text-slate-500 hover:text-blue-600 transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                    <button className="p-2.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
                    </button>
                </header>

                <SubscriptionBanner />
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
