import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Shield, Trash2, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(null); // stores userId to delete
    const [activeTab, setActiveTab] = useState('active');

    const fetchUsers = () => {
        setLoading(true);
        adminAPI.getUsers({ filter: activeTab })
            .then((r) => setUsers(r.data.users || []))
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const filteredUsers = users.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleBlock = async (userId, isBlocked) => {
        try {
            await adminAPI.blockUser(userId);
            setUsers((prev) => prev.map((u) =>
                u._id === userId ? { ...u, isBlocked: !isBlocked } : u
            ));
            toast.success(isBlocked ? 'User unblocked' : 'User blocked');
        } catch { toast.error('Action failed'); }
    };

    const handleDelete = async () => {
        if (!showDeleteModal) return;
        try {
            await adminAPI.deleteUser(showDeleteModal);
            setUsers((prev) => prev.filter((u) => u._id !== showDeleteModal));
            toast.success('User permanently archived');
            setShowDeleteModal(null);
        } catch { toast.error('Delete failed'); }
    };

    const handleRestore = async (userId) => {
        try {
            // We can reuse the block API or add a specific restore API. 
            // For now, let's assume we can update the user directly if we added an API.
            // I'll add a restore API call here.
            await adminAPI.restoreUser(userId); 
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            toast.success('User restored successfully');
        } catch { toast.error('Restore failed'); }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1 tracking-tight">
                        <Users className="w-6 h-6 text-indigo-600" /> User Management
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-slate-600 text-sm font-medium">{users.length} {activeTab} users</p>
                    </div>
                </div>
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search users..." value={search}
                        onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-48 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                <button onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'active' ? 'border-indigo-600 text-indigo-700 bg-indigo-50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    Active Users
                </button>
                <button onClick={() => setActiveTab('archived')}
                    className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'archived' ? 'border-red-600 text-red-700 bg-red-50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    Archived (Deleted)
                </button>
            </div>

            <div className="glass-card overflow-hidden bg-white border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold">
                                <th className="text-left p-4">User</th>
                                <th className="text-left p-4">Role</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">{activeTab === 'archived' ? 'Deleted On' : 'Joined'}</th>
                                <th className="text-right p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td colSpan={5} className="p-4">
                                            <div className="h-8 bg-slate-100 rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                                : filteredUsers.map((user) => (
                                    <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-sm font-bold shrink-0">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 font-bold">{user.name}</p>
                                                    <p className="text-slate-500 text-xs font-medium mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${user.isDeleted ? 'text-red-700 bg-red-50 border-red-200' : user.isBlocked ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                                                {user.isDeleted ? 'Archived' : user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 text-xs font-medium">
                                            {new Date(user.isDeleted ? user.deletedAt : user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.isDeleted ? (
                                                    <button onClick={() => handleRestore(user._id)}
                                                        className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-200 flex items-center gap-1 text-xs font-bold" title="Restore User">
                                                        <CheckCircle className="w-4 h-4" /> Restore
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleBlock(user._id, user.isBlocked)}
                                                            className={`p-2 rounded-lg transition-all border border-transparent ${user.isBlocked
                                                                ? 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                                                                : 'text-amber-600 hover:bg-amber-50 hover:border-amber-200'
                                                                }`} title={user.isBlocked ? 'Unblock' : 'Block'}>
                                                            {user.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={() => setShowDeleteModal(user._id)}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            }
                            {!loading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User Account?</h3>
                                <p className="text-slate-500 text-sm">
                                    Are you sure you want to delete this user? All their campaigns and data will be permanently archived in the database.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                                >
                                    Yes, Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
