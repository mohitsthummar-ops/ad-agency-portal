const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Platform name is required'],
            trim: true,
            unique: true,
            maxlength: [50, 'Platform name cannot exceed 50 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        icon: {
            type: String, // URL or icon class name
            default: null,
        },
        logo: {
            type: String, // URL to platform logo
            default: null,
        },
        website: {
            type: String,
            match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Supported ad formats on this platform
        supportedFormats: [
            {
                type: String,
                enum: ['banner', 'video', 'carousel', 'story', 'sponsored', 'native'],
            },
        ],
        // Pricing
        baseCostPerClick: {
            type: Number,
            default: 0,
        },
        baseCostPerThousandViews: {
            type: Number,
            default: 0,
        },
        // Aggregate stats (updated periodically)
        stats: {
            totalAds: { type: Number, default: 0 },
            totalClicks: { type: Number, default: 0 },
            totalViews: { type: Number, default: 0 },
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug from name
platformSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    next();
});

module.exports = mongoose.model('Platform', platformSchema);
