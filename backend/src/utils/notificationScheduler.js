const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// ─── Create reusable transporter ──────────────────────────────────────────────
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

// ─── Send a generic email ──────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
    try {
        if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_email')) {
            console.log(`📧 [NOTIFICATION SKIPPED - no SMTP configured] To: ${to} | Subject: ${subject}`);
            return;
        }
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"${process.env.FROM_NAME || 'AdAgency Portal'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`📧 Notification sent to ${to}: ${subject}`);
    } catch (err) {
        console.error(`❌ Failed to send notification to ${to}: ${err.message}`);
    }
}

// ─── Expiry warning email template ────────────────────────────────────────────
function expiryEmailHtml(userName, packageName, expiryDate, daysLeft) {
    return `
    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; background: #0d1117; color: #e2e8f0; border-radius: 16px; padding: 32px; border: 1px solid rgba(99,102,241,0.2);">
      <div style="text-align:center; margin-bottom: 24px;">
        <div style="display:inline-block; background: linear-gradient(135deg,#f59e0b,#ef4444); border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 28px; text-align:center;">⏰</div>
      </div>
      <h2 style="color: #f59e0b; margin: 0 0 8px; text-align:center;">Subscription Expiring Soon!</h2>
      <p style="color: #94a3b8; text-align:center; margin: 0 0 24px;">Hi <strong style="color:#e2e8f0;">${userName}</strong>, your plan is about to expire.</p>
      
      <div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px;">Current Plan</p>
        <p style="margin: 0 0 12px; color: #f59e0b; font-size: 20px; font-weight: 700;">${packageName}</p>
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">Expires: <strong style="color: #ef4444;">${expiryDate}</strong> (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)</p>
      </div>
      
      <a href="${process.env.CLIENT_URL}/dashboard/subscription" 
         style="display: block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 10px; font-weight: 600; margin-bottom: 20px;">
        Renew Your Subscription →
      </a>
      
      <p style="color: #475569; font-size: 12px; text-align: center; margin: 0;">
        Don't lose access to AI image generation and campaign management tools.
      </p>
    </div>
  `;
}

// ─── Image limit warning email template ───────────────────────────────────────
function imageLimitEmailHtml(userName, imagesUsed, imageLimit, remaining) {
    const isExhausted = remaining === 0;
    return `
    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; background: #0d1117; color: #e2e8f0; border-radius: 16px; padding: 32px; border: 1px solid rgba(99,102,241,0.2);">
      <div style="text-align:center; margin-bottom: 24px;">
        <div style="display:inline-block; background: linear-gradient(135deg,${isExhausted ? '#ef4444,#dc2626' : '#f97316,#ef4444'}); border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 28px; text-align:center;">${isExhausted ? '🚫' : '⚠️'}</div>
      </div>
      <h2 style="color: ${isExhausted ? '#ef4444' : '#f97316'}; margin: 0 0 8px; text-align:center;">
        ${isExhausted ? 'Image Limit Exhausted!' : 'Image Limit Running Low!'}
      </h2>
      <p style="color: #94a3b8; text-align:center; margin: 0 0 24px;">Hi <strong style="color:#e2e8f0;">${userName}</strong>, ${isExhausted ? 'you have used all your AI image generations.' : 'you are almost out of AI image generations.'}</p>
      
      <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #94a3b8; font-size: 13px;">Images Used</span>
          <strong style="color: #e2e8f0;">${imagesUsed} / ${imageLimit}</strong>
        </div>
        <div style="background: #1e293b; border-radius: 6px; height: 8px; overflow: hidden;">
          <div style="width: ${Math.min(100, Math.round((imagesUsed / imageLimit) * 100))}%; height: 100%; background: ${isExhausted ? '#ef4444' : '#f97316'}; border-radius: 6px;"></div>
        </div>
        ${!isExhausted ? `<p style="margin: 8px 0 0; color: #f97316; font-size: 13px; text-align: center;">${remaining} image${remaining !== 1 ? 's' : ''} remaining</p>` : ''}
      </div>
      
      <a href="${process.env.CLIENT_URL}/dashboard/subscription" 
         style="display: block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 10px; font-weight: 600; margin-bottom: 20px;">
        Upgrade Your Plan →
      </a>
      
      <p style="color: #475569; font-size: 12px; text-align: center; margin: 0;">
        Upgrade to a higher tier plan to get more AI image generations.
      </p>
    </div>
  `;
}

// ─── Main Notification Job ────────────────────────────────────────────────────
async function runNotificationJob() {
    console.log('🔔 Running subscription notification check...');
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
        // Fetch all users with active subscriptions
        const users = await User.find({
            'subscription.status': 'Active',
        }).select('name email subscription lastExpiryNotified lastLimitNotified');

        let expiryCount = 0;
        let limitCount = 0;

        for (const user of users) {
            const sub = user.subscription;
            if (!sub || !sub.expiryDate) continue;

            const expiryDate = new Date(sub.expiryDate);
            const msLeft = expiryDate - now;
            const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

            // ── Expiry Warning: 3 days or less ──────────────────────────────
            if (daysLeft <= 3 && daysLeft > 0) {
                const alreadyNotifiedToday = user.lastExpiryNotified &&
                    new Date(user.lastExpiryNotified) >= todayMidnight;

                if (!alreadyNotifiedToday) {
                    await sendEmail({
                        to: user.email,
                        subject: `⏰ Your ${sub.packageName} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!`,
                        html: expiryEmailHtml(
                            user.name,
                            sub.packageName,
                            expiryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
                            daysLeft
                        ),
                    });
                    user.lastExpiryNotified = now;
                    await user.save();
                    expiryCount++;
                }
            }

            // ── Image Limit Warning: 2 or fewer remaining ─────────────────
            const remaining = sub.imageLimit - (sub.imagesUsed || 0);
            if (remaining <= 2 && sub.imageLimit > 0) {
                const alreadyNotifiedToday = user.lastLimitNotified &&
                    new Date(user.lastLimitNotified) >= todayMidnight;

                if (!alreadyNotifiedToday) {
                    await sendEmail({
                        to: user.email,
                        subject: remaining === 0
                            ? '🚫 You have used all your AI image generations!'
                            : `⚠️ Only ${remaining} AI image generation${remaining !== 1 ? 's' : ''} left!`,
                        html: imageLimitEmailHtml(user.name, sub.imagesUsed, sub.imageLimit, remaining),
                    });
                    user.lastLimitNotified = now;
                    await user.save();
                    limitCount++;
                }
            }
        }

        console.log(`✅ Notification job done. Expiry: ${expiryCount}, Limit: ${limitCount}`);
    } catch (err) {
        console.error('❌ Notification job error:', err.message);
    }
}

// ─── Schedule: every day at 9:00 AM ──────────────────────────────────────────
function startNotificationScheduler() {
    // Run once on startup (after a 5 second delay to let DB connect)
    setTimeout(runNotificationJob, 5000);

    // Then run every day at 9:00 AM
    cron.schedule('0 9 * * *', runNotificationJob, {
        timezone: 'Asia/Kolkata',
    });

    console.log('🔔 Subscription notification scheduler started (daily @ 9:00 AM IST)');
}

module.exports = { startNotificationScheduler, runNotificationJob };
