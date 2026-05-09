import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Lock, Save, Camera, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function ProfileSettings() {
    const { user, updateUser } = useAuthStore();
    const [tab, setTab] = useState('profile');
    const [showPass, setShowPass] = useState(false);
    const [saving, setSaving] = useState(false);

    const { register: regProfile, handleSubmit: handleProfile, formState: { errors: pErr } } = useForm({
        defaultValues: { name: user?.name, phone: user?.phone || '' },
    });
    const { register: regPass, handleSubmit: handlePass, reset: resetPass, formState: { errors: passErr }, getValues } = useForm();

    const onUpdateProfile = async (data) => {
        setSaving(true);
        try {
            const res = await userAPI.updateProfile(data);
            updateUser(res.data.user);
            toast.success('Profile updated!');
        } catch { toast.error('Failed to update profile'); }
        finally { setSaving(false); }
    };

    const onChangePassword = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setSaving(true);
        try {
            await userAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
            toast.success('Password changed successfully!');
            resetPass();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
        finally { setSaving(false); }
    };

    return (
        <div className="max-w-xl space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>

            {/* Avatar */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex items-center gap-5">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform">
                        <Camera className="w-3 h-3 text-white" />
                    </span>
                </div>
                <div>
                    <p className="text-slate-900 font-bold text-lg">{user?.name}</p>
                    <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold mt-1.5 ${user?.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {user?.role}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-xl">
                {['profile', 'password'].map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}>
                        {t === 'profile' ? '👤 Profile' : '🔒 Password'}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {tab === 'profile' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                    <form onSubmit={handleProfile(onUpdateProfile)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input {...regProfile('name', { required: 'Name is required' })} type="text"
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 pl-10 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all text-sm" id="name" />
                            </div>
                            {pErr.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{pErr.name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="email" value={user?.email} disabled
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-2.5 pl-10 outline-none shadow-sm transition-all text-sm cursor-not-allowed" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input {...regProfile('phone')} type="tel"
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 pl-10 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all text-sm" id="phone" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button type="submit" disabled={saving}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-60 text-sm">
                                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Password Tab */}
            {tab === 'password' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                    <form onSubmit={handlePass(onChangePassword)} className="space-y-5">
                        {[
                            { name: 'currentPassword', label: 'Current Password' },
                            { name: 'newPassword', label: 'New Password', rules: { minLength: { value: 6, message: 'Min. 6 characters' } } },
                            { name: 'confirmPassword', label: 'Confirm New Password' },
                        ].map(({ name, label, rules }) => (
                            <div key={name}>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input {...regPass(name, { required: `${label} is required`, ...rules })}
                                        type={showPass ? 'text' : 'password'}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 pl-10 pr-10 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all text-sm" id={name} />
                                    {name === 'currentPassword' && (
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                                {passErr[name] && <p className="text-red-500 text-xs mt-1.5 font-medium">{passErr[name].message}</p>}
                            </div>
                        ))}
                        <div className="pt-2">
                            <button type="submit" disabled={saving}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-60 text-sm">
                                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><Lock className="w-4 h-4" /> Change Password</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </div>
    );
}
