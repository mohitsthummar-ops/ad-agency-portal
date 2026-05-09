import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Globe, FileText, Image } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function WebsiteSettings() {
    const [tab, setTab] = useState('policies');
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(null);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        adminAPI.getSettings()
            .then((r) => { setSettings(r.data.settings); reset(r.data.settings); })
            .catch(() => { });
    }, []);

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            await adminAPI.updateSettings(data);
            toast.success('Settings saved!');
        } catch { toast.error('Failed to save settings'); }
        finally { setSaving(false); }
    };

    const tabs = [
        { id: 'policies', label: 'Policies', icon: FileText },
        { id: 'site', label: 'Site Info', icon: Globe },
        { id: 'banners', label: 'Banners', icon: Image },
    ];

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1 tracking-tight">
                    <Settings className="w-6 h-6 text-indigo-500" /> Website Settings
                </h1>
                <p className="text-slate-500 text-sm font-medium">Configure global platform settings.</p>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-xl w-fit border border-slate-200/50">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}>
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {tab === 'policies' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 space-y-6">
                        <h3 className="text-slate-900 font-bold text-lg mb-2">Update Legal Content</h3>
                        {[
                            { name: 'privacyPolicy', label: 'Privacy Policy Content' },
                            { name: 'termsConditions', label: 'Terms & Conditions Content' },
                        ].map(({ name, label }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
                                <textarea {...register(name)} rows={6}
                                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y text-sm font-mono shadow-sm" placeholder={`Enter ${label}...`} />
                            </div>
                        ))}
                    </motion.div>
                )}

                {tab === 'site' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 space-y-5">
                        <h3 className="text-slate-900 font-bold text-lg mb-2">Site Information</h3>
                        {[
                            { name: 'siteName', label: 'Site Name', placeholder: 'AdAgency Portal' },
                            { name: 'siteEmail', label: 'Support Email', placeholder: 'hello@adagency.com', type: 'email' },
                            { name: 'sitePhone', label: 'Contact Phone', placeholder: '+91 98765 43210' },
                            { name: 'siteAddress', label: 'Address', placeholder: '123 Ad Street, Mumbai, India' },
                        ].map(({ name, label, placeholder, type }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
                                <input {...register(name)} type={type || 'text'} placeholder={placeholder} className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all text-sm" />
                            </div>
                        ))}
                    </motion.div>
                )}

                {tab === 'banners' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 space-y-5">
                        <h3 className="text-slate-900 font-bold text-lg mb-2">Hero Banner Settings</h3>
                        {[
                            { name: 'heroBannerTitle', label: 'Hero Title', placeholder: 'Power Your Brand With Smart Ads' },
                            { name: 'heroBannerSubtitle', label: 'Hero Subtitle', placeholder: 'Enter subtitle...' },
                            { name: 'heroBannerCTA', label: 'CTA Button Text', placeholder: 'Get Started Free' },
                            { name: 'announcementBar', label: 'Announcement Bar Text', placeholder: 'Announcement text (leave empty to hide)' },
                        ].map(({ name, label, placeholder }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
                                <input {...register(name)} type="text" placeholder={placeholder} className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all text-sm" />
                            </div>
                        ))}
                    </motion.div>
                )}

                <div className="mt-6">
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-60 text-sm">
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <><Save className="w-4 h-4" /> Save Settings</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
