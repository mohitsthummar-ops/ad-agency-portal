require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const SubscriptionPlan = require('./models/SubscriptionPlan');

const UPDATES = {
    'Demo': { imageLimit: 10, features: ['7 days access', '10 AI image generations', 'Try the platform'] },
    '1 Month': { imageLimit: 100, features: ['30 days access', '100 AI image generations', 'All image styles', 'Priority support'] },
    '6 Months': { imageLimit: 750, features: ['180 days access', '750 AI image generations', 'All image styles', 'Priority support', 'Bulk savings'] },
    '1 Year': { imageLimit: 2000, features: ['365 days access', '2000 AI image generations', 'All image styles', 'VIP support', 'Best value'] }
};

async function updatePlans() {
    try {
        await connectDB();
        console.log('Connected to DB. Updating plans...');
        
        for (const [key, data] of Object.entries(UPDATES)) {
            const result = await SubscriptionPlan.updateOne({ key }, { $set: data });
            if (result.matchedCount > 0) {
                console.log(`✅ Updated plan: ${key}`);
            } else {
                console.log(`⚠️ Plan not found: ${key}`);
            }
        }
        
        console.log('Update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

updatePlans();
