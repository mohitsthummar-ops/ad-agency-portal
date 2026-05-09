const express = require('express');
const router = express.Router();
const {
    getProfile, updateProfile, changePassword, updatePreferences,
    getSavedAds, toggleSaveAd, uploadAvatar,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // All user routes require auth

router.get('/profile', getProfile);
router.put('/profile', uploadAvatar, updateProfile);
router.put('/change-password', changePassword);
router.put('/preferences', updatePreferences);
router.get('/saved-ads', getSavedAds);
router.put('/saved-ads/:adId', toggleSaveAd);

module.exports = router;
