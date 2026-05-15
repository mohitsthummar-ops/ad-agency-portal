import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Megaphone, Tag, BarChart3,
    Settings, Menu, X, LogOut, Shield, Bell, ClipboardList, Zap
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/ads', label: 'Ads Management', icon: Megaphone },
    { to: '/admin/ad-requests', label: 'Ad Requests', icon: ClipboardList },
    { to: '/admin/subscription-plans', label: 'Subscription Plans', icon: Zap },
    { to: '/admin/categories-platforms', label: 'Categories & Platforms', icon: Tag },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
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
            <aside
                className={`
          fixed top-0 left-0 h-full z-50 w-64 md:relative md:translate-x-0
          flex flex-col transition-transform duration-300 border-r border-slate-200 bg-white
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        `}
            >
                {/* Brand */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo.jpg"
                            alt="Ads Agency Logo"
                            className="h-9 w-auto object-contain"
                        />
                        <div>
                            <span style={{ fontFamily: "'Playfair Display', serif" }} className="font-bold text-slate-800 text-sm">Admin Panel</span>
                            <p className="text-[10px] text-slate-500 font-medium tracking-wide">Ads Agency Platform</p>
                        </div>
                    </div>
                    <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Admin info */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-800 text-sm font-semibold truncate">{user?.name}</p>
                            <span className="badge badge-admin text-[10px] mt-0.5">Administrator</span>
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
            </aside>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10 sticky top-0">
                    <button className="md:hidden text-slate-500 hover:text-blue-600 transition-colors" onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                        <Shield className="w-4.5 h-4.5 text-blue-600" />
                        <span className="text-slate-600 font-medium text-sm">Admin Dashboard</span>
                    </div>
                    <div className="flex-1" />
                    <button className="p-2.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
