const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Campaign name is required'],
            trim: true,
            maxlength: [100, 'Campaign name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Client is required'],
        },
        ads: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ad',
            },
        ],

        // Campaign status
        status: {
            type: String,
            enum: ['draft', 'pending', 'active', 'paused', 'completed', 'cancelled'],
            default: 'draft',
        },

        // Budget management
        totalBudget: {
            type: Number,
            required: [true, 'Total budget is required'],
            min: [0, 'Budget cannot be negative'],
        },
        spentBudget: {
            type: Number,
            default: 0,
        },
        remainingBudget: {
            type: Number,
            default: 0,
        },

        // Scheduling
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },

        // Targeting (mirrors Ad targeting for campaign-level)
        targetAudience: {
            genders: [String],
            ageGroups: [String],
            budgetLevel: String,
            interests: [String],
        },

        // Platforms where campaign runs
        platforms: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Platform',
            },
        ],

        // Aggregate analytics
        analytics: {
            totalViews: { type: Number, default: 0 },
            totalClicks: { type: Number, default: 0 },
            totalSaves: { type: Number, default: 0 },
            avgCtr: { type: Number, default: 0 },
            conversions: { type: Number, default: 0 },
        },

        // Proof of work (e.g., screenshots submitted by admin/team)
        proofs: [
            {
                fileUrl: String,
                description: String,
                submittedAt: { type: Date, default: Date.now },
            },
        ],

        // Notes from admin
        adminNotes: {
            type: String,
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
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

// Calculate remaining budget before each save
campaignSchema.pre('save', function (next) {
    this.remainingBudget = this.totalBudget - this.spentBudget;
    next();
});

campaignSchema.index({ client: 1, status: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
