import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Zap, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const schema = z.object({
    email: z.string().email('Enter a valid email address'),
});

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async ({ email }) => {
        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center px-4">
            <div className="orb orb-purple w-72 h-72 top-20 -left-10" />
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-card p-8 md:p-10">
                    {!sent ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-1">Forgot Password?</h1>
                                <p className="text-slate-500 text-sm">Enter your email and we'll send a reset link</p>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input {...register('email')} type="email" placeholder="you@example.com" className="input-dark pl-10" id="email" />
                                    </div>
                                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold btn-glow text-white disabled:opacity-60">
                                    {loading
                                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><Send className="w-4 h-4" /> Send Reset Link</>
                                    }
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
                            <p className="text-slate-400 text-sm mb-6">
                                If an account exists with that email, we've sent a reset link. Check your inbox.
                            </p>
                        </div>
                    )}
                    <div className="text-center mt-4">
                        <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
