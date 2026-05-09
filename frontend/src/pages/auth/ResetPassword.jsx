import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const schema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match', path: ['confirmPassword'],
});

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await authAPI.resetPassword(token, { password: data.password });
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed or link expired');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center px-4">
            <div className="orb orb-cyan w-72 h-72 top-20 -right-10" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
                <div className="glass-card p-8 md:p-10">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
                        <p className="text-slate-500 text-sm">Enter your new password below</p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {['password', 'confirmPassword'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    {field === 'password' ? 'New Password' : 'Confirm Password'}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input {...register(field)} type={showPass ? 'text' : 'password'}
                                        placeholder={field === 'password' ? 'Min. 6 characters' : 'Re-enter password'}
                                        className="input-dark pl-10 pr-10" id={field} />
                                    {field === 'password' && (
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                                {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field].message}</p>}
                            </div>
                        ))}
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold btn-glow text-white disabled:opacity-60">
                            {loading
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><CheckCircle className="w-4 h-4" /> Reset Password</>
                            }
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
