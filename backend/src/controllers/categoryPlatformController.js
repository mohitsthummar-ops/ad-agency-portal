const Category = require('../models/Category');
const Platform = require('../models/Platform');

// ══════════════════════════════════════════════════════════════════════════════
//  CATEGORY CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

exports.getAllCategories = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
        const categories = await Category.find(filter).sort('sortOrder name').lean();
        res.status(200).json({ success: true, categories });
    } catch (err) { next(err); }
};

exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.status(200).json({ success: true, category });
    } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, category });
    } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.status(200).json({ success: true, category });
    } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (err) { next(err); }
};

exports.toggleCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        category.isActive = !category.isActive;
        await category.save();
        res.status(200).json({ success: true, category });
    } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════════════════════════
//  PLATFORM CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

exports.getAllPlatforms = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
        const platforms = await Platform.find(filter).sort('sortOrder name').lean();
        res.status(200).json({ success: true, platforms });
    } catch (err) { next(err); }
};

exports.getPlatformById = async (req, res, next) => {
    try {
        const platform = await Platform.findById(req.params.id);
        if (!platform) return res.status(404).json({ success: false, message: 'Platform not found' });
        res.status(200).json({ success: true, platform });
    } catch (err) { next(err); }
};

exports.createPlatform = async (req, res, next) => {
    try {
        const platform = await Platform.create(req.body);
        res.status(201).json({ success: true, platform });
    } catch (err) { next(err); }
};

exports.updatePlatform = async (req, res, next) => {
    try {
        const platform = await Platform.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!platform) return res.status(404).json({ success: false, message: 'Platform not found' });
        res.status(200).json({ success: true, platform });
    } catch (err) { next(err); }
};

exports.deletePlatform = async (req, res, next) => {
    try {
        const platform = await Platform.findByIdAndDelete(req.params.id);
        if (!platform) return res.status(404).json({ success: false, message: 'Platform not found' });
        res.status(200).json({ success: true, message: 'Platform deleted' });
    } catch (err) { next(err); }
};

exports.togglePlatform = async (req, res, next) => {
    try {
        const platform = await Platform.findById(req.params.id);
        if (!platform) return res.status(404).json({ success: false, message: 'Platform not found' });
        platform.isActive = !platform.isActive;
        await platform.save();
        res.status(200).json({ success: true, platform });
    } catch (err) { next(err); }
};
