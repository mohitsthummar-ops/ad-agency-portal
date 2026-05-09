require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ad_agency';

const CategorySchema = new mongoose.Schema({ name: String, slug: String, type: String, color: String, description: String, isActive: Boolean }, { timestamps: true });
const PlatformSchema = new mongoose.Schema({ name: String, slug: String, description: String, website: String, isActive: Boolean }, { timestamps: true });
const AdSchema = new mongoose.Schema({
    title: String, description: String, image: String, visitLink: String,
    category: mongoose.Schema.Types.ObjectId, platform: mongoose.Schema.Types.ObjectId,
    createdBy: mongoose.Schema.Types.ObjectId,
    status: { type: String, default: 'active' },
    budget: Number,
    targetAudience: { gender: String, ageGroup: String, budget: String },
    analytics: { views: Number, clicks: Number },
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Platform = mongoose.model('Platform', PlatformSchema);
const Ad = mongoose.model('Ad', AdSchema);
const User = mongoose.model('User', new mongoose.Schema({ role: String, email: String }));

(async () => {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Connected');

        // Get admin user
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) throw new Error('No admin user found. Run the admin creation script first.');

        // Categories
        await Category.deleteMany({});
        const cats = await Category.insertMany([
            { name: 'Electronics', slug: 'electronics', type: 'Electronics', color: '#6366f1', description: 'Gadgets, phones & laptops', isActive: true },
            { name: 'Fashion', slug: 'fashion', type: 'Fashion', color: '#ec4899', description: 'Clothing, shoes & accessories', isActive: true },
            { name: 'Education', slug: 'education', type: 'Education', color: '#22d3ee', description: 'Courses, books & learning', isActive: true },
            { name: 'Food & Dining', slug: 'food', type: 'Food', color: '#f59e0b', description: 'Restaurants & delivery', isActive: true },
            { name: 'Health & Fitness', slug: 'health', type: 'Health', color: '#10b981', description: 'Gym & wellness', isActive: true },
            { name: 'Travel', slug: 'travel', type: 'Travel', color: '#3b82f6', description: 'Hotels, flights & tours', isActive: true },
            { name: 'Entertainment', slug: 'entertainment', type: 'Entertainment', color: '#a855f7', description: 'Movies, music & events', isActive: true },
            { name: 'Sports', slug: 'sports', type: 'Sports', color: '#ef4444', description: 'Sports gear & events', isActive: true },
        ]);
        const c = Object.fromEntries(cats.map(x => [x.slug, x._id]));
        console.log(`✅ ${cats.length} categories`);

        // Platforms
        await Platform.deleteMany({});
        const plats = await Platform.insertMany([
            { name: 'Instagram', slug: 'instagram', description: 'Visual storytelling', website: 'https://instagram.com', isActive: true },
            { name: 'YouTube', slug: 'youtube', description: 'Video advertising', website: 'https://youtube.com', isActive: true },
            { name: 'Google Ads', slug: 'google-ads', description: 'Search & display', website: 'https://ads.google.com', isActive: true },
            { name: 'Facebook', slug: 'facebook', description: 'Social advertising', website: 'https://facebook.com', isActive: true },
            { name: 'Twitter/X', slug: 'twitter', description: 'Promoted tweets', website: 'https://twitter.com', isActive: true },
            { name: 'LinkedIn', slug: 'linkedin', description: 'B2B professional', website: 'https://linkedin.com', isActive: true },
        ]);
        const p = Object.fromEntries(plats.map(x => [x.slug, x._id]));
        console.log(`✅ ${plats.length} platforms`);

        // Ads
        await Ad.deleteMany({});
        const ads = await Ad.insertMany([
            {
                title: 'iPhone 15 Pro — Power. Action. Pro.',
                description: 'Experience the most powerful iPhone with A17 Pro chip, titanium design and Action button. Pre-order now and get free AirPods.',
                image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
                visitLink: 'https://apple.com/iphone-15-pro',
                category: c['electronics'], platform: p['instagram'], createdBy: admin._id,
                status: 'active', budget: 50000,
                targetAudience: { gender: 'all', ageGroup: '18-35', budget: 'high' },
                analytics: { views: 2847, clicks: 312 },
            },
            {
                title: 'Samsung Galaxy S24 Ultra — Now with AI',
                description: 'The first Galaxy AI smartphone. 200MP camera, Snapdragon 8 Gen 3, built-in S Pen. Transform the way you work.',
                image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
                visitLink: 'https://samsung.com/galaxy-s24-ultra',
                category: c['electronics'], platform: p['youtube'], createdBy: admin._id,
                status: 'active', budget: 45000,
                targetAudience: { gender: 'all', ageGroup: '25-40', budget: 'high' },
                analytics: { views: 3210, clicks: 289 },
            },
            {
                title: 'Sony WH-1000XM5 Headphones',
                description: 'Industry-leading noise canceling, 30-hour battery life. Two processors and eight microphones for perfect sound every time.',
                image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
                visitLink: 'https://sony.com/wh1000xm5',
                category: c['electronics'], platform: p['google-ads'], createdBy: admin._id,
                status: 'active', budget: 20000,
                targetAudience: { gender: 'all', ageGroup: 'all', budget: 'medium' },
                analytics: { views: 1923, clicks: 201 },
            },
            {
                title: 'Myntra End of Reason Sale — Up to 80% Off',
                description: 'Shop the biggest fashion sale! Flat 80% off on Nike, Adidas, Zara, H&M and more. Free delivery above ₹299.',
                image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
                visitLink: 'https://myntra.com',
                category: c['fashion'], platform: p['instagram'], createdBy: admin._id,
                status: 'active', budget: 35000,
                targetAudience: { gender: 'female', ageGroup: '18-30', budget: 'low' },
                analytics: { views: 5621, clicks: 892 },
            },
            {
                title: 'Uniqlo — Lifewear for Every Season',
                description: 'Simple, quality basics for everyday life. Made with premium materials, designed for comfort and versatility.',
                image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
                visitLink: 'https://uniqlo.com/in',
                category: c['fashion'], platform: p['facebook'], createdBy: admin._id,
                status: 'active', budget: 18000,
                targetAudience: { gender: 'all', ageGroup: '20-40', budget: 'medium' },
                analytics: { views: 2104, clicks: 178 },
            },
            {
                title: 'Coursera — Learn from World-Class Universities',
                description: 'Join 130M+ learners. Get certified in Data Science, AI, Business from Stanford, Google, IBM. First month free.',
                image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80',
                visitLink: 'https://coursera.org',
                category: c['education'], platform: p['google-ads'], createdBy: admin._id,
                status: 'active', budget: 25000,
                targetAudience: { gender: 'all', ageGroup: '18-35', budget: 'medium' },
                analytics: { views: 4312, clicks: 567 },
            },
            {
                title: 'Udemy — Learn Any Skill for ₹449',
                description: '230,000+ courses in programming, design, marketing and more. Learn at your pace. Lifetime access. 30-day money-back guarantee.',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
                visitLink: 'https://udemy.com',
                category: c['education'], platform: p['facebook'], createdBy: admin._id,
                status: 'active', budget: 15000,
                targetAudience: { gender: 'all', ageGroup: 'all', budget: 'low' },
                analytics: { views: 6891, clicks: 1023 },
            },
            {
                title: 'Zomato Gold — Free Delivery All Month',
                description: 'Unlimited free delivery, exclusive discounts at 5000+ restaurants. First month at just ₹99. Cancel anytime.',
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
                visitLink: 'https://zomato.com/gold',
                category: c['food'], platform: p['instagram'], createdBy: admin._id,
                status: 'active', budget: 12000,
                targetAudience: { gender: 'all', ageGroup: '18-30', budget: 'low' },
                analytics: { views: 8932, clicks: 1456 },
            },
            {
                title: 'Swiggy Instamart — Groceries in 10 Minutes',
                description: 'Fresh fruits, veggies, dairy and more delivered in 10 minutes. Use code FIRST50 for ₹50 off your first order.',
                image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
                visitLink: 'https://swiggy.com/instamart',
                category: c['food'], platform: p['youtube'], createdBy: admin._id,
                status: 'active', budget: 22000,
                targetAudience: { gender: 'all', ageGroup: 'all', budget: 'low' },
                analytics: { views: 7412, clicks: 1102 },
            },
            {
                title: 'Cult.fit — Your Fitness, Your Way',
                description: 'Access 40+ workout types — HIIT, yoga, boxing, Zumba and more. Train at home or at nearest center. First week free.',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
                visitLink: 'https://cult.fit',
                category: c['health'], platform: p['instagram'], createdBy: admin._id,
                status: 'active', budget: 30000,
                targetAudience: { gender: 'all', ageGroup: '18-40', budget: 'medium' },
                analytics: { views: 3892, clicks: 423 },
            },
            {
                title: 'MakeMyTrip — Holiday Packages from ₹12,999',
                description: 'Book your dream vacation! Flights + Hotel + Experiences. Over 5 lakh happy travellers. Use code TRAVEL25 for extra 25% off.',
                image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80',
                visitLink: 'https://makemytrip.com',
                category: c['travel'], platform: p['google-ads'], createdBy: admin._id,
                status: 'active', budget: 40000,
                targetAudience: { gender: 'all', ageGroup: '25-45', budget: 'high' },
                analytics: { views: 5104, clicks: 634 },
            },
            {
                title: 'BookMyShow — Movies & Events Near You',
                description: 'Book tickets for blockbusters, live concerts, comedy shows and sports. Exclusive deals every Wednesday with Kotak cards.',
                image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
                visitLink: 'https://bookmyshow.com',
                category: c['entertainment'], platform: p['twitter'], createdBy: admin._id,
                status: 'active', budget: 17000,
                targetAudience: { gender: 'all', ageGroup: '16-35', budget: 'low' },
                analytics: { views: 9123, clicks: 1762 },
            },
        ]);
        console.log(`✅ ${ads.length} active ads created`);
        console.log('\n🎉 Seeding complete! Refresh the client dashboard.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌', err.message);
        process.exit(1);
    }
})();
