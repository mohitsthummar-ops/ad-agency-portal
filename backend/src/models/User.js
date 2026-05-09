7980
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        phone: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ['user', 'client', 'admin'],
            default: 'user',
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        // User Preferences for personalized ads
        preferences: {
            gender: {
                type: String,
                enum: ['male', 'female', 'other', 'prefer_not_to_say'],
                default: 'prefer_not_to_say',
            },
            ageGroup: {
                type: String,
                enum: ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'],
                default: '18-24',
            },
            budget: {
                type: String,
                enum: ['low', 'medium', 'high', 'premium'],
                default: 'medium',
            },
            interests: [
                {
                    type: String,
                    enum: ['Electronics', 'Fashion', 'Education', 'Travel', 'Food', 'Health', 'Sports', 'Entertainment', 'Others'],
                },
            ],
            preferredPlatforms: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Platform',
                },
            ],
        },

        // Saved/Bookmarked Ads
        savedAds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ad',
            },
        ],

        // Password reset
        resetPasswordToken: String,
        resetPasswordExpire: Date,

        // Subscription Package
        subscription: {
            packageName: { type: String, default: null },
            startDate: { type: Date, default: null },
            expiryDate: { type: Date, default: null },
            imageLimit: { type: Number, default: 0 },
            imagesUsed: { type: Number, default: 0 },
            status: { type: String, enum: ['Active', 'Expired', 'None'], default: 'None' },
        },

        // Account balance / wallet
        walletBalance: {
            type: Number,
            default: 0,
        },

        // Generated Images Storage
        generatedImages: [
            {
                url: String,
                prompt: String,
                createdAt: { type: Date, default: Date.now }
            }
        ],
        lastLogin: {
            type: Date,
            default: Date.now,
        },

        // Notification tracking (to avoid duplicate emails)
        lastExpiryNotified: {
            type: Date,
            default: null,
        },
        lastLimitNotified: {
            type: Date,
            default: null,
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

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Sign and return JWT token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
