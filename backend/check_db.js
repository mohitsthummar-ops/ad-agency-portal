const mongoose = require('mongoose');
require('dotenv').config();
const SubscriptionPlan = require('./src/models/SubscriptionPlan');
const connectDB = require('./src/config/db');

async function check() {
    await connectDB();
    const plans = await SubscriptionPlan.find();
    console.log('--- Subscription Plans ---');
    console.log(JSON.stringify(plans, null, 2));
    const count = await SubscriptionPlan.countDocuments();
    console.log('Count:', count);
    const activeCount = await SubscriptionPlan.countDocuments({ isActive: true });
    console.log('Active Count:', activeCount);
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
