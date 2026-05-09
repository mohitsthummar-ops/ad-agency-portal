require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const AdRequest = require('./src/models/AdRequest');
const User = require('./src/models/User');

// Setup mock request/response for controller testing since we are not hitting the actual HTTP endpoint
const { generateAIImage } = require('./src/controllers/adRequestController');

async function createAndGenerate() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ad-agency', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to DB...");

        // Find a client user
        let user = await User.findOne({ role: 'client' });
        if (!user) {
            console.log("No client user found in DB. Creating one...");
            user = await User.create({
                name: 'Test Client',
                email: 'testclient@example.com',
                password: 'password123',
                role: 'client',
                subscription: {
                    plan: 'Pro',
                    imageId: null,
                    imagesUsed: 0,
                    imageLimit: 100,
                    status: 'Active',
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });
        }

        // Ensure user has active subscription
        if (user.subscription.status !== 'Active' || user.subscription.imagesUsed >= user.subscription.imageLimit) {
            user.subscription.status = 'Active';
            user.subscription.imagesUsed = 0;
            user.subscription.imageLimit = 100;
            user.subscription.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await user.save();
        }

        console.log(`Using client user: ${user.email} (${user._id})`);

        // Create campaign request
        const request = await AdRequest.create({
            user: user._id,
            title: 'Spring Awakening 2026',
            businessName: 'Blossom & Co.',
            description: 'A vibrant spring sale featuring our new organic skincare line with floral extracts & natural ingredients.',
            targetAudience: 'Skincare enthusiasts, Eco-conscious buyers',
            offerDetails: 'Buy 1 Get 1 Free on all floral serums!',
            imageStyle: 'Instagram Post',
            status: 'approved' // Auto-approve
        });

        console.log(`Created approved campaign: ${request._id}`);
        console.log(`Invoking image generator...`);

        // Mock req/res
        const req = {
            params: { id: request._id.toString() },
            user: { _id: user._id.toString() }
        };

        const res = {
            json: function (data) {
                console.log("\n[SUCCESS] Controller Response:");
                console.log(JSON.stringify(data, null, 2));
            },
            status: function (code) {
                this.statusCode = code;
                return this;
            }
        };

        const next = function (err) {
            console.error("\n[ERROR] Controller next(err) called:");
            console.error(err);
        };

        // Run controller logic
        await generateAIImage(req, res, next);

    } catch (e) {
        console.error("Script Error:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from DB.");
    }
}

createAndGenerate();
