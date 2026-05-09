const User = require('../models/User');
const Ad = require('../models/Ad');
const Transaction = require('../models/Transaction');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Platform = require('../models/Platform');

// ─── @route   GET /api/admin/stats ───────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const [totalUsers, totalAds, activePlatforms, statusAgg, revenueAgg, growthAgg] = await Promise.all([
            User.countDocuments({ isDeleted: { $ne: true } }),
            Ad.countDocuments({ isDeleted: { $ne: true } }),
            Platform.countDocuments({ isActive: true }),
            
            // Ad Status Distribution
            Ad.aggregate([
                { $match: { isDeleted: { $ne: true } } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // Total Revenue
            Transaction.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),

            // Monthly Growth (Revenue & Users)
            Promise.all([
                Transaction.aggregate([
                    { $match: { status: 'paid', createdAt: { $gte: sixMonthsAgo } } },
                    { $group: {
                        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                        revenue: { $sum: '$amount' }
                    }},
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ]),
                User.aggregate([
                    { $match: { isDeleted: { $ne: true }, createdAt: { $gte: sixMonthsAgo } } },
                    { $group: {
                        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                        count: { $sum: 1 }
                    }},
                    { $sort: { '_id.year': 1, '_id.month': 1 } }
                ])
            ])
        ]);

        const totalRevenueValue = revenueAgg[0]?.total || 0;
        
        // Format status distribution into a clean object
        const statusDistribution = {
            active: 0, pending: 0, rejected: 0, paused: 0
        };
        statusAgg.forEach(item => {
            if (statusDistribution.hasOwnProperty(item._id)) {
                statusDistribution[item._id] = item.count;
            }
        });

        // Combine growth data
        const [revGrowth, usrGrowth] = growthAgg;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Create a map of last 6 months to ensure we have entries for all
        const growthData = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            
            const revItem = revGrowth.find(rg => rg._id.month === m && rg._id.year === y);
            const usrItem = usrGrowth.find(ug => ug._id.month === m && ug._id.year === y);
            
            growthData.push({
                month: months[d.getMonth()],
                revenue: revItem ? revItem.revenue : 0,
                users: usrItem ? usrItem.count : 0
            });
        }

        res.status(200).json({
            success: true,
            totalUsers,
            totalAds,
            activePlatforms,
            totalRevenue: totalRevenueValue,
            statusDistribution,
            growthData,
            // Mocking weekly clicks for now as we don't track daily clicks yet
            weeklyClicks: [4000, 3000, 2000, 2780, 1890, 2390, 3490]
        });
    } catch (err) { next(err); }
};

// ─── @route   GET /api/admin/users ───────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, search, filter = 'active' } = req.query;
        
        // Define query based on filter
        const query = {};
        if (filter === 'archived') {
            query.isDeleted = true;
        } else {
            query.isDeleted = { $ne: true };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .sort('-deletedAt -createdAt')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select('-password')
            .lean();

        const total = await User.countDocuments(query);
        res.status(200).json({ success: true, users, total, filter });
    } catch (err) { next(err); }
};

// ─── @route   PUT /api/admin/users/:id/block ─────────────────────────────────
exports.blockUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot block an admin' });
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.status(200).json({ success: true, isBlocked: user.isBlocked });
    } catch (err) { next(err); }
};

// ─── @route   DELETE /api/admin/users/:id ────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        
        if (!user || user.isDeleted) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete an admin account' });
        }

        console.log(`[Admin] Soft deleting user: ${user.email} (${userId})`);

        // 1. Soft delete all associated business data
        const AdRequest = require('../models/AdRequest');
        const Campaign = require('../models/Campaign');
        
        const now = new Date();
        await Promise.all([
            AdRequest.updateMany({ user: userId }, { $set: { isDeleted: true, deletedAt: now } }),
            Ad.updateMany({ createdBy: userId }, { $set: { isDeleted: true, deletedAt: now } }),
            Campaign.updateMany({ client: userId }, { $set: { isDeleted: true, deletedAt: now } })
        ]);

        // 2. Soft delete the user record itself
        user.isBlocked = true; // Also block for safety
        user.isDeleted = true;
        user.deletedAt = now;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'User and all associated data have been archived (soft-deleted)' 
        });
    } catch (err) { 
        console.error(`[Admin] Error soft-deleting user ${req.params.id}:`, err);
        next(err); 
    }
};

