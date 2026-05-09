const express = require('express');
const platRouter = express.Router();
const {
    getAllPlatforms, getPlatformById, createPlatform, updatePlatform, deletePlatform, togglePlatform,
} = require('../controllers/categoryPlatformController');
const { protect, authorize } = require('../middleware/auth');

platRouter.get('/', getAllPlatforms);
platRouter.get('/:id', getPlatformById);
platRouter.post('/', protect, authorize('admin'), createPlatform);
platRouter.put('/:id', protect, authorize('admin'), updatePlatform);
platRouter.put('/:id/toggle', protect, authorize('admin'), togglePlatform);
platRouter.delete('/:id', protect, authorize('admin'), deletePlatform);

module.exports = platRouter;
