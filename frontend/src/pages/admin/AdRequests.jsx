import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, CheckCircle2, XCircle, Clock, Eye,
    Search, Filter, User, Sparkles, Image as ImageIcon, MessageSquare, Loader2, Download, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adRequestAPI } from '../../services/api';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    let baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
    }
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            <Icon className="w-3 h-3" /> {cfg.label}
        </span>
    );
}

function ImagePreviewModal({ request, onClose }) {
    const [imgLoading, setImgLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    const handleDownload = async () => {
        if (!request.generatedImageUrl) return;
        if (imgError) { toast.error("Cannot download a broken image."); return; }
        const filename = `${request.title.replace(/\s+/g, '_')}_ad.png`;
        try {
            // ── Fast path: base64 data URL — download directly ──
            if (request.generatedImageUrl.startsWith('data:')) {
                const link = document.createElement('a');
                link.href = request.generatedImageUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Download completed!');
                return;
            }
            // ── SVG data URI path ──
            if (request.generatedImageUrl.startsWith('data:image/svg+xml')) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 1080; canvas.height = 1080;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const url = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = url; link.download = filename;
                    document.body.appendChild(link); link.click();
                    document.body.removeChild(link);
                    toast.success('Download completed!');
                };
                img.onerror = () => toast.error('Failed to process image');
                img.src = request.generatedImageUrl;
                return;
            }
            // ── External HTTP URL path ──
            const response = await fetch(request.generatedImageUrl);
            if (!response.ok) throw new Error('Image server error');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = filename;
            document.body.appendChild(link); link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Download completed!');
        } catch {
            toast.error('Download failed. Server might be busy.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-bold text-slate-800">{request.title} – Generated Ad</p>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <div className="p-4 relative min-h-[300px] flex items-center justify-center bg-slate-50">
                    {request.generatedImageUrl ? (
                        <>
                            {imgLoading && !imgError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                                    <p className="text-sm text-slate-500 font-medium">Loading AI Image...</p>
                                </div>
                            )}
                            {imgError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                                    <p className="text-sm text-slate-700 font-medium">Image generation service is temporarily unavailable</p>
                                    <p className="text-xs text-slate-500 mt-1">Please try again later. The AI servers might be overloaded.</p>
                                </div>
                            )}
                            <img
                                src={getFullImageUrl(request.generatedImageUrl)}
                                alt="Generated Ad"
                                onLoad={() => setImgLoading(false)}
                                onError={() => { setImgLoading(false); setImgError(true); }}
                                className={`w-full rounded-xl border border-slate-100 shadow-sm aspect-square object-cover transition-opacity duration-300 ${(imgLoading || imgError) ? 'opacity-0 absolute -z-10' : 'opacity-100 relative z-10'}`}
                            />
                        </>
                    ) : (
                        <div className="aspect-square w-full rounded-xl bg-slate-100 flex items-center justify-center">
                            <div className="text-center">
                                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-400 text-sm">No image generated yet</p>
                                <p className="text-slate-400 text-xs mt-1">Client will generate after approval</p>
                            </div>
                        </div>
                    )}
                </div>
                {request.generatedImageUrl && (
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
                )}
            </motion.div>
        </div>
    );
}