// ─── @route   PUT /api/admin/users/:id/restore ───────────────────────────────
exports.restoreUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isDeleted = false;
        user.deletedAt = null;
        user.isBlocked = false; // Unblock on restore
        await user.save();

        res.status(200).json({ success: true, message: 'User restored successfully' });
    } catch (err) { next(err); }
};

// ─── @route   DELETE /api/admin/ads/:id ──────────────────────────────────────
exports.deleteAd = async (req, res, next) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad || ad.isDeleted) return res.status(404).json({ success: false, message: 'Ad not found' });
        
        ad.isDeleted = true;
        ad.deletedAt = new Date();
        ad.status = 'paused'; // Mark as paused so it doesn't run anywhere
        await ad.save();

        res.status(200).json({ success: true, message: 'Ad has been archived' });
    } catch (err) { next(err); }
};

// ─── @route   GET /api/admin/ads ─────────────────────────────────────────────
exports.getAllAds = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 30 } = req.query;
        const query = { isDeleted: { $ne: true } };
        if (status) query.status = status;
        const [ads, total] = await Promise.all([
            Ad.find(query)
                .populate('category', 'name')
                .populate('platform', 'name')
                .populate('createdBy', 'name email')
                .sort('-createdAt')
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .lean(),
            Ad.countDocuments(query),
        ]);
        res.status(200).json({ success: true, ads, total });
    } catch (err) { next(err); }
};

// ─── @route   GET /api/admin/transactions ────────────────────────────────────
exports.getAllTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(100)
            .lean();
        res.status(200).json({ success: true, transactions });
    } catch (err) { next(err); }
};

// ─── Settings (in-memory for now, extend with DB model as needed) ─────────────
let _settings = {
    siteName: 'AdAgency Portal',
    siteEmail: 'hello@adagency.com',
    sitePhone: '+91 98765 43210',
    siteAddress: '123 Ad Street, Mumbai, India',
    heroBannerTitle: 'Power Your Brand With Smart Ads',
    heroBannerSubtitle: 'Discover, track, and manage campaigns all in one place.',
    heroBannerCTA: 'Get Started Free',
    announcementBar: '',
    privacyPolicy: '',
    termsConditions: '',
};

exports.getSettings = async (req, res) => {
    res.status(200).json({ success: true, settings: _settings });
};

exports.updateSettings = async (req, res) => {
    _settings = { ..._settings, ...req.body };
    res.status(200).json({ success: true, settings: _settings });
};

// ─── Subscription Plan CRUD ───────────────────────────────────────────────────

// GET /api/admin/plans
exports.getPlans = async (req, res, next) => {
    try {
        const plans = await SubscriptionPlan.find().sort('sortOrder');
        res.status(200).json({ success: true, plans });
    } catch (err) { next(err); }
};

// POST /api/admin/plans
exports.createPlan = async (req, res, next) => {
    try {
        const { key, label, duration, imageLimit, price, isActive, popular, features, color, sortOrder } = req.body;
        if (!key || !label || !duration || imageLimit == null || price == null) {
            return res.status(400).json({ success: false, message: 'key, label, duration, imageLimit, and price are required' });
        }
        const existing = await SubscriptionPlan.findOne({ key });
        if (existing) {
            return res.status(400).json({ success: false, message: 'A plan with this key already exists' });
        }
        const plan = await SubscriptionPlan.create({ key, label, duration, imageLimit, price, isActive, popular, features, color, sortOrder });
        res.status(201).json({ success: true, plan });
    } catch (err) { next(err); }
};

// PUT /api/admin/plans/:id
exports.updatePlan = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        const updates = req.body;
        Object.assign(plan, updates);
        await plan.save();
        res.status(200).json({ success: true, plan });
    } catch (err) { next(err); }
};

// DELETE /api/admin/plans/:id
exports.deletePlan = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        await plan.deleteOne();
        res.status(200).json({ success: true, message: 'Plan deleted' });
    } catch (err) { next(err); }
};

// PUT /api/admin/plans/:id/toggle
exports.togglePlan = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        plan.isActive = !plan.isActive;
        await plan.save();
        res.status(200).json({ success: true, isActive: plan.isActive });
    } catch (err) { next(err); }
};

