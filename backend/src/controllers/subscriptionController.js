const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// ─── Seed default plans if none exist ────────────────────────────────────────
const DEFAULT_PLANS = [
    {
        key: 'Demo',
        label: 'Demo Package',
        duration: 7,
        imageLimit: 10,
        price: 0,
        isActive: true,
        popular: false,
        sortOrder: 1,
        color: '#64748b',
        features: ['7 days access', '10 AI image generations', 'Try the platform'],
    },
    {
        key: '1 Month',
        label: '1 Month Package',
        duration: 30,
        imageLimit: 100,
        price: 299,
        isActive: true,
        popular: true,
        sortOrder: 2,
        color: '#3b82f6',
        features: ['30 days access', '100 AI image generations', 'All image styles', 'Priority support'],
    },
    {
        key: '6 Months',
        label: '6 Months Package',
        duration: 180,
        imageLimit: 750,
        price: 1499,
        isActive: true,
        popular: false,
        sortOrder: 3,
        color: '#8b5cf6',
        features: ['180 days access', '750 AI image generations', 'All image styles', 'Priority support', 'Bulk savings'],
    },
    {
        key: '1 Year',
        label: '1 Year Package',
        duration: 365,
        imageLimit: 2000,
        price: 2499,
        isActive: true,
        popular: false,
        sortOrder: 4,
        color: '#f59e0b',
        features: ['365 days access', '2000 AI image generations', 'All image styles', 'VIP support', 'Best value'],
    },
];

async function seedDefaultPlans() {
    const count = await SubscriptionPlan.countDocuments();
    if (count === 0) {
        await SubscriptionPlan.insertMany(DEFAULT_PLANS);
        console.log('✅ Default subscription plans seeded.');
    }
}

/**
 * GET /api/subscription/packages  — list all active packages
 */
exports.getPackages = async (req, res, next) => {
    try {
        await seedDefaultPlans();
        const plans = await SubscriptionPlan.find({ isActive: true }).sort('sortOrder');
        console.log(`[Subscription] Found ${plans.length} active plans in database.`);
        res.json({ success: true, packages: plans });
    } catch (err) {
        console.error('[Subscription] Error fetching packages:', err.message);
        next(err);
    }
};

/**
 * GET /api/subscription/me  — get current user's subscription
 */
exports.getMy = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('subscription');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Auto-expire if past expiry date
        if (user.subscription?.status === 'Active' && user.subscription?.expiryDate) {
            if (new Date() > new Date(user.subscription.expiryDate)) {
                console.log(`[Subscription] Plan expired for user ${user._id}`);
                user.subscription.status = 'Expired';
                await user.save();
            }
        }

        res.json({ success: true, subscription: user.subscription });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/subscription/buy  — buy a package
 */
exports.buyPackage = async (req, res, next) => {
    try {
        await seedDefaultPlans();
        const { packageId } = req.body;

        // packageId can be plan _id or key
        const pkg = await SubscriptionPlan.findOne({
            $or: [{ _id: packageId.length === 24 ? packageId : null }, { key: packageId }],
            isActive: true,
        });

        if (!pkg) return res.status(400).json({ success: false, message: 'Invalid or inactive package selected' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Prevent buying Demo twice
        if (pkg.key === 'Demo' && user.subscription?.packageName) {
            return res.status(400).json({ success: false, message: 'Demo package can only be used once' });
        }

        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setDate(expiryDate.getDate() + pkg.duration);

        user.subscription = {
            packageName: pkg.label,
            startDate,
            expiryDate,
            imageLimit: pkg.imageLimit,
            imagesUsed: 0,
            status: 'Active',
        };

        await user.save();
        console.log(`[Subscription] User ${user._id} purchased package: ${pkg.label}`);
        res.json({ success: true, message: `${pkg.label} activated successfully!`, subscription: user.subscription });
    } catch (err) {
        next(err);
    }
};
