const crypto = require('crypto');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sendToken = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferences: user.preferences,
            walletBalance: user.walletBalance,
        },
    });
};

// ─── @route   POST /api/auth/register ─────────────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { name, email, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        const user = await User.create({ name, email, password, role });
        sendToken(user, 201, res);
    } catch (err) { next(err); }
};

// ─── @route   POST /api/auth/login ────────────────────────────────────────────
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
        }

        await user.save();
        // -------------------------------------------------------

        sendToken(user, 200, res);
    } catch (err) { next(err); }
};

// ─── @route   GET /api/auth/me ────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('savedAds', 'title image');
        res.status(200).json({ success: true, user });
    } catch (err) { next(err); }
};

// ─── @route   POST /api/auth/logout ───────────────────────────────────────────
exports.logout = (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─── @route   POST /api/auth/forgot-password ─────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with that email' });
        }
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        try {
            await transporter.sendMail({
                from: `"AdAgency" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Reset Your Password — AdAgency Portal',
                html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0d1117; color: #e2e8f0; border-radius: 12px;">
            <h2 style="color: #818cf8;">Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>Click the button below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
            <a href="${resetUrl}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #6366f1; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
            <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
            });
            res.status(200).json({ success: true, message: `Reset link sent to ${user.email}` });
        } catch (emailErr) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Failed to send email. Try again later.' });
        }
    } catch (err) { next(err); }
};

// ─── @route   PUT /api/auth/reset-password/:token ────────────────────────────
exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        sendToken(user, 200, res);
    } catch (err) { next(err); }
};
