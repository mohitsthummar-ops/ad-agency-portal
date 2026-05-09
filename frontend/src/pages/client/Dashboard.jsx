import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Package, ClipboardList, Image, CalendarClock, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { subscriptionAPI, adRequestAPI } from '../../services/api';

function StatCard({ icon: Icon, value, label, color, sub }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden"
        >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl`} style={{ background: color }} />
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm" style={{ background: `${color}18` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1 relative z-10 tracking-tight">{value}</p>
            <p className="text-slate-500 text-sm font-medium relative z-10">{label}</p>
            {sub && <p className="text-slate-400 text-xs mt-1 relative z-10">{sub}</p>}
        </motion.div>
    );
}

export default function ClientDashboard() {
    const [subscription, setSubscription] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, reqRes] = await Promise.allSettled([
                    subscriptionAPI.getMy(),
                    adRequestAPI.getMyRequests(),
                ]);
                if (subRes.status === 'fulfilled') setSubscription(subRes.value.data.subscription);
                if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data.requests || []);
            } catch {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const isActive = subscription?.status === 'Active';
    const imagesLeft = isActive ? (subscription.imageLimit - subscription.imagesUsed) : 0;
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedCount = requests.filter(r => r.status === 'approved').length;

    const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
    }) : null;

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                    Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-slate-500 mt-1 font-medium">
                    {isActive ? `Subscription active – ${imagesLeft} AI image${imagesLeft !== 1 ? 's' : ''} remaining.` : 'No active subscription. Buy a package to get started.'}
                </p>
            </div>

            {/* Subscription Banner */}
            {!loading && !isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Get Started with a Package</p>
                            <p className="text-blue-100 text-sm">Choose a subscription to unlock AI ad image generation.</p>
                        </div>
                    </div>
                    <Link to="/dashboard/subscription"
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white text-blue-600 font-semibold text-sm whitespace-nowrap hover:bg-blue-50 transition-colors shadow-sm">
                        View Packages <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            )}

            {/* Stats */}
            {!loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Package} value={isActive ? subscription.packageName : 'None'}
                        label="Active Package" color="#3b82f6"
                        sub={expiryDate ? `Expires ${expiryDate}` : 'Not subscribed'} />
                    <StatCard icon={Image} value={isActive ? `${subscription.imagesUsed}/${subscription.imageLimit}` : '0/0'}
                        label="Images Used" color="#8b5cf6" sub="AI generated images" />
                    <StatCard icon={ClipboardList} value={pendingCount}
                        label="Pending Requests" color="#f59e0b" sub="Waiting admin review" />
                    <StatCard icon={CheckCircle2} value={approvedCount}
                        label="Approved" color="#10b981" sub="Campaigns approved" />
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-slate-100 rounded-xl h-36 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Subscription Details Card */}
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarClock className="w-5 h-5 text-blue-600" />
                        <h2 className="font-bold text-slate-800 text-lg">Subscription Details</h2>
                        <span className="ml-auto px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Package</p>
                            <p className="font-bold text-slate-800">{subscription.packageName}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Images Limit</p>
                            <p className="font-bold text-slate-800">{subscription.imageLimit}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Images Used</p>
                            <p className="font-bold text-slate-800">{subscription.imagesUsed}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">Expires</p>
                            <p className="font-bold text-slate-800">{expiryDate}</p>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Image usage</span>
                            <span>{subscription.imagesUsed}/{subscription.imageLimit}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-blue-500 transition-all"
                                style={{ width: `${Math.min(100, (subscription.imagesUsed / subscription.imageLimit) * 100)}%` }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Recent Requests */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Campaign Requests</h2>
                    <Link to="/dashboard/my-requests" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                {requests.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No campaign requests yet.</p>
                        <Link to="/dashboard/request-ad" className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Zap className="w-4 h-4" /> Create Campaign
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {requests.slice(0, 5).map(req => (
                            <div key={req._id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-blue-200 transition-colors shadow-sm">
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-800 truncate">{req.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{req.businessName} · {new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
