import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Search, CheckCircle, XCircle, Trash2, Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function AdsManagement() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showRejectModal, setShowRejectModal] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        adminAPI.getAllAds()
            .then((r) => setAds(r.data.ads || []))
            .catch(() => toast.error('Failed to load ads'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = ads.filter((ad) => {
        const matchSearch = ad.title?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || ad.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleApprove = async (id) => {
        try {
            await adminAPI.approveAd(id);
            setAds((prev) => prev.map((a) => a._id === id ? { ...a, status: 'active' } : a));
            toast.success('Ad approved!');
        } catch { toast.error('Failed to approve'); }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return toast.error('Please provide a rejection reason');
        try {
            await adminAPI.rejectAd(showRejectModal, rejectReason);
            setAds((prev) => prev.map((a) => a._id === showRejectModal ? { ...a, status: 'rejected' } : a));
            toast.success('Ad rejected');
            setShowRejectModal(null);
            setRejectReason('');
        } catch { toast.error('Failed to reject'); }
    };

    const handleDelete = async () => {
        if (!showDeleteModal) return;
        try {
            await adminAPI.deleteAd(showDeleteModal);
            setAds((prev) => prev.filter((a) => a._id !== showDeleteModal));
            toast.success('Ad archived successfully');
            setShowDeleteModal(null);
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1 tracking-tight">
                        <Megaphone className="w-6 h-6 text-pink-600" /> Ads Management
                    </h1>
                    <p className="text-slate-600 text-sm font-medium">{ads.length} total ads</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search ads..." value={search}
                            onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-48 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
                {['all', 'pending', 'active', 'rejected', 'paused'].map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-5 py-2.5 text-sm font-bold capitalize whitespace-nowrap transition-all border-b-2 ${filterStatus === s ? 'border-blue-600 text-blue-700 bg-blue-50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
                            }`}>
                        {s} {s === 'all' ? '' : `(${ads.filter((a) => a.status === s).length})`}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden bg-white border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold">
                                <th className="text-left p-4">Ad</th>
                                <th className="text-left p-4">Category</th>
                                <th className="text-left p-4">Platform</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Views</th>
                                <th className="text-right p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td colSpan={6} className="p-4"><div className="h-8 bg-slate-100 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                                : filtered.map((ad) => (
                                    <motion.tr key={ad._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 max-w-[200px]">
                                            <p className="text-slate-900 font-bold truncate">{ad.title}</p>
                                            <p className="text-slate-500 text-xs font-medium truncate mt-0.5">{ad.createdBy?.name || 'N/A'}</p>
                                        </td>
                                        <td className="p-4 text-slate-700 font-medium">{ad.category?.name || '—'}</td>
                                        <td className="p-4 text-slate-700 font-medium">{ad.platform?.name || '—'}</td>
                                        <td className="p-4">
                                            <span className={`badge badge-${ad.status}`}>{ad.status}</span>
                                        </td>
                                        <td className="p-4 text-slate-700 font-medium">{ad.analytics?.views || 0}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {ad.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleApprove(ad._id)}
                                                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-200" title="Approve">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setShowRejectModal(ad._id)}
                                                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200" title="Reject">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => setShowDeleteModal(ad._id)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            }
                            {!loading && filtered.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No ads found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Reject Ad</h3>
                            <textarea
                                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                                rows={4} placeholder="Reason for rejection..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 resize-none text-sm transition-all mb-4" />
                            <div className="flex gap-3">
                                <button onClick={handleReject}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20 transition-all">
                                    Confirm Reject
                                </button>
                                <button onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Ad?</h3>
                                <p className="text-slate-500 text-sm">
                                    Are you sure you want to delete this ad? It will be archived and hidden from all public pages.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                                >
                                    Yes, Archive
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