function DetailModal({ request, onClose, onApprove, onReject }) {
    const [adminNote, setAdminNote] = useState('');
    const [rejecting, setRejecting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [imgLoading, setImgLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-bold text-slate-800 text-lg">Campaign Request Details</p>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <div className="p-5 space-y-3 overflow-y-auto max-h-[60vh]">
                    <div className="flex items-center gap-2">
                        <StatusBadge status={request.status} />
                        <span className="text-xs text-slate-400">{new Date(request.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-0.5">Campaign Title</p>
                            <p className="font-semibold text-slate-800 text-sm">{request.title}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-0.5">Business</p>
                            <p className="font-semibold text-slate-800 text-sm">{request.businessName}</p>
                        </div>
                        {request.offerDetails && (
                            <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                                <p className="text-xs text-slate-500 mb-0.5">Offer Details</p>
                                <p className="text-slate-700 text-sm">{request.offerDetails}</p>
                            </div>
                        )}
                        {request.targetAudience && (
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-0.5">Target Audience</p>
                                <p className="text-slate-700 text-sm">{request.targetAudience}</p>
                            </div>
                        )}
                        {request.imageStyle && (
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-500 mb-0.5">Image Style</p>
                                <p className="text-slate-700 text-sm">{request.imageStyle}</p>
                            </div>
                        )}
                        {request.contactInfo && (
                            <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                                <p className="text-xs text-slate-500 mb-0.5">Contact Info</p>
                                <p className="text-slate-700 text-sm">{request.contactInfo}</p>
                            </div>
                        )}
                        <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                            <p className="text-xs text-slate-500 mb-0.5">Description</p>
                            <p className="text-slate-700 text-sm">{request.description}</p>
                        </div>
                    </div>

                    {/* Client Subscription Info */}
                    {request.user?.subscription && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Client Subscription</p>
                            <p className="text-xs text-blue-600">
                                {request.user.subscription.packageName || 'None'} · {request.user.subscription.status}
                                {request.user.subscription.status === 'Active' &&
                                    ` · ${request.user.subscription.imagesUsed}/${request.user.subscription.imageLimit} images used`}
                            </p>
                        </div>
                    )}

                    {/* Generated Image Preview */}
                    {request.generatedImageUrl && (
                        <div>
                            <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Generated AI Image
                            </p>
                            <div className="relative min-h-[200px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                {imgLoading && !imgError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                                        <p className="text-xs text-slate-500 font-medium my-1">Loading AI Image...</p>
                                    </div>
                                )}
                                {imgError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                                        <AlertTriangle className="w-6 h-6 text-amber-500 mb-1" />
                                        <p className="text-xs text-slate-700 font-medium">Image service unavailable</p>
                                    </div>
                                )}
                                <img
                                    src={getFullImageUrl(request.generatedImageUrl)}
                                    alt="Generated"
                                    onLoad={() => setImgLoading(false)}
                                    onError={() => { setImgLoading(false); setImgError(true); }}
                                    className={`w-full aspect-square object-cover transition-opacity duration-300 ${(imgLoading || imgError) ? 'opacity-0 absolute -z-10' : 'opacity-100 relative z-10'}`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Admin Note */}
                    {request.status === 'pending' && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Admin Note (optional for approve, required for reject)
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                                placeholder="Leave a note for the client..."
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>

                {request.status === 'pending' && (
                    <div className="p-4 border-t border-slate-100 flex gap-3">
                        <button
                            onClick={async () => {
                                setApproving(true);
                                await onApprove(request._id, adminNote);
                                setApproving(false);
                            }}
                            disabled={approving || rejecting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {approving ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                            onClick={async () => {
                                if (!adminNote) { toast.error('Enter a rejection reason'); return; }
                                setRejecting(true);
                                await onReject(request._id, adminNote);
                                setRejecting(false);
                            }}
                            disabled={approving || rejecting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                            {rejecting ? 'Rejecting...' : 'Reject'}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function AdminAdRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [previewRequest, setPreviewRequest] = useState(null);

    useEffect(() => {
        fetchRequests();
        // Auto-poll every 15s so generated images and new requests appear without page refresh
        const interval = setInterval(() => fetchRequests(true), 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchRequests = async (silent = false) => {
        try {
            const res = await adRequestAPI.getAll();
            setRequests(res.data.requests || []);
        } catch {
            if (!silent) toast.error('Failed to load requests');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleApprove = async (id, adminNote) => {
        try {
            await adRequestAPI.approve(id, { adminNote });
            toast.success('Request approved! Client can now generate AI image.');
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Approval failed');
        }
    };

    const handleReject = async (id, reason) => {
        try {
            await adRequestAPI.reject(id, reason);
            toast.success('Request rejected.');
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Rejection failed');
        }
    };

    const tabs = ['all', 'pending', 'approved', 'rejected'];
    const filtered = requests
        .filter(r => activeTab === 'all' || r.status === activeTab)
        .filter(r =>
            !search ||
            r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.businessName?.toLowerCase().includes(search.toLowerCase()) ||
            r.user?.name?.toLowerCase().includes(search.toLowerCase())
        );

    const counts = {
        all: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    };

    return (
        <div className="space-y-6">
            {selectedRequest && (
                <DetailModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
            {previewRequest && (
                <ImagePreviewModal
                    request={previewRequest}
                    onClose={() => setPreviewRequest(null)}
                />
            )}

            <div>
                <h1 className="text-2xl font-bold text-slate-800">Campaign Requests</h1>
                <p className="text-slate-500 mt-1 text-sm">Review and approve client campaign requests.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {Object.entries(counts).map(([key, count]) => (
                    <div key={key} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                        <p className={`text-2xl font-bold ${key === 'pending' ? 'text-yellow-600' : key === 'approved' ? 'text-green-600' : key === 'rejected' ? 'text-red-600' : 'text-slate-800'}`}>{count}</p>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{key}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
                        </button>
                    ))}
                </div>
                <div className="relative ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-48"
                    />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="bg-slate-100 h-16 rounded-xl animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                    <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No requests found.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Style</th>
                                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Image</th>
                                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence>
                                {filtered.map((req, i) => (
                                    <motion.tr
                                        key={req._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-800">{req.title}</p>
                                            <p className="text-xs text-slate-400">{req.businessName}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {req.user?.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 text-xs">{req.user?.name}</p>
                                                    <p className="text-xs text-slate-400">{req.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">{req.imageStyle || '—'}</span>
                                        </td>
                                        <td className="p-4"><StatusBadge status={req.status} /></td>
                                        <td className="p-4">
                                            {req.generatedImageUrl ? (
                                                <button
                                                    onClick={() => setPreviewRequest(req)}
                                                    className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" /> View
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400">Not generated</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedRequest(req)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(req._id, '')}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                            title="Quick Approve"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedRequest(req)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Reject with reason"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
