import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Edit2, Trash2, CheckCircle2, XCircle, 
    Zap, Image as ImageIcon, Clock, IndianRupee,
    MoreVertical, Save, X, AlertTriangle, List
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function SubscriptionPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        key: '',
        label: '',
        duration: 30,
        imageLimit: 10,
        price: 0,
        isActive: true,
        popular: false,
        color: '#6366f1',
        sortOrder: 0,
        features: []
    });
    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await adminAPI.getPlans();
            setPlans(res.data.plans);
        } catch (err) {
            toast.error('Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                key: plan.key,
                label: plan.label,
                duration: plan.duration,
                imageLimit: plan.imageLimit,
                price: plan.price,
                isActive: plan.isActive,
                popular: plan.popular,
                color: plan.color || '#6366f1',
                sortOrder: plan.sortOrder || 0,
                features: plan.features || []
            });
        } else {
            setEditingPlan(null);
            setFormData({
                key: '',
                label: '',
                duration: 30,
                imageLimit: 10,
                price: 0,
                isActive: true,
                popular: false,
                color: '#6366f1',
                sortOrder: plans.length + 1,
                features: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await adminAPI.updatePlan(editingPlan._id, formData);
                toast.success('Plan updated successfully');
            } else {
                await adminAPI.createPlan(formData);
                toast.success('Plan created successfully');
            }
            setIsModalOpen(false);
            fetchPlans();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this plan?')) return;
        try {
            await adminAPI.deletePlan(id);
            toast.success('Plan deleted');
            fetchPlans();
        } catch (err) {
            toast.error('Failed to delete plan');
        }
    };

    const handleToggle = async (id) => {
        try {
            await adminAPI.togglePlan(id);
            toast.success('Status toggled');
            fetchPlans();
        } catch (err) {
            toast.error('Toggle failed');
        }
    };

    const addFeature = () => {
        if (!featureInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, featureInput.trim()]
        }));
        setFeatureInput('');
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Subscription Plans</h1>
                    <p className="text-slate-500 text-sm">Manage dynamic subscription packages for your users.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add New Plan
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`
                                relative bg-white border rounded-2xl p-6 overflow-hidden transition-all hover:shadow-lg
                                ${plan.isActive ? 'border-slate-200' : 'border-red-100 opacity-75'}
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rotate-45 translate-x-4 translate-y-2">
                                        POPULAR
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
                                >
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleOpenModal(plan)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(plan._id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-800">{plan.label}</h3>
                                <p className="text-sm text-slate-500 font-medium capitalize">{plan.key} Plan</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                        <IndianRupee className="w-3 h-3" /> Price
                                    </div>
                                    <p className="font-bold text-slate-800">₹{plan.price}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                        <Clock className="w-3 h-3" /> Duration
                                    </div>
                                    <p className="font-bold text-slate-800">{plan.duration} Days</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                        <ImageIcon className="w-3 h-3" /> Images
                                    </div>
                                    <p className="font-bold text-slate-800">{plan.imageLimit}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                        <List className="w-3 h-3" /> Sort Order
                                    </div>
                                    <p className="font-bold text-slate-800">#{plan.sortOrder}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {plan.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                    <button 
                                        onClick={() => handleToggle(plan._id)}
                                        className="text-xs text-blue-600 font-semibold hover:underline"
                                    >
                                        Switch to {plan.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {plans.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white border border-dashed rounded-2xl">
                            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No subscription plans found. Create one to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Plan Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-600">Plan Key (e.g., Demo, Monthly)</label>
                                        <input 
                                            type="text" required
                                            className="input-field"
                                            value={formData.key}
                                            onChange={e => setFormData({...formData, key: e.target.value})}
                                            disabled={!!editingPlan}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-600">Display Label</label>
                                        <input 
                                            type="text" required
                                            className="input-field"
                                            value={formData.label}
                                            onChange={e => setFormData({...formData, label: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-600">Duration (Days)</label>
                                        <input 
                                            type="number" required
                                            className="input-field"
                                            value={formData.duration}
                                            onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-600">Image Generation Limit</label>
                                        <input 
                                            type="number" required
                                            className="input-field"
                                            value={formData.imageLimit}
                                            onChange={e => setFormData({...formData, imageLimit: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-600">Price (₹)</label>
                                        <input 
                                            type="number" required
                                            className="input-field"
                                            value={formData.price}
                                            onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-600">Sort Order</label>
                                        <input 
                                            type="number" required
                                            className="input-field"
                                            value={formData.sortOrder}
                                            onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-600">Theme Color</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="color"
                                                className="w-10 h-10 p-0 rounded-lg overflow-hidden border-none"
                                                value={formData.color}
                                                onChange={e => setFormData({...formData, color: e.target.value})}
                                            />
                                            <input 
                                                type="text"
                                                className="input-field flex-1"
                                                value={formData.color}
                                                onChange={e => setFormData({...formData, color: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-slate-700">Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={formData.popular}
                                                onChange={e => setFormData({...formData, popular: e.target.checked})}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-slate-700">Mark Popular</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600">Plan Features</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            className="input-field flex-1"
                                            placeholder="e.g., 24/7 Support"
                                            value={featureInput}
                                            onChange={e => setFeatureInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        />
                                        <button 
                                            type="button"
                                            onClick={addFeature}
                                            className="px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {formData.features.map((feature, idx) => (
                                            <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                                                {feature}
                                                <button type="button" onClick={() => removeFeature(idx)} className="hover:text-red-500">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="submit"
                                        className="btn btn-primary flex-1 py-3"
                                    >
                                        {editingPlan ? 'Update Plan' : 'Create Plan'}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn bg-slate-100 text-slate-600 border border-slate-200 px-6 py-3"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
