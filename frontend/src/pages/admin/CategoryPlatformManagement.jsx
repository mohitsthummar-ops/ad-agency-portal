import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Monitor, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryAPI, platformAPI } from '../../services/api';

function ItemModal({ type, item, onClose, onSave }) {
    const [form, setForm] = useState(item || { name: '', description: '', type: 'Electronics', color: '#6366f1' });
    const [saving, setSaving] = useState(false);
    const fields = type === 'category'
        ? ['name', 'description', 'type', 'color']
        : ['name', 'description', 'website'];

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error('Name is required');
        setSaving(true);
        try {
            if (item?._id) {
                type === 'category' ? await categoryAPI.update(item._id, form) : await platformAPI.update(item._id, form);
            } else {
                type === 'category' ? await categoryAPI.create(form) : await platformAPI.create(form);
            }
            toast.success(`${type === 'category' ? 'Category' : 'Platform'} ${item ? 'updated' : 'created'}!`);
            onSave();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md space-y-5">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {item ? 'Edit' : 'Add'} {type === 'category' ? 'Category' : 'Platform'}
                </h3>
                <div className="space-y-4">
                    {fields.map((f) => (
                        <div key={f}>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5 capitalize">{f}</label>
                            {f === 'type' ? (
                                <select value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all text-sm appearance-none">
                                    {['Electronics', 'Fashion', 'Education', 'Travel', 'Food', 'Health', 'Sports', 'Entertainment', 'Others'].map((o) => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            ) : f === 'color' ? (
                                <div className="flex items-center gap-3">
                                    <input type="color" value={form[f] || '#6366f1'}
                                        onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                                        className="w-12 h-11 rounded-xl border border-slate-200 bg-transparent cursor-pointer p-0.5" />
                                    <input type="text" value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all text-sm uppercase flex-1 font-mono" placeholder="#6366f1" />
                                </div>
                            ) : (
                                <input type={f === 'website' ? 'url' : 'text'} value={form[f] || ''}
                                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                                    placeholder={f} className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all text-sm" />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 pt-4">
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 text-sm transition-all disabled:opacity-60 relative overflow-hidden active:scale-[0.98]">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]">
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function DataList({ type, items, onEdit, onDelete, onToggle }) {
    return (
        <div className="space-y-3">
            {items.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm shadow-sm">
                    No {type === 'category' ? 'categories' : 'platforms'} yet. Add one!
                </div>
            )}
            {items.map((item) => (
                <div key={item._id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-all group">
                    <div className="flex items-center gap-4 min-w-0">
                        {type === 'category' && item.color && (
                            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border border-slate-100 shadow-sm" style={{ backgroundColor: `${item.color}15` }}>
                                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-slate-900 font-bold truncate">{item.name}</p>
                            {item.description && <p className="text-slate-500 text-xs font-medium truncate mt-0.5">{item.description}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border mr-2 ${item.isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onToggle(item._id, item.isActive)}
                                className={`p-2 rounded-lg transition-all border border-transparent flex items-center justify-center ${item.isActive ? 'text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200' : 'text-slate-400 hover:bg-slate-50 hover:border-slate-200 hover:text-slate-600'}`} title={item.isActive ? 'Deactivate' : 'Activate'}>
                                {item.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button onClick={() => onEdit(item)}
                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200 flex items-center justify-center" title="Edit">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(item._id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200 flex items-center justify-center" title="Delete">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function CategoryPlatformManagement() {
    const [tab, setTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // { type, item }

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, pRes] = await Promise.all([categoryAPI.getAll(), platformAPI.getAll()]);
            setCategories(cRes.data.categories || []);
            setPlatforms(pRes.data.platforms || []);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            tab === 'categories' ? await categoryAPI.delete(id) : await platformAPI.delete(id);
            await fetchData();
            toast.success('Deleted successfully');
        } catch { toast.error('Delete failed'); }
    };

    const handleToggle = async (id) => {
        try {
            tab === 'categories' ? await categoryAPI.toggle(id) : await platformAPI.toggle(id);
            await fetchData();
        } catch { toast.error('Toggle failed'); }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories & Platforms</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage ad categories and supported platforms.</p>
                </div>
                <button onClick={() => setModal({ type: tab === 'categories' ? 'category' : 'platform', item: null })}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]">
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-xl w-fit border border-slate-200/50">
                {['categories', 'platforms'].map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all flex items-center gap-2 ${tab === t ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}>
                        {t === 'categories' ? <Tag className="w-4 h-4" /> : <Monitor className="w-4 h-4" />} {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="bg-slate-100 rounded-xl h-20 animate-pulse border border-slate-200" />)}
                </div>
            ) : (
                <DataList
                    type={tab === 'categories' ? 'category' : 'platform'}
                    items={tab === 'categories' ? categories : platforms}
                    onEdit={(item) => setModal({ type: tab === 'categories' ? 'category' : 'platform', item })}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                />
            )}

            {modal && (
                <ItemModal
                    type={modal.type}
                    item={modal.item}
                    onClose={() => setModal(null)}
                    onSave={() => { fetchData(); setModal(null); }}
                />
            )}
        </div>
    );
}
