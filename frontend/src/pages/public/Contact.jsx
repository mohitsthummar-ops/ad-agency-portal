import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function Contact() {
    const [sent, setSent] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        await new Promise((r) => setTimeout(r, 1000));
        setSent(true);
        reset();
        toast.success('Message sent! We\'ll get back to you soon.');
    };

    return (
        <div className="pt-12 pb-24 px-4 max-w-5xl mx-auto relative">
            {/* Light elegant background accents */}
            <div className="absolute top-20 left-0 w-80 h-80 bg-cyan-50 rounded-full blur-3xl opacity-60 pointer-events-none transform -translate-x-1/2"></div>
            <div className="absolute top-60 right-0 w-72 h-72 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none transform translate-x-1/2"></div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600">Touch</span>
                    </h1>
                    <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">Have questions? We'd love to hear from you.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Contact Information</h2>
                            <p className="text-slate-600 font-medium">Fill out the form and our team will get back to you within 24 hours.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: Mail, label: 'Email Us', value: 'hello@adagency.com', color: '#6366f1', bg: 'bg-indigo-50' },
                                { icon: Phone, label: 'Call Us', value: '+91 98765 43210', color: '#ec4899', bg: 'bg-pink-50' },
                                { icon: MapPin, label: 'Visit Us', value: '123 Ad Street, Mumbai, India', color: '#06b6d4', bg: 'bg-cyan-50' },
                            ].map(({ icon: Icon, label, value, color, bg }) => (
                                <div key={label} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${bg} border border-slate-100`}>
                                        <Icon className="w-6 h-6" style={{ color }} />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-sm font-bold tracking-wide uppercase mb-1">{label}</p>
                                        <p className="text-slate-900 font-bold text-lg">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 md:p-10 relative overflow-hidden">
                        {/* Decorative background for the form */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-indigo-600"></div>

                        {sent ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12 flex flex-col items-center justify-center h-full min-h-[400px]"
                            >
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Message Sent!</h3>
                                <p className="text-slate-500 text-lg mb-8 max-w-[250px] mx-auto leading-relaxed">Thanks for reaching out. We'll respond within 24 hours.</p>
                                <button onClick={() => setSent(false)} className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all shadow-sm">
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a Message</h3>
                                {['name', 'email', 'subject'].map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 capitalize">{field}</label>
                                        <input {...register(field, { required: `${field} is required` })}
                                            type={field === 'email' ? 'email' : 'text'}
                                            placeholder={field === 'email' ? 'you@example.com' : `Your ${field}`}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400 shadow-sm" id={field} />
                                        {errors[field] && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors[field].message}</p>}
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Message</label>
                                    <textarea {...register('message', { required: 'Message is required' })}
                                        rows={4} placeholder="Tell us how we can help..."
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400 shadow-sm resize-none" id="message" />
                                    {errors.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.message.message}</p>}
                                </div>
                                <button type="submit" disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-base">
                                    {isSubmitting
                                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><Send className="w-5 h-5" /> Send Message</>
                                    }
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
