import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, CheckCircle2, XCircle, Clock, Sparkles, Download,
    AlertTriangle, Loader2, Eye, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adRequestAPI, subscriptionAPI } from '../../services/api';
import api from '../../services/api';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: Sparkles },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;   // base64 data URL — use as-is
    if (url.startsWith('http')) return url;
    // For legacy /uploads/ paths, prefix with backend URL
    let baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
    }
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

// Allow both Canvas base64 images, file-based /uploads/ images, and direct HTTPS AI urls
const isCanvasImage = (url) => url && (url.startsWith('data:image/') || url.startsWith('/uploads/') || url.startsWith('http'));

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            <Icon className="w-3 h-3" /> {cfg.label}
        </span>
    );
}

function GeneratedImageModal({ imageUrl, title, onClose }) {
    const [imgLoading, setImgLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    // Reset loading states whenever imageUrl changes
    useEffect(() => {
        setImgLoading(true);
        setImgError(false);
        setRetryCount(0);
    }, [imageUrl]);

    const handleImageError = () => {
        if (retryCount < maxRetries) {
            console.log(`Retrying image load (${retryCount + 1}/${maxRetries})...`);
            setImgLoading(true);
            // Small delay before retrying with a cache buster
            setTimeout(() => {
                setRetryCount(prev => prev + 1);
            }, 2000 * (retryCount + 1));
        } else {
            console.error("Max retries reached for image:", imageUrl);
            setImgLoading(false);
            setImgError(true);
        }
    };

    const handleDownload = async () => {
        if (!imageUrl) return;
        const filename = `${title.replace(/\s+/g, '_')}_ad.png`;
        try {
            // ── Fast path: data URLs can be downloaded directly in the browser ──
            if (imageUrl.startsWith('data:')) {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Download complete!');
                return;
            }
            // ── Proxy path for external/legacy URLs ──
            const response = await api.get('/ad-requests/download', {
                params: { url: imageUrl, filename },
                responseType: 'blob',
            });
            const blobUrl = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success('Download complete!');
        } catch {
            toast.error('Download failed. Please try again.');
        }
    };

    // Construct URL without retry-based cache buster for Pollinations to avoid re-triggering generation
    const displayUrl = getFullImageUrl(imageUrl);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-bold text-slate-800">Generated Ad Image</p>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <div className="p-4 relative min-h-[300px] flex items-center justify-center bg-slate-50">
                    {imgLoading && !imgError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                            <p className="text-sm text-slate-500 font-medium">
                                {retryCount > 0 ? `Retrying (${retryCount}/${maxRetries})...` : 'Loading AI Image...'}
                            </p>
                            {retryCount > 0 && <p className="text-xs text-slate-400 mt-1 italic text-center px-4">AI service is busy, please wait a moment</p>}
                        </div>
                    )}
                    {imgError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-50">
                            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                            <p className="text-sm text-slate-700 font-medium">Image generation service is temporarily unavailable</p>
                            <p className="text-xs text-slate-500 mt-1">Please try again later. The AI servers might be overloaded.</p>
                            <button
                                onClick={() => { setRetryCount(0); setImgLoading(true); setImgError(false); }}
                                className="mt-4 text-xs text-blue-600 font-semibold hover:underline"
                            >
                                Manual Retry
                            </button>
                        </div>
                    )}
                    <img
                        src={displayUrl}
                        alt="Generated Ad"
                        onLoad={() => {
                            setImgLoading(false);
                            setImgError(false);
                        }}
                        onError={handleImageError}
                        className={`w-full rounded-xl border border-slate-100 shadow-sm aspect-square object-cover transition-opacity duration-300 ${(imgLoading || imgError) ? 'opacity-0' : 'opacity-100'}`}
                    />
                </div>
                <div className="p-4 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4" /> Download Image
                    </button>
                    <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const generatingRef = useRef(null);

    // Keep ref in sync so the polling callback can read current generating state
    useEffect(() => { generatingRef.current = generating; }, [generating]);

    useEffect(() => {
        fetchData();
        // Auto-poll every 15 seconds so admin approve/reject is visible without page refresh
        const interval = setInterval(() => {
            // Don't poll while an image is being generated to avoid state conflicts
            if (!generatingRef.current) {
                fetchData(true);
            }
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (silent = false) => {
        try {
            const [reqRes, subRes] = await Promise.allSettled([
                adRequestAPI.getMyRequests(),
                subscriptionAPI.getMy(),
            ]);
            if (reqRes.status === 'fulfilled') {
                const newRequests = reqRes.value.data.requests || [];
                setRequests(prev => {
                    // Merge: keep locally-generated image URLs if the server hasn't saved one yet
                    const prevMap = Object.fromEntries(prev.map(r => [r._id, r]));
                    return newRequests.map(r => {
                        const prevR = prevMap[r._id];
                        const serverUrl = isCanvasImage(r.generatedImageUrl) ? r.generatedImageUrl : null;
                        // Prefer the fresher server URL; fall back to locally cached during generation
                        const localUrl = prevR?.generatedImageUrl || null;
                        return { ...r, generatedImageUrl: serverUrl || localUrl };
                    });
                });
            }
            if (subRes.status === 'fulfilled') setSubscription(subRes.value.data.subscription);
        } catch {
            if (!silent) toast.error('Failed to load requests');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleGenerateImage = async (request) => {
        const sub = subscription;
        if (!sub || sub.status !== 'Active') {
            toast.error('Please renew your subscription to generate images.');
            return;
        }
        if (sub.imagesUsed >= sub.imageLimit) {
            toast.error('Image generation limit reached. Please upgrade your plan.');
            return;
        }

        // Close any open preview & clear old image FIRST
        setPreviewImage(null);
        setRequests(prev => prev.map(r => r._id === request._id ? { ...r, generatedImageUrl: null } : r));
        setGenerating(request._id);
        try {
            const res = await adRequestAPI.generateImage(request._id);
            const newImageUrl = res.data.imageUrl;
            // Update local request with the brand NEW canvas image
            setRequests(prev => prev.map(r => r._id === request._id ? { ...r, generatedImageUrl: newImageUrl } : r));
            setSubscription(prev => prev ? { ...prev, imagesUsed: res.data.imagesUsed } : prev);
            // Use a short delay to ensure old modal is fully unmounted before new one opens
            setTimeout(() => {
                setPreviewImage({ url: newImageUrl, title: request.title, ts: Date.now() });
            }, 100);
            toast.success('Ad image generated successfully!');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Image generation failed');
            // Restore old url if generation failed
            setRequests(prev => prev.map(r => r._id === request._id ? { ...r, generatedImageUrl: request.generatedImageUrl } : r));
        } finally {
            setGenerating(null);
        }
    };

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'approved', label: 'Approved' },
        { id: 'rejected', label: 'Rejected' },
    ];

    const filtered = activeTab === 'all'
        ? requests
        : activeTab === 'approved'
            ? requests.filter(r => r.status === 'approved' || r.status === 'completed')
            : requests.filter(r => r.status === activeTab);
    const isSubActive = subscription?.status === 'Active';
    const imagesLeft = isSubActive ? (subscription.imageLimit - subscription.imagesUsed) : 0;

    return (
        <div className="space-y-6">
            {previewImage && (
                <GeneratedImageModal
                    key={previewImage.ts || previewImage.url}
                    imageUrl={previewImage.url}
                    title={previewImage.title}
                    onClose={() => setPreviewImage(null)}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">My Campaign Requests</h1>
                    <p className="text-slate-500 mt-1">Track your ad campaign requests and generate AI images.</p>
                </div>
                {isSubActive && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-sm">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 font-medium">{imagesLeft} image{imagesLeft !== 1 ? 's' : ''} left</span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
                    >
                        {tab.label}
                        <span className="ml-1.5 text-xs opacity-70">
                            {tab.id === 'all'
                                ? requests.length
                                : tab.id === 'approved'
                                    ? requests.filter(r => r.status === 'approved' || r.status === 'completed').length
                                    : requests.filter(r => r.status === tab.id).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Subscription warning */}
            {!loading && !isSubActive && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-amber-700 text-sm font-medium">
                        {subscription?.status === 'Expired'
                            ? 'Your subscription has expired. Please renew to generate AI images.'
                            : 'No active subscription. Buy a package to generate AI ad images.'}
                    </p>
                </div>
            )}

            {/* Request List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-100 h-32 rounded-xl animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                    <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No {activeTab === 'all' ? '' : activeTab + ' '}requests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filtered.map((req, i) => (
                            <motion.div
                                key={req._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 transition-colors shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap mb-2">
                                            <h3 className="font-bold text-slate-800 truncate">{req.title}</h3>
                                            <StatusBadge status={req.status} />
                                        </div>
                                        <p className="text-sm text-slate-500 mb-1"><span className="font-medium text-slate-700">Business:</span> {req.businessName}</p>
                                        {req.offerDetails && <p className="text-sm text-slate-500 mb-1"><span className="font-medium text-slate-700">Offer:</span> {req.offerDetails}</p>}
                                        {req.targetAudience && <p className="text-sm text-slate-500 mb-1"><span className="font-medium text-slate-700">Audience:</span> {req.targetAudience}</p>}
                                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-3">
                                            <span>Style: <strong className="text-slate-600">{req.imageStyle}</strong></span>
                                            <span>Submitted: {new Date(req.createdAt).toLocaleDateString('en-IN')}</span>
                                        </p>
                                        {req.adminNote && (
                                            <div className={`mt-3 p-2.5 rounded-lg text-xs ${req.status === 'rejected' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                                                <span className="font-semibold">Admin note:</span> {req.adminNote}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                                        {(req.status === 'approved' || req.status === 'completed') && req.generatedImageUrl && isCanvasImage(req.generatedImageUrl) && (
                                            <button
                                                onClick={() => setPreviewImage({ url: req.generatedImageUrl, title: req.title })}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View Image
                                            </button>
                                        )}
                                        {(req.status === 'approved' || req.status === 'completed') && (
                                            <button
                                                onClick={() => handleGenerateImage(req)}
                                                disabled={generating === req._id || !isSubActive || imagesLeft <= 0}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                            >
                                                {generating === req._id ? (
                                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                                                ) : (
                                                    <><Sparkles className="w-3.5 h-3.5" /> {req.generatedImageUrl ? 'Regenerate' : 'Generate AI Image'}</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
