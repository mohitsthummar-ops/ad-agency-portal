
require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionPlan = require('./src/models/SubscriptionPlan');

async function migratePlans() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        console.log('Clearing old subscription plans...');
        const deleteRes = await SubscriptionPlan.deleteMany({});
        console.log(`Deleted ${deleteRes.deletedCount} plans.`);
        
        console.log('Plans cleared. The next request to /api/subscription/packages will re-seed them correctly.');
        process.exit(0);
    } catch (err) {
        console.error('Error during migration:', err);
        process.exit(1);
    }
}

migratePlans();
