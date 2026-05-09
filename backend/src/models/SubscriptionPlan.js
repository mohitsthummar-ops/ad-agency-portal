const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: [true, 'Plan key is required'],
            unique: true,
            trim: true,
        },
        label: {
            type: String,
            required: [true, 'Plan label is required'],
            trim: true,
        },
        duration: {
            type: Number,
            required: [true, 'Duration (days) is required'],
            min: [1, 'Duration must be at least 1 day'],
        },
        imageLimit: {
            type: Number,
            required: [true, 'Image limit is required'],
            min: [0, 'Image limit cannot be negative'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        popular: {
            type: Boolean,
            default: false,
        },
        features: {
            type: [String],
            default: [],
        },
        color: {
            type: String,
            default: '#6366f1',
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
