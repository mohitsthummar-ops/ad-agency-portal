const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Ad title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Ad description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        image: {
            type: String, // URL/path to image
            required: [true, 'Ad image is required'],
        },
        visitLink: {
            type: String,
            required: [true, 'Visit link is required'],
            match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
        },

        // Classification
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        platform: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Platform',
            required: [true, 'Platform is required'],
        },

        // Targeting (for personalized delivery)
        targetAudience: {
            genders: [
                {
                    type: String,
                    enum: ['male', 'female', 'other', 'all'],
                },
            ],
            ageGroups: [
                {
                    type: String,
                    enum: ['13-17', '18-24', '25-34', '35-44', '45-54', '55+', 'all'],
                },
            ],
            budgetLevel: {
                type: String,
                enum: ['low', 'medium', 'high', 'premium', 'all'],
                default: 'all',
            },
            interests: [
                {
                    type: String,
                    enum: ['Electronics', 'Fashion', 'Education', 'Travel', 'Food', 'Health', 'Sports', 'Entertainment', 'Others', 'All'],
                },
            ],
        },

        // Status & approval
        status: {
            type: String,
            enum: ['pending', 'active', 'paused', 'rejected', 'expired'],
            default: 'pending',
        },
        rejectionReason: {
            type: String,
            default: null,
        },
        isDefault: {
            type: Boolean,
            default: false, // Default ads shown to all users regardless of preferences
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },

        // Performance Metrics
        analytics: {
            views: { type: Number, default: 0 },
            clicks: { type: Number, default: 0 },
            saves: { type: Number, default: 0 },
            ctr: { type: Number, default: 0 }, // Click-through rate (clicks/views * 100)
        },

        // Campaign association
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            default: null,
        },

        // Created by (admin or client)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Scheduling
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: null,
        },

        // Budget
        adBudget: {
            type: Number,
            default: 0,
        },
        costPerClick: {
            type: Number,
            default: 0,
        },
        tags: [String],
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-calculate CTR before saving
adSchema.pre('save', function (next) {
    if (this.analytics.views > 0) {
        this.analytics.ctr = parseFloat(((this.analytics.clicks / this.analytics.views) * 100).toFixed(2));
    }
    next();
});

// Index for efficient querying
adSchema.index({ status: 1, category: 1, platform: 1 });
adSchema.index({ 'targetAudience.interests': 1 });
adSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ad', adSchema);
