import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Bookmark, Eye, ArrowLeft, Tag, Monitor, MousePointerClick, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { adAPI, userAPI } from '../../services/api';

export default function AdDetails() {
    const { id } = useParams();
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const [adRes, savedRes] = await Promise.all([adAPI.getById(id), userAPI.getSavedAds()]);
                setAd(adRes.data.ad);
                const savedIds = (savedRes.data.savedAds || []).map((a) => a._id || a);
                setIsSaved(savedIds.includes(id));
                adAPI.trackView(id).catch(() => { });
            } catch { toast.error('Failed to load ad'); }
            finally { setLoading(false); }
        };
        fetchAd();
    }, [id]);

    const handleSave = async () => {
        try {
            await userAPI.toggleSaveAd(id);
            setIsSaved(!isSaved);
            toast.success(isSaved ? 'Removed from saved' : 'Ad saved!');
        } catch { toast.error('Failed to update'); }
    };

    const handleVisitLink = () => {
        adAPI.trackClick(id).catch(() => { });
        window.open(ad.visitLink, '_blank', 'noopener,noreferrer');
    };

    if (loading) return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <div className="glass-card aspect-video animate-pulse rounded-2xl" />
            <div className="glass-card h-full min-h-64 animate-pulse rounded-2xl" />
        </div>
    );

    if (!ad) return (
        <div className="glass-card p-12 text-center w-full">
            <p className="text-slate-400">Ad not found.</p>
            <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm mt-3 inline-block">
                ← Back to Dashboard
            </Link>
        </div>
    );

    const ctr = ad.analytics?.views > 0
        ? ((ad.analytics.clicks / ad.analytics.views) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="w-full space-y-5">
            {/* Back link */}
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            {/* Main two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">

                {/* LEFT — Image */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="glass-card overflow-hidden rounded-2xl"
                >
                    <div className="aspect-video bg-slate-900 overflow-hidden">
                        {ad.image ? (
                            <img
                                src={ad.image.startsWith('http') ? ad.image : `/uploads/${ad.image}`}
                                alt={ad.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">No Image</div>
                        )}
                    </div>

                    {/* Analytics bar below image */}
                    <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
                        {[
                            { icon: Eye, label: 'Views', value: (ad.analytics?.views || 0).toLocaleString() },
                            { icon: MousePointerClick, label: 'Clicks', value: (ad.analytics?.clicks || 0).toLocaleString() },
                            { icon: TrendingUp, label: 'CTR', value: `${ctr}%` },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex flex-col items-center py-4 px-2">
                                <Icon className="w-4 h-4 text-indigo-400 mb-1" />
                                <p className="text-white font-semibold text-sm">{value}</p>
                                <p className="text-slate-500 text-xs">{label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* RIGHT — Details */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 md:p-8 flex flex-col gap-5 h-full"
                >
                    {/* Title + save */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className={`badge badge-${ad.status} mb-2 inline-block`}>{ad.status}</span>
                            <h1 className="text-2xl font-bold text-white leading-snug">{ad.title}</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            className={`p-2.5 rounded-xl border shrink-0 transition-all ${isSaved
                                    ? 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30'
                                    : 'text-slate-500 border-white/10 hover:border-indigo-500/30 hover:text-indigo-400'
                                }`}
                        >
                            <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 leading-relaxed">{ad.description}</p>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-slate-500 text-xs mb-1.5 flex items-center gap-1.5">
                                <Monitor className="w-3.5 h-3.5" /> Platform
                            </p>
                            <p className="text-white font-semibold">{ad.platform?.name || 'N/A'}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-slate-500 text-xs mb-1.5 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" /> Category
                            </p>
                            <p className="text-white font-semibold">{ad.category?.name || 'N/A'}</p>
                        </div>
                        {ad.targetAudience?.ageGroup && (
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-slate-500 text-xs mb-1.5">Age Group</p>
                                <p className="text-white font-semibold capitalize">{ad.targetAudience.ageGroup}</p>
                            </div>
                        )}
                        {ad.targetAudience?.budget && (
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-slate-500 text-xs mb-1.5">Budget Range</p>
                                <p className="text-white font-semibold capitalize">{ad.targetAudience.budget}</p>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleVisitLink}
                        className="mt-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold btn-glow text-white text-sm"
                    >
                        <ExternalLink className="w-4 h-4" /> Visit Website
                    </button>

                    {/* Save CTA */}
                    {!isSaved && (
                        <button
                            onClick={handleSave}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-slate-400 border border-white/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-all text-sm"
                        >
                            <Bookmark className="w-4 h-4" /> Save for Later
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
