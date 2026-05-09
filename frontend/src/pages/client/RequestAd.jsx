import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Megaphone, Building2, FileText, Users, Tag, Phone, Image as ImageIcon, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adRequestAPI } from '../../services/api';

const IMAGE_STYLES = ['Instagram Post', 'Facebook Banner', 'Poster', 'Story Size', 'YouTube Thumbnail'];

export default function RequestAd() {
    const navigate = useNavigate();
    const location = useLocation();
    const prefill = location.state?.prefill || {};
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: prefill.title || '',
        businessName: '',
        description: prefill.description || '',
        targetAudience: prefill.targetAudience || '',
        offerDetails: '',
        contactInfo: '',
        logoUrl: '',
        imageStyle: prefill.imageStyle || 'Instagram Post',
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.businessName || !form.description) {
            toast.error('Please fill all required fields');
            return;
        }
        setLoading(true);
        try {
            await adRequestAPI.submit(form);
            toast.success('Campaign request submitted! Awaiting admin approval.');
            navigate('/dashboard/my-requests');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: 'title', label: 'Campaign Title', icon: Megaphone, placeholder: 'e.g. Summer Sale Campaign 2024', required: true, type: 'text' },
        { name: 'businessName', label: 'Business Name', icon: Building2, placeholder: 'e.g. Sharma Electronics', required: true, type: 'text' },
        { name: 'offerDetails', label: 'Offer Details', icon: Tag, placeholder: 'e.g. 50% off on all electronics this weekend!', type: 'text' },
        { name: 'targetAudience', label: 'Target Audience', icon: Users, placeholder: 'e.g. Young adults 18-35 interested in tech', type: 'text' },
        { name: 'contactInfo', label: 'Contact Info', icon: Phone, placeholder: 'e.g. +91 98765 43210 or website URL', type: 'text' },
        { name: 'logoUrl', label: 'Logo URL (Optional)', icon: ImageIcon, placeholder: 'https://yoursite.com/logo.png', type: 'url' },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Create Campaign Request</h1>
                <p className="text-slate-500 mt-1">Fill in the details below. Admin will review and approve your request.</p>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5"
            >
                {fields.map(({ name, label, icon: Icon, placeholder, required, type }) => (
                    <div key={name}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Icon className="w-4 h-4" />
                            </div>
                            <input
                                name={name}
                                type={type}
                                value={form[name]}
                                onChange={handleChange}
                                placeholder={placeholder}
                                required={required}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>
                ))}

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe your campaign, business, and what you want to promote..."
                            rows={4}
                            required
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{form.description.length}/1000 characters</p>
                </div>

                {/* Image Style */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">AI Image Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {IMAGE_STYLES.map(style => (
                            <button
                                key={style}
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, imageStyle: style }))}
                                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${form.imageStyle === style
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                                    }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                    💡 After admin approves your request, you can generate an AI advertisement image using your subscription's image credits.
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                        <>Submit Campaign Request <ChevronRight className="w-4 h-4" /></>
                    )}
                </button>
            </motion.form>
        </div>
    );
}
