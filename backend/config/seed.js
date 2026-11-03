const User = require('../models/User');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const WebsiteSettings = require('../models/WebsiteSettings');

/**
 * Ensure the admin user, default categories, and website settings exist.
 * Runs automatically on server start.
 */
const ensureSeed = async () => {
    try {
        // 1. Admin user
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@freshora.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        const adminName = process.env.ADMIN_NAME || 'Freshora Admin';

        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            admin = await User.create({
                name: adminName,
                username: 'freshora_admin',
                email: adminEmail,
                password: adminPassword,
                phone: '+92 300 0000000',
                role: 'admin',
                status: 'active',
                country: 'Pakistan',
            });
            console.log('Admin user created:'.green, adminEmail);
        }

        // 2. Default categories
        const defaultCategories = [
            { name: 'Fresh Fruits', slug: 'fresh-fruits', description: 'Fresh seasonal fruits from local farms', displayOrder: 1 },
            { name: 'Fresh Vegetables', slug: 'fresh-vegetables', description: 'Freshly harvested vegetables', displayOrder: 2 },
            { name: 'Organic Products', slug: 'organic-products', description: 'Certified organic fruits and vegetables', displayOrder: 3 },
            { name: 'Seasonal Fruits', slug: 'seasonal-fruits', description: 'Fruits available in the current season', displayOrder: 4 },
            { name: 'Leafy Vegetables', slug: 'leafy-vegetables', description: 'Fresh leafy greens and herbs', displayOrder: 5 },
        ];

        for (const cat of defaultCategories) {
            const exists = await Category.findOne({ slug: cat.slug });
            if (!exists) {
                await Category.create(cat);
            }
        }

        // 3. Website settings
        await WebsiteSettings.getOrCreate();

        console.log('Seed data ensured.'.green);
    } catch (error) {
        console.error('Seed error:', error.message);
    }
};

module.exports = { ensureSeed };
