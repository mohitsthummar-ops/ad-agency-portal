const express = require('express');
const catRouter = express.Router();
const {
    getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, toggleCategory,
} = require('../controllers/categoryPlatformController');
const { protect, authorize } = require('../middleware/auth');

catRouter.get('/', getAllCategories);
catRouter.get('/:id', getCategoryById);
catRouter.post('/', protect, authorize('admin'), createCategory);
catRouter.put('/:id', protect, authorize('admin'), updateCategory);
catRouter.put('/:id/toggle', protect, authorize('admin'), toggleCategory);
catRouter.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = catRouter;
