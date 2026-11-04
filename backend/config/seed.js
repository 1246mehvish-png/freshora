const User = require('../models/User');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const WebsiteSettings = require('../models/WebsiteSettings');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

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
            console.log('Admin user created:', adminEmail);
        }

        // 1b. Demo buyer & seller accounts (for quick testing / login page helpers)
        const demoBuyerEmail = 'buyer@freshora.com';
        const demoBuyer = await User.findOne({ email: demoBuyerEmail });
        if (!demoBuyer) {
            const createdBuyer = await User.create({
                name: 'Demo Buyer',
                username: 'demobuyer',
                email: demoBuyerEmail,
                password: 'Buyer@123',
                phone: '+92 300 1111111',
                whatsapp: '+92 300 1111111',
                role: 'buyer',
                status: 'active',
                address: 'House 12, Street 5',
                city: 'Lahore',
                province: 'Punjab',
                postalCode: '54000',
                country: 'Pakistan',
            });
            await Cart.create({ buyerId: createdBuyer._id, items: [] });
            await Wishlist.create({ buyerId: createdBuyer._id, products: [] });
            console.log('Demo buyer created:', demoBuyerEmail);
        }

        const demoSellerEmail = 'seller@freshora.com';
        const demoSeller = await User.findOne({ email: demoSellerEmail });
        if (!demoSeller) {
            const createdSeller = await User.create({
                name: 'Demo Seller',
                username: 'demoseller',
                email: demoSellerEmail,
                password: 'Seller@123',
                phone: '+92 300 2222222',
                whatsapp: '+92 300 2222222',
                role: 'seller',
                status: 'active',
                address: 'Shop 8, Main Market',
                city: 'Lahore',
                province: 'Punjab',
                postalCode: '54000',
                country: 'Pakistan',
            });
            await Seller.create({
                userId: createdSeller._id,
                storeName: 'Fresh Demo Store',
                businessType: 'Fruits and Vegetables Seller',
                storeDescription: 'Demo store for testing',
                storeAddress: 'Shop 8, Main Market, Lahore',
                storeContactNumber: '+92 300 2222222',
                approvalStatus: 'approved',
            });
            console.log('Demo seller created:', demoSellerEmail);
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

        console.log('Seed data ensured.');
    } catch (error) {
        console.error('Seed error:', error.message);
    }
};

module.exports = { ensureSeed };
