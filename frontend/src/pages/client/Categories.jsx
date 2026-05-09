import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, ShoppingBag, GraduationCap, Plane, Utensils, Heart, Dumbbell, Film, Package } from 'lucide-react';
import { adAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ICON_MAP = {
    Electronics: Monitor, Fashion: ShoppingBag, Education: GraduationCap,
    Travel: Plane, Food: Utensils, Health: Heart, Sports: Dumbbell,
    Entertainment: Film, Others: Package,
};
const COLOR_MAP = {
    Electronics: '#6366f1', Fashion: '#ec4899', Education: '#06b6d4',
    Travel: '#f59e0b', Food: '#ef4444', Health: '#22c55e',
    Sports: '#8b5cf6', Entertainment: '#f97316', Others: '#94a3b8',
};

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [ads, setAds] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [loadingAds, setLoadingAds] = useState(false);

    useEffect(() => {
        categoryAPI.getAll({ isActive: true }).then((r) => {
            setCategories(r.data.categories || []);
        }).catch(() => toast.error('Failed to load categories'))
            .finally(() => setLoadingCats(false));
    }, []);

    const handleSelectCategory = async (cat) => {
        setSelectedCategory(cat);
        setLoadingAds(true);
        try {
            const res = await adAPI.getAll({ category: cat._id, status: 'active' });
            setAds(res.data.ads || []);
        } catch { toast.error('Failed to load ads'); }
        finally { setLoadingAds(false); }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Ad Categories</h1>
                <p className="text-slate-500 text-sm font-medium">Browse ads by category.</p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {loadingCats
                    ? [...Array(9)].map((_, i) => <div key={i} className="bg-slate-100 border border-slate-200 h-32 animate-pulse rounded-2xl" />)
                    : categories.map((cat) => {
                        const Icon = ICON_MAP[cat.type] || Package;
                        const color = COLOR_MAP[cat.type] || '#94a3b8';
                        const isSelected = selectedCategory?._id === cat._id;
                        return (
                            <motion.button key={cat._id} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                                onClick={() => handleSelectCategory(cat)}
                                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all shadow-sm hover:shadow-md ${isSelected ? 'border-indigo-400 ring-1 ring-indigo-400 shadow-indigo-100' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                style={{ background: isSelected ? `${color}08` : '#ffffff' }}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm" style={{ background: `${color}15` }}>
                                    <Icon className="w-6 h-6" style={{ color }} />
                                </div>
                                <div className="text-center mt-1">
                                    <span className="block text-slate-800 text-xs font-bold mb-0.5">{cat.name}</span>
                                    <span className="text-slate-500 text-[10px] font-medium">{cat.totalAds} ads</span>
                                </div>
                            </motion.button>
                        );
                    })
                }
            </div>

            {/* Ads Panel */}
            {selectedCategory && (
                <div className="pt-6 border-t border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        {selectedCategory.name} Ads
                    </h2>
                    {loadingAds ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-100 border border-slate-200 h-56 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : ads.length === 0 ? (
                        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center">
                            <p className="text-slate-500 font-medium">No active ads in this category yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ads.map((ad) => (
                                <Link key={ad._id} to={`/dashboard/ads/${ad._id}`} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
                                    <div className="aspect-video bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
                                        {ad.image ? (
                                            <img src={ad.image.startsWith('http') ? ad.image : `/uploads/${ad.image}`}
                                                alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <span className="text-slate-400 text-sm font-medium">No Image</span>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-slate-900 font-bold text-sm line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">{ad.title}</h3>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                            <Monitor className="w-3.5 h-3.5" />
                                            {ad.platform?.name}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
