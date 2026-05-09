import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, Shield, CheckCircle, IndianRupee } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { transactionAPI } from '../../services/api';
import { loadRazorpayScript, openRazorpayCheckout } from '../../utils/razorpay';
import useAuthStore from '../../store/authStore';

const PLANS = [
    { id: 'wallet_topup', label: 'Wallet Top-Up', amounts: [500, 1000, 2000, 5000], description: 'Add funds to your wallet', color: '#6366f1' },
    { id: 'ad_boost', label: 'Ad Boost', amounts: [999, 1999, 4999], description: 'Boost your ad visibility', color: '#ec4899' },
    { id: 'account_upgrade', label: 'Premium Account', amounts: [2999], description: 'Unlock premium features', color: '#f59e0b' },
];

export default function Checkout() {
    const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
    const [selectedAmount, setSelectedAmount] = useState(500);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(null);
    const { user } = useAuthStore();

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) { toast.error('Failed to load Razorpay. Check your internet connection.'); return; }

            // Create order on backend
            const orderRes = await transactionAPI.createOrder({
                amount: selectedAmount,
                purpose: selectedPlan.id,
                description: `${selectedPlan.label} - ₹${selectedAmount}`,
            });
            const { order, key } = orderRes.data;

            // Open Razorpay checkout
            openRazorpayCheckout({
                orderId: order.id,
                amount: selectedAmount,
                keyId: key,
                prefill: { name: user.name, email: user.email, contact: user.phone || '' },
                description: `${selectedPlan.label} Payment`,
                onSuccess: async (response) => {
                    try {
                        const verifyRes = await transactionAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        setSuccess({ paymentId: response.razorpay_payment_id, amount: selectedAmount });
                        toast.success('Payment successful! 🎉');
                    } catch { toast.error('Payment verification failed'); }
                },
                onDismiss: () => toast('Payment cancelled'),
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setProcessing(false);
        }
    };

    if (success) return (
        <div className="max-w-md mx-auto mt-10">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-5" />
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Payment Successful!</h2>
                <p className="text-slate-600 font-medium mb-4">₹{success.amount.toLocaleString()} added successfully.</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-8">
                    <p className="text-slate-500 text-xs font-mono">Payment ID: {success.paymentId}</p>
                </div>
                <button onClick={() => setSuccess(null)}
                    className="w-full px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]">
                    Make Another Payment
                </button>
            </motion.div>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1 tracking-tight">
                    <CreditCard className="w-6 h-6 text-indigo-500" /> Payment & Checkout
                </h1>
                <p className="text-slate-500 text-sm font-medium">Secure payments powered by Razorpay</p>
            </div>

            {/* Plan Selection */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                <h3 className="text-slate-900 font-bold mb-5">Select Product</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PLANS.map((plan) => (
                        <button key={plan.id} onClick={() => { setSelectedPlan(plan); setSelectedAmount(plan.amounts[0]); }}
                            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${selectedPlan.id === plan.id
                                ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                }`}>
                            {selectedPlan.id === plan.id && (
                                <motion.div layoutId="plan-indicator" className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-indigo-500 rounded-bl-2xl">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </motion.div>
                            )}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm border border-slate-100 bg-white group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5" style={{ color: plan.color }} />
                            </div>
                            <p className="text-slate-900 text-sm font-bold">{plan.label}</p>
                            <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">{plan.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Amount Selection */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                <h3 className="text-slate-900 font-bold mb-5">Select Amount</h3>
                <div className="flex flex-wrap gap-3">
                    {selectedPlan.amounts.map((amt) => (
                        <button key={amt} onClick={() => setSelectedAmount(amt)}
                            className={`flex items-center gap-1.5 px-6 py-3 rounded-xl border font-bold transition-all shadow-sm ${selectedAmount === amt
                                ? 'border-indigo-500 bg-indigo-600 text-white'
                                : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:bg-slate-50'
                                }`}>
                            <IndianRupee className="w-4 h-4" />{amt.toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                <h3 className="text-slate-900 font-bold mb-5">Order Summary</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">{selectedPlan.label}</span>
                        <span className="text-slate-900 font-bold">₹{selectedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">GST (18%)</span>
                        <span className="text-slate-900 font-bold">₹{Math.round(selectedAmount * 0.18).toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-4" />
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <span className="text-slate-900 font-bold">Total Amount Payable</span>
                        <div className="flex items-center gap-1 text-indigo-600 text-xl font-black tracking-tight">
                            <IndianRupee className="w-5 h-5" />
                            {(selectedAmount + Math.round(selectedAmount * 0.18)).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pay Button */}
            <div className="pt-2 space-y-4">
                <button onClick={handlePayment} disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200/50 transition-all active:scale-[0.98] disabled:opacity-60 text-lg">
                    {processing
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Shield className="w-5 h-5" /> Pay Securely with Razorpay</>
                    }
                </button>

                <p className="text-center text-slate-500 text-xs font-medium flex items-center justify-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" /> 256-bit SSL encrypted • PCI-DSS compliant
                </p>
            </div>
        </div>
    );
}
