const Ad = require('../models/Ad');
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');

// ─── Multer for ad images ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/ads/'),
    filename: (req, file, cb) =>
        cb(null, `ad-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadAdImage = upload.single('image');

// ─── @route   GET /api/ads ────────────────────────────────────────────────────
exports.getAllAds = async (req, res, next) => {
    try {
        const { category, platform, status, page = 1, limit = 12, search } = req.query;
        const query = { isDeleted: { $ne: true } };
        if (category) query.category = category;
        if (platform) query.platform = platform;
        if (status) query.status = status;
        if (search) query.title = { $regex: search, $options: 'i' };

        const skip = (page - 1) * limit;
        const [ads, total] = await Promise.all([
            Ad.find(query)
                .populate('category', 'name color')
                .populate('platform', 'name icon')
                .populate('createdBy', 'name')
                .sort('-createdAt')
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Ad.countDocuments(query),
        ]);

        res.status(200).json({
            success: true, ads,
            pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
        });
    } catch (err) { next(err); }
};

// ─── @route   GET /api/ads/personalized ──────────────────────────────────────
exports.getPersonalizedAds = async (req, res, next) => {
    try {
        const user = req.user;
        const { interests, budget, gender, ageGroup } = user.preferences || {};
        const query = { status: 'active', isDeleted: { $ne: true } };

        if (interests?.length) {
            const cats = await Category.find({ type: { $in: interests } }).select('_id');
            if (cats.length) query.category = { $in: cats.map((c) => c._id) };
        }
        if (budget) query['targetAudience.budget'] = { $in: [budget, 'all'] };
        if (gender) query['targetAudience.gender'] = { $in: [gender, 'all'] };

        let ads = await Ad.find(query)
            .populate('category', 'name color')
            .populate('platform', 'name icon')
            .sort('-createdAt')
            .limit(24)
            .lean();

        if (ads.length < 6) {
            const defaultAds = await Ad.find({ status: 'active' })
                .populate('category', 'name color')
                .populate('platform', 'name icon')
                .sort('-analytics.views')
                .limit(12)
                .lean();
            ads = [...ads, ...defaultAds.filter((d) => !ads.find((a) => a._id.toString() === d._id.toString()))];
        }

        res.status(200).json({ success: true, ads: ads.slice(0, 24) });
    } catch (err) { next(err); }
};

// ─── @route   GET /api/ads/default ───────────────────────────────────────────
exports.getDefaultAds = async (req, res, next) => {
    try {
        const ads = await Ad.find({ status: 'active', isDeleted: { $ne: true } })
            .populate('category', 'name color')
            .populate('platform', 'name icon')
            .sort('-analytics.views')
            .limit(24)
            .lean();
        res.status(200).json({ success: true, ads });
    } catch (err) { next(err); }
};

// ─── @route   GET /api/ads/:id ────────────────────────────────────────────────
exports.getAdById = async (req, res, next) => {
    try {
        const ad = await Ad.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
            .populate('category', 'name color slug')
            .populate('platform', 'name icon website')
            .populate('createdBy', 'name');
        if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
        res.status(200).json({ success: true, ad });
    } catch (err) { next(err); }
};

// ─── @route   POST /api/ads/:id/view ─────────────────────────────────────────
exports.trackView = async (req, res, next) => {
    try {
        await Ad.findByIdAndUpdate(req.params.id, { $inc: { 'analytics.views': 1 } });
        res.status(200).json({ success: true });
    } catch (err) { next(err); }
};

// ─── @route   POST /api/ads/:id/click ────────────────────────────────────────
exports.trackClick = async (req, res, next) => {
    try {
        const ad = await Ad.findByIdAndUpdate(
            req.params.id,
            { $inc: { 'analytics.clicks': 1 } },
            { new: true }
        );
        res.status(200).json({ success: true });
    } catch (err) { next(err); }
};

// ─── @route   POST /api/ads [Admin] ──────────────────────────────────────────
exports.createAd = async (req, res, next) => {
    try {
        const adData = { ...req.body, createdBy: req.user.id };
        if (req.file) adData.image = `/uploads/ads/${req.file.filename}`;
        const ad = await Ad.create(adData);
        res.status(201).json({ success: true, ad });
    } catch (err) { next(err); }
};

// ─── @route   PUT /api/ads/:id [Admin] ───────────────────────────────────────
exports.updateAd = async (req, res, next) => {
    try {
        const updates = { ...req.body };
        if (req.file) updates.image = `/uploads/ads/${req.file.filename}`;
        const ad = await Ad.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
        res.status(200).json({ success: true, ad });
    } catch (err) { next(err); }
};

// ─── @route   PUT /api/ads/:id/approve [Admin] ───────────────────────────────
exports.approveAd = async (req, res, next) => {
    try {
        const ad = await Ad.findByIdAndUpdate(req.params.id,
            { status: 'active', adminNotes: '', rejectionReason: '' },
            { new: true });
        if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
        res.status(200).json({ success: true, ad });
    } catch (err) { next(err); }
};

// ─── @route   PUT /api/ads/:id/reject [Admin] ────────────────────────────────
exports.rejectAd = async (req, res, next) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        const ad = await Ad.findByIdAndUpdate(req.params.id,
            { status: 'rejected', rejectionReason: reason },
            { new: true });
        if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
        res.status(200).json({ success: true, ad });
    } catch (err) { next(err); }
};

// ─── @route   DELETE /api/ads/:id [Admin] ────────────────────────────────────
exports.deleteAd = async (req, res, next) => {
    try {
        const ad = await Ad.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
        res.status(200).json({ success: true, message: 'Ad deleted' });
    } catch (err) { next(err); }
};
