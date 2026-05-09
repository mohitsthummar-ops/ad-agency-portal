const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            unique: true,
            maxlength: [50, 'Category name cannot exceed 50 characters'],
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
            type: String, // emoji or icon class
            default: '📦',
        },
        image: {
            type: String, // banner image URL
            default: null,
        },
        color: {
            type: String, // hex color for UI theming
            default: '#6366f1',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null, // null = top-level category
        },
        // Predefined categories matching user preferences
        type: {
            type: String,
            enum: ['Electronics', 'Fashion', 'Education', 'Travel', 'Food', 'Health', 'Sports', 'Entertainment', 'Others'],
            required: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        // Aggregate
        totalAds: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
