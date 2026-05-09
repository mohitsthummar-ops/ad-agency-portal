const express = require('express');
const router = express.Router();
const { getPackages, getMy, buyPackage } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/packages', protect, getPackages);
router.get('/me', protect, getMy);
router.post('/buy', protect, buyPackage);

module.exports = router;
