import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles, Download, Eye, Heart, X, ChevronDown, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/authStore';

// ─── Filter Options ────────────────────────────────────────────────────────────
const IMAGE_STYLES = ['All Styles', 'Minimalist', 'Bold & Vibrant', 'Elegant', 'Retro', 'Futuristic', 'Playful', 'Corporate'];
const AUDIENCES = ['All Audiences', 'Gen Z', 'Millennials', 'Professionals', 'Parents', 'Students', 'Seniors', 'Entrepreneurs'];
const INDUSTRIES = ['All Industries', 'E-Commerce', 'Food & Beverage', 'Tech & SaaS', 'Fashion', 'Health & Fitness', 'Finance', 'Travel', 'Education'];
const AD_FORMATS = ['All Formats', 'Social Media Post', 'Story / Reel', 'Banner Ad', 'Email Header', 'Billboard', 'Product Card'];
const PLATFORMS = ['All Platforms', 'Instagram', 'Facebook', 'LinkedIn', 'Twitter/X', 'TikTok', 'Google Ads', 'YouTube'];

// ─── Template Data ─────────────────────────────────────────────────────────────
const TEMPLATES = [
    // E-Commerce
    { id: 1, title: 'Flash Sale Blast', industry: 'E-Commerce', style: 'Bold & Vibrant', audience: 'Millennials', format: 'Social Media Post', platform: 'Instagram', color: '#FF4757', accent: '#FFC312', emoji: '🛍️', tags: ['Sale', 'Shopping', 'Deals'] },
    { id: 2, title: 'Premium Product Showcase', industry: 'E-Commerce', style: 'Minimalist', audience: 'Professionals', format: 'Product Card', platform: 'Facebook', color: '#2C3E50', accent: '#ECF0F1', emoji: '📦', tags: ['Product', 'Luxury', 'Premium'] },
    { id: 3, title: 'New Arrivals Drop', industry: 'Fashion', style: 'Elegant', audience: 'Gen Z', format: 'Story / Reel', platform: 'Instagram', color: '#833471', accent: '#FD79A8', emoji: '👗', tags: ['Fashion', 'New', 'Drop'] },
    { id: 4, title: 'Clearance Countdown', industry: 'E-Commerce', style: 'Retro', audience: 'Millennials', format: 'Banner Ad', platform: 'Google Ads', color: '#E17055', accent: '#FDCB6E', emoji: '⏰', tags: ['Countdown', 'Offer', 'Limited'] },
    // Food & Beverage
    { id: 5, title: 'Burger Crave', industry: 'Food & Beverage', style: 'Bold & Vibrant', audience: 'Gen Z', format: 'Social Media Post', platform: 'TikTok', color: '#D63031', accent: '#FFEAA7', emoji: '🍔', tags: ['Food', 'Fast Food', 'Crave'] },
    { id: 6, title: 'Coffee Morning Ritual', industry: 'Food & Beverage', style: 'Minimalist', audience: 'Professionals', format: 'Story / Reel', platform: 'Instagram', color: '#6C5CE7', accent: '#A29BFE', emoji: '☕', tags: ['Coffee', 'Morning', 'Ritual'] },
    { id: 7, title: 'Organic & Fresh', industry: 'Food & Beverage', style: 'Elegant', audience: 'Parents', format: 'Banner Ad', platform: 'Facebook', color: '#00B894', accent: '#55EFC4', emoji: '🥑', tags: ['Organic', 'Healthy', 'Fresh'] },
    { id: 8, title: 'Pizza Night Special', industry: 'Food & Beverage', style: 'Playful', audience: 'Millennials', format: 'Social Media Post', platform: 'Instagram', color: '#C0392B', accent: '#F39C12', emoji: '🍕', tags: ['Pizza', 'Night', 'Special'] },
    // Tech & SaaS
    { id: 9, title: 'App Launch Campaign', industry: 'Tech & SaaS', style: 'Futuristic', audience: 'Entrepreneurs', format: 'Banner Ad', platform: 'Google Ads', color: '#0984E3', accent: '#74B9FF', emoji: '🚀', tags: ['App', 'Launch', 'Startup'] },
    { id: 10, title: 'SaaS Growth Dashboard', industry: 'Tech & SaaS', style: 'Corporate', audience: 'Professionals', format: 'Social Media Post', platform: 'LinkedIn', color: '#2D3436', accent: '#636E72', emoji: '📊', tags: ['SaaS', 'Growth', 'Analytics'] },
    { id: 11, title: 'AI-Powered Future', industry: 'Tech & SaaS', style: 'Futuristic', audience: 'Entrepreneurs', format: 'Story / Reel', platform: 'YouTube', color: '#6C5CE7', accent: '#FD79A8', emoji: '🤖', tags: ['AI', 'Tech', 'Future'] },
    { id: 12, title: 'Cybersecurity Shield', industry: 'Tech & SaaS', style: 'Corporate', audience: 'Professionals', format: 'Email Header', platform: 'LinkedIn', color: '#0f3460', accent: '#16213e', emoji: '🔒', tags: ['Security', 'Enterprise', 'Safe'] },
    // Health & Fitness
    { id: 13, title: 'Gym Power Up', industry: 'Health & Fitness', style: 'Bold & Vibrant', audience: 'Gen Z', format: 'Social Media Post', platform: 'Instagram', color: '#FF6B35', accent: '#FFE66D', emoji: '💪', tags: ['Gym', 'Fitness', 'Power'] },
    { id: 14, title: 'Wellness Journey', industry: 'Health & Fitness', style: 'Minimalist', audience: 'Millennials', format: 'Story / Reel', platform: 'TikTok', color: '#00CEC9', accent: '#81ECEC', emoji: '🧘', tags: ['Wellness', 'Mindful', 'Health'] },
    { id: 15, title: 'Run & Perform', industry: 'Health & Fitness', style: 'Futuristic', audience: 'Students', format: 'Banner Ad', platform: 'Google Ads', color: '#FDCB6E', accent: '#E17055', emoji: '🏃', tags: ['Running', 'Sports', 'Active'] },
    { id: 16, title: 'Supplement Special', industry: 'Health & Fitness', style: 'Bold & Vibrant', audience: 'Entrepreneurs', format: 'Product Card', platform: 'Facebook', color: '#6ab04c', accent: '#badc58', emoji: '💊', tags: ['Supplement', 'Nutrition', 'Fit'] },
    // Finance
    { id: 17, title: 'Invest Smart', industry: 'Finance', style: 'Corporate', audience: 'Professionals', format: 'Banner Ad', platform: 'LinkedIn', color: '#1e3799', accent: '#4a69bd', emoji: '💹', tags: ['Investment', 'Finance', 'Smart'] },
    { id: 18, title: 'Save More Earn More', industry: 'Finance', style: 'Minimalist', audience: 'Millennials', format: 'Social Media Post', platform: 'Facebook', color: '#27ae60', accent: '#2ecc71', emoji: '💰', tags: ['Savings', 'Wealth', 'Earn'] },
    { id: 19, title: 'Crypto Bold Move', industry: 'Finance', style: 'Futuristic', audience: 'Gen Z', format: 'Story / Reel', platform: 'Twitter/X', color: '#f9ca24', accent: '#f0932b', emoji: '₿', tags: ['Crypto', 'Bold', 'Blockchain'] },
    // Travel
    { id: 20, title: 'Dream Destination', industry: 'Travel', style: 'Elegant', audience: 'Millennials', format: 'Billboard', platform: 'Instagram', color: '#0652DD', accent: '#1289A7', emoji: '✈️', tags: ['Travel', 'Luxury', 'Adventure'] },
    { id: 21, title: 'Weekend Escape', industry: 'Travel', style: 'Playful', audience: 'Gen Z', format: 'Story / Reel', platform: 'TikTok', color: '#EE5A24', accent: '#FFC312', emoji: '🏖️', tags: ['Weekend', 'Escape', 'Fun'] },
    { id: 22, title: 'Business Class Deals', industry: 'Travel', style: 'Corporate', audience: 'Professionals', format: 'Email Header', platform: 'LinkedIn', color: '#12CBC4', accent: '#C4E538', emoji: '🛫', tags: ['Business', 'Class', 'Deal'] },
    // Education
    { id: 23, title: 'Learn From Home', industry: 'Education', style: 'Playful', audience: 'Students', format: 'Social Media Post', platform: 'Instagram', color: '#7d5fff', accent: '#cd84f1', emoji: '📚', tags: ['Learn', 'Online', 'Study'] },
    { id: 24, title: 'Master Your Skills', industry: 'Education', style: 'Corporate', audience: 'Professionals', format: 'Banner Ad', platform: 'LinkedIn', color: '#1B1464', accent: '#0652DD', emoji: '🎓', tags: ['Skills', 'Career', 'Growth'] },
    { id: 25, title: 'Kids Bright Future', industry: 'Education', style: 'Playful', audience: 'Parents', format: 'Social Media Post', platform: 'Facebook', color: '#F9C228', accent: '#FF6B6B', emoji: '🌟', tags: ['Kids', 'Education', 'Future'] },
    // Fashion
    { id: 26, title: 'Luxury Brand Look', industry: 'Fashion', style: 'Elegant', audience: 'Millennials', format: 'Social Media Post', platform: 'Instagram', color: '#1a1a2e', accent: '#c9a84c', emoji: '👠', tags: ['Luxury', 'Brand', 'Style'] },
    { id: 27, title: 'Street Style Drop', industry: 'Fashion', style: 'Bold & Vibrant', audience: 'Gen Z', format: 'Story / Reel', platform: 'TikTok', color: '#e84393', accent: '#ffdd57', emoji: '🧢', tags: ['Streetwear', 'Hype', 'Drop'] },
    { id: 28, title: 'Seasonal Collection', industry: 'Fashion', style: 'Minimalist', audience: 'Millennials', format: 'Billboard', platform: 'Instagram', color: '#2d3436', accent: '#b2bec3', emoji: '🍂', tags: ['Season', 'Collection', 'Trend'] },
    // More
    { id: 29, title: 'Real Estate Dream Home', industry: 'E-Commerce', style: 'Elegant', audience: 'Professionals', format: 'Email Header', platform: 'Facebook', color: '#2C3A47', accent: '#B8E994', emoji: '🏠', tags: ['Real Estate', 'Home', 'Dream'] },
    { id: 30, title: 'Event & Ticket Launch', industry: 'E-Commerce', style: 'Retro', audience: 'Gen Z', format: 'Social Media Post', platform: 'Instagram', color: '#6F1E51', accent: '#FFC312', emoji: '🎟️', tags: ['Event', 'Ticket', 'Launch'] },
    { id: 31, title: 'Pet Care Products', industry: 'E-Commerce', style: 'Playful', audience: 'Millennials', format: 'Product Card', platform: 'Facebook', color: '#F97F51', accent: '#82CCd9', emoji: '🐶', tags: ['Pets', 'Care', 'Animals'] },
    { id: 32, title: 'Automotive Launch', industry: 'Tech & SaaS', style: 'Futuristic', audience: 'Professionals', format: 'Billboard', platform: 'YouTube', color: '#0C0C0C', accent: '#E84393', emoji: '🚗', tags: ['Car', 'Launch', 'Auto'] },
    { id: 33, title: 'Book Publishing Promo', industry: 'Education', style: 'Retro', audience: 'Seniors', format: 'Banner Ad', platform: 'Facebook', color: '#4a235a', accent: '#C39BD3', emoji: '📖', tags: ['Book', 'Publish', 'Read'] },
    { id: 34, title: 'Music Festival Hype', industry: 'E-Commerce', style: 'Bold & Vibrant', audience: 'Gen Z', format: 'Story / Reel', platform: 'TikTok', color: '#6A0572', accent: '#FF6FCF', emoji: '🎵', tags: ['Music', 'Festival', 'Hype'] },
];

