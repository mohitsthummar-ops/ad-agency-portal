/**
 * Database Seed Script
 * Populates all MongoDB collections with sample data:
 *   - Categories, Platforms, Ads, Campaigns, Transactions
 * Run: node src/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const Category = require('./models/Category');
const Platform = require('./models/Platform');
const Ad = require('./models/Ad');
const Campaign = require('./models/Campaign');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

async function seed() {
    await connectDB();
    console.log('🌱 Starting database seed...\n');

    // ═══════════════════════════════════════════════════════════
    //  1. CATEGORIES
    // ═══════════════════════════════════════════════════════════
    const existingCats = await Category.countDocuments();
    let categories = [];
    if (existingCats === 0) {
        const catData = [
            { name: 'Electronics', type: 'Electronics', icon: '💻', color: '#3b82f6', description: 'Gadgets, devices, and tech products', isFeatured: true, sortOrder: 1 },
            { name: 'Fashion', type: 'Fashion', icon: '👗', color: '#ec4899', description: 'Clothing, shoes, and accessories', isFeatured: true, sortOrder: 2 },
            { name: 'Education', type: 'Education', icon: '📚', color: '#8b5cf6', description: 'Courses, books, and learning tools', isFeatured: false, sortOrder: 3 },
            { name: 'Travel', type: 'Travel', icon: '✈️', color: '#06b6d4', description: 'Flights, hotels, and travel packages', isFeatured: true, sortOrder: 4 },
            { name: 'Food & Dining', type: 'Food', icon: '🍕', color: '#f97316', description: 'Restaurants, delivery, and groceries', isFeatured: false, sortOrder: 5 },
            { name: 'Health & Wellness', type: 'Health', icon: '💪', color: '#10b981', description: 'Fitness, supplements, and healthcare', isFeatured: false, sortOrder: 6 },
            { name: 'Sports', type: 'Sports', icon: '⚽', color: '#eab308', description: 'Sports gear, events, and memberships', isFeatured: false, sortOrder: 7 },
            { name: 'Entertainment', type: 'Entertainment', icon: '🎬', color: '#ef4444', description: 'Movies, shows, music, and games', isFeatured: true, sortOrder: 8 },
            { name: 'Others', type: 'Others', icon: '📦', color: '#6366f1', description: 'Miscellaneous advertisements', isFeatured: false, sortOrder: 9 },
        ];
        for (let data of catData) {
            categories.push(await Category.create(data));
        }
        console.log(`✅ ${categories.length} Categories created`);
    } else {
        categories = await Category.find();
        console.log(`⏩ Categories already exist (${existingCats}), skipping`);
    }

    // ═══════════════════════════════════════════════════════════
    //  2. PLATFORMS
    // ═══════════════════════════════════════════════════════════
    const existingPlats = await Platform.countDocuments();
    let platforms = [];
    if (existingPlats === 0) {
        const platData = [
            { name: 'Instagram', icon: '📸', website: 'https://www.instagram.com', supportedFormats: ['banner', 'story', 'carousel'], baseCostPerClick: 2.5, baseCostPerThousandViews: 5.0, sortOrder: 1 },
            { name: 'Facebook', icon: '📘', website: 'https://www.facebook.com', supportedFormats: ['banner', 'video', 'carousel', 'native'], baseCostPerClick: 1.8, baseCostPerThousandViews: 4.0, sortOrder: 2 },
            { name: 'YouTube', icon: '▶️', website: 'https://www.youtube.com', supportedFormats: ['video', 'banner', 'sponsored'], baseCostPerClick: 3.0, baseCostPerThousandViews: 7.0, sortOrder: 3 },
            { name: 'Twitter/X', icon: '🐦', website: 'https://www.x.com', supportedFormats: ['banner', 'native', 'sponsored'], baseCostPerClick: 2.0, baseCostPerThousandViews: 4.5, sortOrder: 4 },
            { name: 'Google Ads', icon: '🔍', website: 'https://ads.google.com', supportedFormats: ['banner', 'native', 'video'], baseCostPerClick: 4.0, baseCostPerThousandViews: 8.0, sortOrder: 5 },
            { name: 'LinkedIn', icon: '💼', website: 'https://www.linkedin.com', supportedFormats: ['banner', 'sponsored', 'native'], baseCostPerClick: 5.0, baseCostPerThousandViews: 10.0, sortOrder: 6 },
        ];
        for (let data of platData) {
            platforms.push(await Platform.create(data));
        }
        console.log(`✅ ${platforms.length} Platforms created`);
    } else {
        platforms = await Platform.find();
        console.log(`⏩ Platforms already exist (${existingPlats}), skipping`);
    }

    // ═══════════════════════════════════════════════════════════
    //  3. ADMIN USER (if none exists)
    // ═══════════════════════════════════════════════════════════
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@smartads.com',
            password: 'admin123',
            role: 'admin',
            isEmailVerified: true,
        });
        console.log('✅ Admin user created (admin@smartads.com / admin123)');
    } else {
        console.log(`⏩ Admin user already exists (${adminUser.email})`);
    }

    // Get a client user for sample data, or use admin
    let clientUser = await User.findOne({ role: { $in: ['client', 'user'] } });
    if (!clientUser) clientUser = adminUser;

    // ═══════════════════════════════════════════════════════════
    //  4. SAMPLE ADS
    // ═══════════════════════════════════════════════════════════
    const existingAds = await Ad.countDocuments();
    let ads = [];
    if (existingAds === 0 && categories.length > 0 && platforms.length > 0) {
        const adData = [
            {
                title: 'MacBook Pro 2025 — Power Unleashed',
                description: 'Experience the ultimate performance with the all-new MacBook Pro. M4 chip, 20-hour battery, and stunning Liquid Retina display.',
                image: '/uploads/ads/sample-macbook.jpg',
                visitLink: 'https://www.apple.com/macbook-pro',
                category: categories.find(c => c.type === 'Electronics')?._id || categories[0]._id,
                platform: platforms[0]._id,
                status: 'active',
                isFeatured: true,
                isDefault: true,
                createdBy: adminUser._id,
                targetAudience: { genders: ['all'], ageGroups: ['18-24', '25-34'], budgetLevel: 'premium', interests: ['Electronics'] },
                analytics: { views: 15200, clicks: 890, saves: 320 },
                tags: ['macbook', 'laptop', 'apple', 'tech'],
                adBudget: 50000,
                costPerClick: 5.0,
            },
            {
                title: 'Summer Fashion Collection 2025',
                description: 'Discover the latest trends in summer fashion. Light fabrics, bold colors, and effortless elegance for every occasion.',
                image: '/uploads/ads/sample-fashion.jpg',
                visitLink: 'https://www.zara.com',
                category: categories.find(c => c.type === 'Fashion')?._id || categories[0]._id,
                platform: platforms[1]._id,
                status: 'active',
                isFeatured: true,
                isDefault: true,
                createdBy: adminUser._id,
                targetAudience: { genders: ['female', 'all'], ageGroups: ['18-24', '25-34'], budgetLevel: 'medium', interests: ['Fashion'] },
                analytics: { views: 28500, clicks: 2100, saves: 780 },
                tags: ['fashion', 'summer', 'clothing'],
                adBudget: 30000,
                costPerClick: 2.5,
            },
            {
                title: 'Learn Web Development — Full Stack Bootcamp',
                description: 'Master React, Node.js, MongoDB, and more in 12 weeks. Get certified and job-ready with hands-on projects.',
                image: '/uploads/ads/sample-education.jpg',
                visitLink: 'https://www.udemy.com',
                category: categories.find(c => c.type === 'Education')?._id || categories[0]._id,
                platform: platforms[2]._id,
                status: 'active',
                isFeatured: false,
                createdBy: adminUser._id,
                targetAudience: { genders: ['all'], ageGroups: ['18-24', '25-34', '35-44'], budgetLevel: 'low', interests: ['Education'] },
                analytics: { views: 9800, clicks: 720, saves: 450 },
                tags: ['coding', 'bootcamp', 'react', 'nodejs'],
                adBudget: 15000,
                costPerClick: 1.5,
            },
            {
                title: 'Bali Getaway — 5 Nights All Inclusive',
                description: 'Escape to paradise. 5 nights at a luxury resort in Bali with flights, spa, and all meals included. Starting at ₹49,999.',
                image: '/uploads/ads/sample-travel.jpg',
                visitLink: 'https://www.makemytrip.com',
                category: categories.find(c => c.type === 'Travel')?._id || categories[0]._id,
                platform: platforms[0]._id,
                status: 'active',
                isFeatured: true,
                isDefault: true,
                createdBy: adminUser._id,
                targetAudience: { genders: ['all'], ageGroups: ['25-34', '35-44'], budgetLevel: 'high', interests: ['Travel'] },
                analytics: { views: 18700, clicks: 1560, saves: 920 },
                tags: ['travel', 'bali', 'vacation', 'luxury'],
                adBudget: 80000,
                costPerClick: 8.0,
            },
            {
                title: 'Protein Plus — Premium Whey Protein',
                description: 'Build lean muscle with 30g pure whey protein per serving. Zero sugar, amazing taste. Available in 5 flavors.',
                image: '/uploads/ads/sample-health.jpg',
                visitLink: 'https://www.myfitness.co',
                category: categories.find(c => c.type === 'Health')?._id || categories[0]._id,
                platform: platforms[1]._id,
                status: 'active',
                isFeatured: false,
                createdBy: adminUser._id,
                targetAudience: { genders: ['male', 'all'], ageGroups: ['18-24', '25-34'], budgetLevel: 'medium', interests: ['Health', 'Sports'] },
                analytics: { views: 6200, clicks: 480, saves: 210 },
                tags: ['protein', 'fitness', 'health', 'gym'],
                adBudget: 20000,
                costPerClick: 3.0,
            },
            {
                title: 'Netflix Premium — Free 1 Month Trial',
                description: 'Unlimited movies, shows, and originals in 4K Ultra HD. Sign up now and get your first month completely free!',
                image: '/uploads/ads/sample-entertainment.jpg',
                visitLink: 'https://www.netflix.com',
                category: categories.find(c => c.type === 'Entertainment')?._id || categories[0]._id,
                platform: platforms[2]._id,
                status: 'active',
                isFeatured: true,
                isDefault: true,
                createdBy: adminUser._id,
                targetAudience: { genders: ['all'], ageGroups: ['13-17', '18-24', '25-34', '35-44'], budgetLevel: 'all', interests: ['Entertainment'] },
                analytics: { views: 45000, clicks: 5200, saves: 1800 },
                tags: ['netflix', 'streaming', 'movies', 'entertainment'],
                adBudget: 100000,
                costPerClick: 1.0,
            },
            {
                title: 'Dominos — Buy 1 Get 1 Free Pizza!',
                description: 'Order any large pizza and get a second one absolutely free. Limited time offer. Valid on dine-in and delivery.',
                image: '/uploads/ads/sample-food.jpg',
                visitLink: 'https://www.dominos.co.in',
                category: categories.find(c => c.type === 'Food')?._id || categories[0]._id,
                platform: platforms[3]._id,
                status: 'active',
                isFeatured: false,
                isDefault: true,
                createdBy: adminUser._id,
                targetAudience: { genders: ['all'], ageGroups: ['all'], budgetLevel: 'low', interests: ['Food'] },
                analytics: { views: 32000, clicks: 4100, saves: 1500 },
                tags: ['pizza', 'food', 'dominos', 'bogo'],
                adBudget: 25000,
                costPerClick: 0.8,
            },
            {
                title: 'Nike Air Max 2025 — Step Into the Future',
                description: 'The latest Nike Air Max with revolutionary Air cushioning. Lightweight, breathable, and made for all-day comfort.',
                image: '/uploads/ads/sample-sports.jpg',
                visitLink: 'https://www.nike.com',
                category: categories.find(c => c.type === 'Sports')?._id || categories[0]._id,
                platform: platforms[0]._id,
                status: 'active',
                isFeatured: true,
                createdBy: adminUser._id,
                targetAudience: { genders: ['all'], ageGroups: ['18-24', '25-34'], budgetLevel: 'high', interests: ['Sports', 'Fashion'] },
                analytics: { views: 22000, clicks: 1780, saves: 650 },
                tags: ['nike', 'shoes', 'sports', 'airmax'],
                adBudget: 60000,
                costPerClick: 4.0,
            },
        ];
        ads = await Ad.insertMany(adData);
        console.log(`✅ ${ads.length} Ads created`);

        // Update category ad counts
        for (const cat of categories) {
            const count = ads.filter(a => a.category.toString() === cat._id.toString()).length;
            await Category.updateOne({ _id: cat._id }, { $set: { totalAds: count } });
        }
        // Update platform stats
        for (const plat of platforms) {
            const platAds = ads.filter(a => a.platform.toString() === plat._id.toString());
            const totalViews = platAds.reduce((s, a) => s + a.analytics.views, 0);
            const totalClicks = platAds.reduce((s, a) => s + a.analytics.clicks, 0);
            await Platform.updateOne({ _id: plat._id }, { $set: { 'stats.totalAds': platAds.length, 'stats.totalViews': totalViews, 'stats.totalClicks': totalClicks } });
        }
        console.log('✅ Category & Platform stats updated');
    } else {
        ads = await Ad.find();
        console.log(`⏩ Ads already exist (${existingAds}), skipping`);
    }

    // ═══════════════════════════════════════════════════════════
    //  5. SAMPLE CAMPAIGNS
    // ═══════════════════════════════════════════════════════════
    const existingCampaigns = await Campaign.countDocuments();
    if (existingCampaigns === 0 && ads.length > 0) {
        const now = new Date();
        const campData = [
            {
                name: 'Q1 2025 — Tech Launch Campaign',
                description: 'Major product launch for electronics and gadgets category across all social platforms.',
                client: clientUser._id,
                ads: ads.filter(a => a.tags?.includes('tech') || a.tags?.includes('macbook')).map(a => a._id),
                status: 'active',
                totalBudget: 75000,
                spentBudget: 32000,
                startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
                targetAudience: { genders: ['all'], ageGroups: ['18-24', '25-34'], budgetLevel: 'premium', interests: ['Electronics'] },
                platforms: [platforms[0]._id, platforms[2]._id],
                analytics: { totalViews: 15200, totalClicks: 890, totalSaves: 320, avgCtr: 5.86, conversions: 42 },
                createdBy: adminUser._id,
            },
            {
                name: 'Summer Fashion — Instagram Blitz',
                description: 'High-engagement Instagram campaign for the summer collection with carousel and story ads.',
                client: clientUser._id,
                ads: ads.filter(a => a.tags?.includes('fashion')).map(a => a._id),
                status: 'active',
                totalBudget: 45000,
                spentBudget: 18000,
                startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                endDate: new Date(now.getFullYear(), now.getMonth() + 3, 0),
                targetAudience: { genders: ['female', 'all'], ageGroups: ['18-24', '25-34'], budgetLevel: 'medium', interests: ['Fashion'] },
                platforms: [platforms[0]._id],
                analytics: { totalViews: 28500, totalClicks: 2100, totalSaves: 780, avgCtr: 7.37, conversions: 95 },
                createdBy: adminUser._id,
            },
            {
                name: 'Entertainment Bundle — Multi-Platform',
                description: 'Cross-platform campaign promoting streaming and entertainment services.',
                client: clientUser._id,
                ads: ads.filter(a => a.tags?.includes('entertainment') || a.tags?.includes('netflix')).map(a => a._id),
                status: 'completed',
                totalBudget: 120000,
                spentBudget: 118500,
                startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
                endDate: new Date(now.getFullYear(), now.getMonth() - 1, 0),
                targetAudience: { genders: ['all'], ageGroups: ['all'], budgetLevel: 'all', interests: ['Entertainment'] },
                platforms: [platforms[0]._id, platforms[1]._id, platforms[2]._id],
                analytics: { totalViews: 45000, totalClicks: 5200, totalSaves: 1800, avgCtr: 11.56, conversions: 210 },
                createdBy: adminUser._id,
            },
        ];
        const campaigns = await Campaign.insertMany(campData);
        console.log(`✅ ${campaigns.length} Campaigns created`);
    } else {
        console.log(`⏩ Campaigns already exist (${existingCampaigns}), skipping`);
    }

    // ═══════════════════════════════════════════════════════════
    //  6. SAMPLE TRANSACTIONS
    // ═══════════════════════════════════════════════════════════
    const existingTx = await Transaction.countDocuments();
    if (existingTx === 0) {
        const txData = [
            {
                user: clientUser._id,
                razorpayOrderId: `order_seed_${Date.now()}_1`,
                razorpayPaymentId: `pay_seed_${Date.now()}_1`,
                amount: 299,
                currency: 'INR',
                receipt: 'RCPT-001',
                purpose: 'subscription',
                status: 'paid',
                description: '1 Month Subscription Package',
                paidAt: new Date(),
            },
            {
                user: clientUser._id,
                razorpayOrderId: `order_seed_${Date.now()}_2`,
                razorpayPaymentId: `pay_seed_${Date.now()}_2`,
                amount: 1499,
                currency: 'INR',
                receipt: 'RCPT-002',
                purpose: 'subscription',
                status: 'paid',
                description: '6 Months Subscription Package',
                paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
            {
                user: adminUser._id,
                razorpayOrderId: `order_seed_${Date.now()}_3`,
                amount: 2499,
                currency: 'INR',
                receipt: 'RCPT-003',
                purpose: 'subscription',
                status: 'created',
                description: '1 Year Subscription - Pending payment',
            },
        ];
        const tx = await Transaction.insertMany(txData);
        console.log(`✅ ${tx.length} Transactions created`);
    } else {
        console.log(`⏩ Transactions already exist (${existingTx}), skipping`);
    }

    // ═══════════════════════════════════════════════════════════
    //  DONE
    // ═══════════════════════════════════════════════════════════
    console.log('\n════════════════════════════════════════════');
    console.log('  🎉 Database seeding completed!');
    console.log('════════════════════════════════════════════');
    console.log('  Collections populated:');
    console.log(`    Categories  → ${await Category.countDocuments()}`);
    console.log(`    Platforms   → ${await Platform.countDocuments()}`);
    console.log(`    Ads         → ${await Ad.countDocuments()}`);
    console.log(`    Campaigns   → ${await Campaign.countDocuments()}`);
    console.log(`    Transactions→ ${await Transaction.countDocuments()}`);
    console.log(`    Users       → ${await User.countDocuments()}`);
    console.log(`    Ad Requests → ${await require('./models/AdRequest').countDocuments()}`);
    console.log('════════════════════════════════════════════\n');

    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
});
