
require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionPlan = require('./src/models/SubscriptionPlan');

async function checkPlans() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const plans = await SubscriptionPlan.find({});
        console.log('Total plans found:', plans.length);
        console.log('Plans:', JSON.stringify(plans, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkPlans();
