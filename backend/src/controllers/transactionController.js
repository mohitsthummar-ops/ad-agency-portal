const crypto = require('crypto');
const Razorpay = require('razorpay');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AdRequest = require('../models/AdRequest');
const PACKAGES = require('../config/subscriptionPackages');

// Initialize Razorpay instance lazily (only if keys are configured)
const getRazorpayInstance = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        const error = new Error('Razorpay is not configured. Please add valid keys to your .env file.');
        error.statusCode = 400; // Return 400 instead of 500
        throw error;
    }
    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

// ─── @route   POST /api/transactions/create-order ────────────────────────────
exports.createOrder = async (req, res, next) => {
    try {
        const { amount, purpose, description, metadata } = req.body;
        if (!amount || amount < 1) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }
        const razorpay = getRazorpayInstance();
        let order;
        try {
            order = await razorpay.orders.create({
                amount: Math.round(amount * 100), // paise
                currency: 'INR',
                receipt: `rcpt_${Date.now()}`,
                notes: { purpose, userId: req.user.id, description, ...metadata },
            });
        } catch (razorError) {
            console.error('Razorpay Error:', razorError);
            const status = razorError.statusCode === 401 ? 400 : (razorError.statusCode || 400);
            return res.status(status).json({
                success: false,
                message: razorError.statusCode === 401 
                    ? 'Payment gateway error: Invalid API credentials. Please check your .env file.' 
                    : (razorError.error?.description || 'Failed to create payment order')
            });
        }

        // Save pending transaction
        await Transaction.create({
            user: req.user.id,
            razorpayOrderId: order.id,
            amount,
            currency: 'INR',
            purpose: purpose || 'wallet_topup',
            status: 'created',
            metadata: { description, ...metadata },
        });

        res.status(201).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) { next(err); }
};

// ─── @route   POST /api/transactions/verify ───────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
        }

        // Update transaction
        const transaction = await Transaction.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'paid',
            },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Credit wallet if it's a top-up
        if (transaction.purpose === 'wallet_topup') {
            await User.findByIdAndUpdate(transaction.user, {
                $inc: { walletBalance: transaction.amount },
            });
        }

        // Handle ad request payment
        if (transaction.purpose === 'ad_request') {
            const requestId = transaction.metadata?.description;
            if (requestId) {
                await AdRequest.findByIdAndUpdate(requestId, {
                    paymentStatus: 'completed',
                    transaction: transaction._id
                });
            }
        }

        // Handle subscription payment
        if (transaction.purpose === 'subscription') {
            const packageId = transaction.metadata?.packageId;
            const SubscriptionPlan = require('../models/SubscriptionPlan');
            const pkg = await SubscriptionPlan.findById(packageId);

            if (pkg) {
                const startDate = new Date();
                const expiryDate = new Date(startDate);
                expiryDate.setDate(expiryDate.getDate() + pkg.duration);

                await User.findByIdAndUpdate(transaction.user, {
                    subscription: {
                        packageName: pkg.label,
                        startDate,
                        expiryDate,
                        imageLimit: pkg.imageLimit,
                        imagesUsed: 0,
                        status: 'Active',
                    }
                });
            }
        }

        res.status(200).json({ success: true, transaction });
    } catch (err) { next(err); }
};

// ─── @route   POST /api/transactions/webhook ─────────────────────────────────
exports.razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (webhookSecret) {
            const signature = req.headers['x-razorpay-signature'];
            const body = JSON.stringify(req.body);
            const expectedSig = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
            if (signature !== expectedSig) {
                return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
            }
        }

        const { event, payload } = req.body;
        if (event === 'payment.captured') {
            const orderId = payload?.payment?.entity?.order_id;
            const paymentId = payload?.payment?.entity?.id;
            if (orderId) {
                const transaction = await Transaction.findOneAndUpdate(
                    { razorpayOrderId: orderId },
                    { razorpayPaymentId: paymentId, status: 'paid', webhookData: payload },
                    { new: true }
                );

                if (transaction && transaction.purpose === 'ad_request') {
                    const requestId = transaction.metadata?.description;
                    if (requestId) {
                        await AdRequest.findByIdAndUpdate(requestId, {
                            paymentStatus: 'completed',
                            transaction: transaction._id
                        });
                    }
                }
            }
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(200).json({ success: true }); // Always return 200 to Razorpay
    }
};

// ─── @route   GET /api/transactions [User's own] ─────────────────────────────
exports.getUserTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id })
            .sort('-createdAt')
            .lean();
        res.status(200).json({ success: true, transactions });
    } catch (err) { next(err); }
};
