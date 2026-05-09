import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, Zap, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';

export default function SubscriptionBanner() {
    const [sub, setSub] = useState(null);
    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSub = async () => {
            try {
                const res = await subscriptionAPI.getMy();
                setSub(res.data.subscription);
            } catch (err) {
                // Silently fail banner
            } finally {
                setLoading(false);
            }
        };
        fetchSub();
    }, []);

    if (loading || !sub || !visible) return null;

    const now = new Date();
    const expiryDate = sub.expiryDate ? new Date(sub.expiryDate) : null;
    const daysLeft = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : 999;
    const remainingImages = sub.imageLimit - (sub.imagesUsed || 0);
    const isExpired = sub.status === 'Expired' || (expiryDate && expiryDate < now);
    const isLowImages = remainingImages <= 2 && sub.imageLimit > 0;
    const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0;

    // Determine banner type
    let config = null;

    if (isExpired) {
        config = {
            type: 'error',
            icon: AlertCircle,
            message: 'Your subscription has expired. Renew now to continue generating AI ads.',
            color: 'bg-red-50 text-red-800 border-red-200',
            btnColor: 'bg-red-600 hover:bg-red-700 text-white'
        };
    } else if (isExpiringSoon) {
        config = {
            type: 'warning',
            icon: Clock,
            message: `Your plan expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew soon to avoid interruption.`,
            color: 'bg-amber-50 text-amber-800 border-amber-200',
            btnColor: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
    } else if (isLowImages) {
        config = {
            type: 'warning',
            icon: Zap,
            message: remainingImages === 0 
                ? 'You have used all your AI image generations.' 
                : `You only have ${remainingImages} AI image generation${remainingImages === 1 ? '' : 's'} left.`,
            color: 'bg-orange-50 text-orange-800 border-orange-200',
            btnColor: 'bg-orange-600 hover:bg-orange-700 text-white'
        };
    }

    if (!config) return null;

    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`border-b ${config.color} overflow-hidden`}
            >
                <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-white/50`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium">{config.message}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Link 
                            to="/dashboard/subscription"
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 group ${config.btnColor}`}
                        >
                            Plans & Pricing
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <button 
                            onClick={() => setVisible(false)}
                            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
