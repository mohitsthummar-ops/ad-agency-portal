require('dotenv').config();
const mongoose = require('mongoose');
const AdRequest = require('./src/models/AdRequest');
const User = require('./src/models/User');

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for cleanup...');

        // 1. Clean AdRequests
        const requests = await AdRequest.find({
            $or: [
                { generatedImageUrl: /^data:image/ },
                { 'imageHistory.url': /^data:image/ }
            ]
        });

        console.log(`Found ${requests.length} bloated AdRequests. Cleaning...`);
        for (const req of requests) {
            let updated = false;
            if (req.generatedImageUrl && req.generatedImageUrl.startsWith('data:image')) {
                req.generatedImageUrl = null; // Or you could save to file and link, but null is safer for cleanup
                updated = true;
            }
            if (req.imageHistory && req.imageHistory.length > 0) {
                req.imageHistory = req.imageHistory.filter(h => !h.url.startsWith('data:image'));
                updated = true;
            }
            if (updated) await req.save();
        }

        // 2. Clean Users
        const users = await User.find({ 'generatedImages.url': /^data:image/ });
        console.log(`Found ${users.length} bloated User documents. Cleaning...`);
        for (const user of users) {
            user.generatedImages = user.generatedImages.filter(img => !img.url.startsWith('data:image'));
            await user.save();
        }

        console.log('Cleanup complete! Bloated Base64 data removed.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
};

cleanup();
