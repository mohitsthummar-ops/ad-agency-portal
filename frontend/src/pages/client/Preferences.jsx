import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { userAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];
const AGE_GROUPS = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];
const BUDGETS = ['low', 'medium', 'high', 'premium'];
const INTERESTS = ['Electronics', 'Fashion', 'Education', 'Travel', 'Food', 'Health', 'Sports', 'Entertainment', 'Others'];

const budgetColors = { low: '#10b981', medium: '#0ea5e9', high: '#f59e0b', premium: '#ec4899' };
const budgetLabels = { low: '₹ Low', medium: '₹₹ Medium', high: '₹₹₹ High', premium: '₹₹₹₹ Premium' };

function SelectionChip({ label, selected, onClick, color }) {
    return (
        <button type="button" onClick={onClick}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all shadow-sm ${selected
                ? 'text-white border-transparent shadow-md transform scale-[1.02]'
                : 'text-slate-600 border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
            style={selected ? { background: color || '#4f46e5', borderColor: color || '#4f46e5' } : {}}
        >
            {label}
        </button>
    );
}

export default function Preferences() {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const { user, updateUser } = useAuthStore();

    const { control, handleSubmit, watch, setValue, reset } = useForm({
        defaultValues: {
            gender: user?.preferences?.gender || 'prefer_not_to_say',
            ageGroup: user?.preferences?.ageGroup || '18-24',
            budget: user?.preferences?.budget || 'medium',
            interests: user?.preferences?.interests || [],
        },
    });

    const interests = watch('interests');

    const toggleInterest = (item) => {
        setValue('interests',
            interests.includes(item) ? interests.filter((i) => i !== item) : [...interests, item]
        );
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await userAPI.updatePreferences(data);
            updateUser({ preferences: res.data.preferences });
            setSaved(true);
            toast.success('Preferences saved successfully!');
            setTimeout(() => setSaved(false), 3000);
        } catch {
            toast.error('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2 mb-1 tracking-tight">
                    <SlidersHorizontal className="w-7 h-7 text-indigo-500" /> My Preferences
                </h1>
                <p className="text-slate-500 text-sm font-medium">Customize your ad experience based on your profile.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Gender */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                    <h3 className="text-slate-900 font-bold mb-5 flex items-center gap-2">Gender</h3>
                    <Controller name="gender" control={control} render={({ field }) => (
                        <div className="flex flex-wrap gap-3">
                            {GENDERS.map((g) => (
                                <SelectionChip key={g} label={g.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    selected={field.value === g} onClick={() => field.onChange(g)} />
                            ))}
                        </div>
                    )} />
                </div>

                {/* Age Group */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                    <h3 className="text-slate-900 font-bold mb-5 flex items-center gap-2">Age Group</h3>
                    <Controller name="ageGroup" control={control} render={({ field }) => (
                        <div className="flex flex-wrap gap-3">
                            {AGE_GROUPS.map((a) => (
                                <SelectionChip key={a} label={a} selected={field.value === a} onClick={() => field.onChange(a)} />
                            ))}
                        </div>
                    )} />
                </div>

                {/* Budget */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                    <h3 className="text-slate-900 font-bold mb-5 flex items-center gap-2">Budget Preference</h3>
                    <Controller name="budget" control={control} render={({ field }) => (
                        <div className="flex flex-wrap gap-3">
                            {BUDGETS.map((b) => (
                                <SelectionChip key={b} label={budgetLabels[b]}
                                    selected={field.value === b} onClick={() => field.onChange(b)} color={budgetColors[b]} />
                            ))}
                        </div>
                    )} />
                </div>

                {/* Interests */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                    <div className="mb-5">
                        <h3 className="text-slate-900 font-bold mb-1">Interests</h3>
                        <p className="text-slate-500 text-xs font-medium">Select all that apply. These determine which ads you see.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {INTERESTS.map((item) => (
                            <SelectionChip key={item} label={item}
                                selected={interests.includes(item)} onClick={() => toggleInterest(item)} />
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={loading}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-60 text-base md:w-auto w-full">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : saved ? (
                            <><Check className="w-5 h-5" /> Saved!</>
                        ) : (
                            <><Save className="w-5 h-5" /> Save Preferences</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
