const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// ─── Multer config for avatar uploads ─────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
    filename: (req, file, cb) =>
        cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
});
exports.uploadAvatar = upload.single('avatar');

// ─── @route   GET /api/users/profile ─────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('savedAds', 'title image visitLink platform');
        res.status(200).json({ success: true, user });
    } catch (err) { next(err); }
};

// ─── @route   PUT /api/users/profile ─────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
    try {
        const allowedFields = ['name', 'phone'];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        // Handle avatar upload
        if (req.file) {
            updates.avatar = `/uploads/avatars/${req.file.filename}`;
        }
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
        res.status(200).json({ success: true, user });
    } catch (err) { next(err); }
};

// ─── @route   PUT /api/users/change-password ─────────────────────────────────
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both current and new password are required' });
        }
        const user = await User.findById(req.user.id).select('+password');
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (err) { next(err); }
};

// ─── @route   PUT /api/users/preferences ─────────────────────────────────────
exports.updatePreferences = async (req, res, next) => {
    try {
        const { gender, ageGroup, budget, interests } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { preferences: { gender, ageGroup, budget, interests } },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, preferences: user.preferences });
    } catch (err) { next(err); }
};

// ─── @route   GET /api/users/saved-ads ────────────────────────────────────────
exports.getSavedAds = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'savedAds',
            populate: [{ path: 'platform', select: 'name' }, { path: 'category', select: 'name' }],
        });
        res.status(200).json({ success: true, savedAds: user.savedAds });
    } catch (err) { next(err); }
};

// ─── @route   PUT /api/users/saved-ads/:adId ─────────────────────────────────
exports.toggleSaveAd = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const adId = req.params.adId;
        const alreadySaved = user.savedAds.includes(adId);
        if (alreadySaved) {
            user.savedAds = user.savedAds.filter((id) => id.toString() !== adId);
        } else {
            user.savedAds.push(adId);
        }
        await user.save();
        res.status(200).json({
            success: true,
            saved: !alreadySaved,
            message: alreadySaved ? 'Ad removed from saved' : 'Ad saved',
        });
    } catch (err) { next(err); }
};
