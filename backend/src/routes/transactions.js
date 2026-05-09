const express = require('express');
const router = express.Router();
const {
    createOrder, verifyPayment, razorpayWebhook, getUserTransactions,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// Webhook — raw body needed, public endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

// Protected routes
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/', protect, getUserTransactions);

module.exports = router;
