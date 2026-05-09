import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Receipt, CheckCircle2, XCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionAPI } from '../../services/api';

export default function PaymentHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await transactionAPI.getMyTransactions();
                setTransactions(res.data.transactions || []);
            } catch {
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Payment History</h1>
                <p className="text-slate-500 mt-1">Your transaction records and subscription payments.</p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="bg-slate-100 h-16 rounded-xl animate-pulse" />)}
                </div>
            ) : transactions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                    <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No payment history yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Once you purchase a subscription, it will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((txn, i) => (
                        <motion.div
                            key={txn._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-blue-200 transition-colors shadow-sm"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.status === 'paid' ? 'bg-green-50' : txn.status === 'failed' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                                {txn.status === 'paid' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                    txn.status === 'failed' ? <XCircle className="w-5 h-5 text-red-600" /> :
                                        <Clock className="w-5 h-5 text-yellow-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{txn.description || 'Package Purchase'}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {new Date(txn.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    {txn.razorpayPaymentId && ` · ${txn.razorpayPaymentId}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-800">₹{parseFloat(txn.amount).toFixed(2)}</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${txn.status === 'paid' ? 'bg-green-100 text-green-700' : txn.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {txn.status}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
