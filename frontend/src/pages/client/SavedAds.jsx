import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2, ExternalLink, Eye, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';

export default function SavedAds() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        userAPI.getSavedAds()
            .then((r) => setAds(r.data.savedAds || []))
            .catch(() => toast.error('Failed to load saved ads'))
            .finally(() => setLoading(false));
    }, []);

    const handleRemove = async (adId) => {
        try {
            await userAPI.toggleSaveAd(adId);
            setAds((prev) => prev.filter((a) => a._id !== adId));
            toast.success('Removed from saved ads');
        } catch { toast.error('Failed to remove'); }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1.5 tracking-tight">
                    <Bookmark className="w-6 h-6 text-indigo-600" /> Saved Ads
                </h1>
                <p className="text-slate-500 text-sm font-medium">{ads.length} ad{ads.length !== 1 ? 's' : ''} saved</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-2xl h-64 animate-pulse overflow-hidden">
                            <div className="h-36 bg-slate-200"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-200 rounded w-full"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : ads.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center"
                >
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Bookmark className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No saved ads found</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">Ads you save for later will appear here. Start exploring to find inspiration for your next campaign.</p>
                    <Link to="/templates" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]">
                        Browse Templates
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    initial="hidden" animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    <AnimatePresence>
                        {ads.map((ad) => (
                            <motion.div
                                key={ad._id}
                                variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
                                layout exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
                                className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col"
                            >
                                <div className="aspect-video bg-slate-100 overflow-hidden relative">
                                    {ad.image ? (
                                        <img src={ad.image.startsWith('http') ? ad.image : `/uploads/${ad.image}`}
                                            alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-xs font-medium">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.preventDefault(); handleRemove(ad._id); }}
                                            className="p-2 rounded-xl bg-white/90 backdrop-blur text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm transition-all"
                                            title="Remove from saved"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {ad.platform && (
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200/50 uppercase tracking-wider">
                                            {ad.platform.name}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-slate-900 font-bold text-sm line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors">{ad.title}</h3>
                                    <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1 font-medium leading-relaxed">{ad.description}</p>

                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                                        <div className="flex -space-x-1">
                                            {/* Optional: Add visual indicators for categories/themes if available in data */}
                                            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shadow-sm">
                                                <Bookmark className="w-3 h-3 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Link to={`/templates/${ad._id}`}
                                                className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium text-xs flex items-center gap-1"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">View</span>
                                            </Link>
                                            {ad.visitLink && (
                                                <a href={ad.visitLink} target="_blank" rel="noopener noreferrer"
                                                    className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                                    title="Visit External Link"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
