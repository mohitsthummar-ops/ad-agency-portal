import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, MousePointerClick, Users, IndianRupee
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    AreaChart, Area
} from 'recharts';
import { adminAPI } from '../../services/api';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-xs z-50">
            <p className="text-slate-500 mb-2 font-medium">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    {p.name}: <span className="text-slate-900 font-bold ml-auto">{p.value?.toLocaleString()}</span>
                </p>
            ))}
        </div>
    );
};

const clickData = [
    { date: '15 Feb', clicks: 820, views: 4200 },
    { date: '16 Feb', clicks: 1100, views: 5300 },
    { date: '17 Feb', clicks: 980, views: 4900 },
    { date: '18 Feb', clicks: 1450, views: 6100 },
    { date: '19 Feb', clicks: 1280, views: 5700 },
    { date: '20 Feb', clicks: 1700, views: 7200 },
    { date: '21 Feb', clicks: 1920, views: 8100 },
];

const revenueData = [
    { month: 'Sep', revenue: 45000 },
    { month: 'Oct', revenue: 67000 },
    { month: 'Nov', revenue: 89000 },
    { month: 'Dec', revenue: 120000 },
    { month: 'Jan', revenue: 98000 },
    { month: 'Feb', revenue: 145000 },
];

const topAds = [
    { name: 'iPhone 16 Launch', clicks: 3420, ctr: 8.2 },
    { name: 'Summer Fashion Sale', clicks: 2810, ctr: 7.1 },
    { name: 'MBA Course 2025', clicks: 2390, ctr: 6.4 },
    { name: 'Maldives Trip Package', clicks: 1950, ctr: 5.8 },
    { name: 'Sports Nutrition', clicks: 1620, ctr: 5.1 },
];

export default function Analytics() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1 tracking-tight">
                    <BarChart3 className="w-6 h-6 text-cyan-500" /> Analytics
                </h1>
                <p className="text-slate-600 text-sm font-medium">Platform performance across all campaigns and users.</p>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: MousePointerClick, value: '14.2K', label: 'Total Clicks (7d)', color: '#6366f1' },
                    { icon: TrendingUp, value: '62.8K', label: 'Total Views (7d)', color: '#ec4899' },
                    { icon: Users, value: '1,482', label: 'Active Users', color: '#06b6d4' },
                    { icon: IndianRupee, value: '₹1.45L', label: 'Revenue (Feb)', color: '#22c55e' },
                ].map(({ icon: Icon, value, label, color }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-slate-100" style={{ background: `${color}15` }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
                        <p className="text-slate-500 text-sm font-medium mt-1">{label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Click & View Trend */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                <h3 className="text-slate-800 font-bold mb-6">Click & View Trend (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={clickData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Area type="monotone" dataKey="views" name="Views" stroke="#06b6d4" fill="url(#gradViews)" strokeWidth={3} />
                        <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#6366f1" fill="url(#gradClicks)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Revenue + Top Ads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Bar Chart */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                    <h3 className="text-slate-800 font-bold mb-6">Monthly Revenue (₹)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={revenueData} barSize={32} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                            <Bar dataKey="revenue" name="Revenue (₹)" radius={[6, 6, 0, 0]} fill="#22c55e" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Performing Ads */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col">
                    <h3 className="text-slate-800 font-bold mb-6">Top Performing Ads</h3>
                    <div className="space-y-4 flex-1">
                        {topAds.map((ad, i) => (
                            <div key={ad.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200 shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 text-sm font-bold truncate">{ad.name}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                            <div className="h-full rounded-full bg-indigo-500 shadow-sm"
                                                style={{ width: `${(ad.clicks / 3420) * 100}%` }} />
                                        </div>
                                        <span className="text-slate-500 text-xs font-medium shrink-0">{ad.clicks.toLocaleString()} clicks</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-medium text-slate-400 capitalize mb-0.5">CTR</p>
                                    <span className="text-sm font-bold text-emerald-600">{ad.ctr}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
