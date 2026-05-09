const express = require('express');
const router = express.Router();
const {
    getAllAds, getPersonalizedAds, getDefaultAds, getAdById,
    trackView, trackClick, createAd, updateAd, approveAd, rejectAd, deleteAd,
    uploadAdImage,
} = require('../controllers/adController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getAllAds);
router.get('/default', getDefaultAds);
router.get('/:id', getAdById);

// Protected
router.get('/personalized', protect, getPersonalizedAds);
router.post('/:id/view', protect, trackView);
router.post('/:id/click', protect, trackClick);

// Admin only
router.post('/', protect, authorize('admin'), uploadAdImage, createAd);
router.put('/:id', protect, authorize('admin'), uploadAdImage, updateAd);
router.put('/:id/approve', protect, authorize('admin'), approveAd);
router.put('/:id/reject', protect, authorize('admin'), rejectAd);
router.delete('/:id', protect, authorize('admin'), deleteAd);

module.exports = router;
