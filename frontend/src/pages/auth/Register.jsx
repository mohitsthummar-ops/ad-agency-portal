import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Phone, Eye, EyeOff, Zap, ArrowRight, Building2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['client', 'admin'], { errorMap: () => ({ message: 'Please select a role' }) })
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export default function Register() {
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { role: 'client' }
    });

    const watchRole = watch('role');

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const { confirmPassword, ...payload } = data;
            const res = await authAPI.register(payload);
            setAuth(res.data.user, res.data.token);
            toast.success('Account created successfully! 🎉');
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const textFields = [
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: User },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: Mail },
        { name: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210', icon: Phone },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16 relative overflow-hidden">
            {/* Elegant Orbs for background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-50 rounded-full blur-3xl opacity-60 pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Create Account</h1>
                        <p className="text-slate-500 text-sm font-medium">Join AdAgency to start your first campaign</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {textFields.map(({ name, label, type, placeholder, icon: Icon }) => (
                            <div key={name}>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
                                <div className="relative">
                                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register(name)}
                                        type={type}
                                        placeholder={placeholder}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                        id={name}
                                    />
                                </div>
                                {errors[name] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[name].message}</p>}
                            </div>
                        ))}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('password')}
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-11 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                    id="password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-11 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                    id="confirmPassword"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Hidden role field defaults to client */}
                        <input {...register('role')} type="hidden" value="client" />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                            id="register-btn"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><ArrowRight className="w-5 h-5" /> Create Account</>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm mt-8 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
