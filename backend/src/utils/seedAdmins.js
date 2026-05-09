const User = require('../models/User');

const seedAdmins = async () => {
    try {
        const admins = [
            {
                name: 'Admin One',
                email: 'admin1@adagency.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                name: 'Admin Two',
                email: 'admin2@adagency.com',
                password: 'admin123',
                role: 'admin'
            }
        ];

        for (const adminData of admins) {
            const exists = await User.findOne({ email: adminData.email });
            if (!exists) {
                await User.create(adminData);
                console.log(`✅ Default admin created: ${adminData.email}`);
            }
        }
    } catch (err) {
        console.error('❌ Failed to seed admins:', err.message);
    }
};

module.exports = seedAdmins;
