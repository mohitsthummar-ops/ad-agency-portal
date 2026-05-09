const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            default: null,
        },

        // Razorpay fields
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
        },
        razorpayPaymentId: {
            type: String,
            default: null,
        },
        razorpaySignature: {
            type: String,
            default: null,
        },

        // Transaction details
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [1, 'Amount must be at least 1'],
        },
        currency: {
            type: String,
            default: 'INR',
        },
        receipt: {
            type: String, // receipt/invoice number
        },

        // Payment purpose
        purpose: {
            type: String,
            enum: ['campaign_funding', 'account_upgrade', 'ad_boost', 'wallet_topup', 'subscription'],
            required: true,
        },

        // Status
        status: {
            type: String,
            enum: ['created', 'pending', 'paid', 'failed', 'refunded'],
            default: 'created',
        },

        // Webhook data
        webhookData: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        // Notes
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },

        // Failure reason if payment failed
        failureReason: {
            type: String,
            default: null,
        },

        // Metadata (extra info from Razorpay)
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast queries
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ razorpayPaymentId: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