// ─── FilterPill Component ───────────────────────────────────────────────────────
function FilterSelect({ label, options, value, onChange, icon: Icon }) {
    const [open, setOpen] = useState(false);
    const isActive = value !== options[0];

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                    }`}
            >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {isActive ? value : label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full mt-2 left-0 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden min-w-[180px]"
                        >
                            {options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { onChange(opt); setOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === opt
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ template, onClose, onUse }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Preview visual */}
                    <div
                        className="relative h-56 flex flex-col items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${template.color} 0%, ${template.accent} 100%)` }}
                    >
                        <div className="absolute inset-0 opacity-10">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="absolute rounded-full border-2 border-white"
                                    style={{ width: `${80 + i * 40}px`, height: `${80 + i * 40}px`, top: `${10 + i * 10}%`, left: `${5 + i * 12}%`, opacity: 0.3 - i * 0.05 }} />
                            ))}
                        </div>
                        <div className="text-8xl mb-3 z-10 drop-shadow-lg">{template.emoji}</div>
                        <span className="z-10 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold border border-white/30">
                            {template.platform}
                        </span>
                        <span className="absolute top-4 left-4 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-medium border border-white/20">
                            {template.format}
                        </span>
                        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Details */}
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-1">{template.title}</h2>
                        <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
                            <span>{template.industry}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{template.audience}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{template.style}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {template.tags.map((tag) => (
                                <span key={tag} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">#{tag}</span>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={onUse}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <ExternalLink className="w-4 h-4" /> Use Template
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Template Card ─────────────────────────────────────────────────────────────
function TemplateCard({ template, index, onPreview, onUse }) {
    const [liked, setLiked] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            whileHover={{ y: -6 }}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100"
        >
            {/* Visual Preview */}
            <div
                className="relative h-44 flex flex-col items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${template.color} 0%, ${template.accent} 100%)` }}
            >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full border-2 border-white"
                            style={{
                                width: `${60 + i * 30}px`,
                                height: `${60 + i * 30}px`,
                                top: `${-10 + i * 8}%`,
                                left: `${-5 + i * 10}%`,
                                opacity: 0.3 - i * 0.04,
                            }}
                        />
                    ))}
                </div>

                {/* Emoji big */}
                <div className="text-6xl mb-2 z-10 drop-shadow-lg select-none">
                    {template.emoji}
                </div>

                {/* Platform badge */}
                <span className="z-10 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30">
                    {template.platform}
                </span>

                {/* Hover overlay with working buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPreview(template); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-800 text-xs font-semibold hover:bg-blue-50 transition-colors"
                    >
                        <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onUse(template); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" /> Use
                    </button>
                </div>

                {/* Like button */}
                <button
                    onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white/40"
                >
                    <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-400 text-red-400 scale-110' : 'text-white'}`} />
                </button>

                {/* Format badge */}
                <span className="absolute top-3 left-3 z-30 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-[10px] font-medium border border-white/20">
                    {template.format}
                </span>
            </div>

            {/* Card Body */}
            <div className="p-4">
                <h3 className="font-semibold text-slate-800 text-sm mb-1 truncate">{template.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-500">{template.industry}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-500">{template.audience}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-medium">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CampaignTemplates() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [search, setSearch] = useState('');
    const [style, setStyle] = useState(IMAGE_STYLES[0]);
    const [audience, setAudience] = useState(AUDIENCES[0]);
    const [industry, setIndustry] = useState(INDUSTRIES[0]);
    const [format, setFormat] = useState(AD_FORMATS[0]);
    const [platform, setPlatform] = useState(PLATFORMS[0]);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    const handleUseTemplate = (template) => {
        if (isAuthenticated) {
            navigate('/dashboard/request-ad', {
                state: {
                    prefill: {
                        title: template.title,
                        description: `${template.industry} campaign for ${template.audience} audience. Style: ${template.style}. Tags: ${template.tags.join(', ')}.`,
                        targetAudience: template.audience,
                        imageStyle: template.format,
                    }
                }
            });
        } else {
            navigate('/login', { state: { from: '/campaign-templates' } });
        }
    };

    const hasActiveFilters =
        style !== IMAGE_STYLES[0] ||
        audience !== AUDIENCES[0] ||
        industry !== INDUSTRIES[0] ||
        format !== AD_FORMATS[0] ||
        platform !== PLATFORMS[0] ||
        search !== '';

    const clearFilters = () => {
        setStyle(IMAGE_STYLES[0]);
        setAudience(AUDIENCES[0]);
        setIndustry(INDUSTRIES[0]);
        setFormat(AD_FORMATS[0]);
        setPlatform(PLATFORMS[0]);
        setSearch('');
    };

    const filtered = useMemo(() => {
        return TEMPLATES.filter((t) => {
            if (style !== IMAGE_STYLES[0] && t.style !== style) return false;
            if (audience !== AUDIENCES[0] && t.audience !== audience) return false;
            if (industry !== INDUSTRIES[0] && t.industry !== industry) return false;
            if (format !== AD_FORMATS[0] && t.format !== format) return false;
            if (platform !== PLATFORMS[0] && t.platform !== platform) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    t.title.toLowerCase().includes(q) ||
                    t.industry.toLowerCase().includes(q) ||
                    t.tags.some((tag) => tag.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [style, audience, industry, format, platform, search]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* ── Hero Section ── */}
            <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 pt-10 pb-14 px-4 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-indigo-500/20 blur-2xl" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-5"
                    >
                        <Sparkles className="w-4 h-4" />
                        {TEMPLATES.length}+ Professional Templates
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
                    >
                        Campaign <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Templates</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-blue-200 text-lg max-w-2xl mx-auto"
                    >
                        Browse our library of professionally crafted ad templates. Filter by style, audience, industry, and more to find your perfect match.
                    </motion.p>
                </div>
            </div>

            {/* ── Sticky Filter Bar ── */}
            <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide">

                        {/* Search */}
                        <div className="relative flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search templates…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-full border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-44 transition-all"
                            />
                        </div>

                        <div className="w-px h-6 bg-slate-200 flex-shrink-0" />

                        {/* Filters */}
                        <FilterSelect label="Image Style" options={IMAGE_STYLES} value={style} onChange={setStyle} icon={SlidersHorizontal} />
                        <FilterSelect label="Target Audience" options={AUDIENCES} value={audience} onChange={setAudience} />
                        <FilterSelect label="Industry" options={INDUSTRIES} value={industry} onChange={setIndustry} />
                        <FilterSelect label="Ad Format" options={AD_FORMATS} value={format} onChange={setFormat} />
                        <FilterSelect label="Platform" options={PLATFORMS} value={platform} onChange={setPlatform} />

                        {/* Clear */}
                        <AnimatePresence>
                            {hasActiveFilters && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={clearFilters}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                                >
                                    <X className="w-3.5 h-3.5" /> Clear
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Results Count ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-500 text-sm">
                        Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of <span className="font-semibold text-slate-800">{TEMPLATES.length}</span> templates
                    </p>
                    {hasActiveFilters && (
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            Filters active
                        </span>
                    )}
                </div>

                {/* ── Grid ── */}
                {filtered.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                    >
                        <AnimatePresence mode="popLayout">
                            {filtered.map((template, i) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    index={i}
                                    onPreview={setPreviewTemplate}
                                    onUse={handleUseTemplate}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No templates found</h3>
                        <p className="text-slate-400 mb-6">Try adjusting your filters or search term</p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Clear all filters
                        </button>
                    </motion.div>
                )}
            </div>

            {/* ── Preview Modal ── */}
            {previewTemplate && (
                <PreviewModal
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                    onUse={() => { setPreviewTemplate(null); handleUseTemplate(previewTemplate); }}
                />
            )}

            {/* ── CTA Banner ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-12 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-10">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full border-2 border-white"
                                style={{ width: `${200 + i * 120}px`, height: `${200 + i * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
                            />
                        ))}
                    </div>
                    <div className="relative z-10">
                        <div className="text-5xl mb-4">✨</div>
                        <h2 className="text-3xl font-extrabold text-white mb-3">Can't find what you need?</h2>
                        <p className="text-blue-200 text-lg mb-7">Let our AI generate a custom ad campaign tailored exactly to your brand.</p>
                        <a
                            href="/dashboard/request-ad"
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-blue-700 font-bold text-base hover:bg-blue-50 transition-colors shadow-lg"
                        >
                            <Sparkles className="w-5 h-5" />
                            Create Custom Ad
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
