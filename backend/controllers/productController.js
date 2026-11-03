const Product = require('../models/Product');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const Notification = require('../models/Notification');

const slugify = (str) =>
    str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Seller
 */
const createProduct = async (req, res, next) => {
    try {
        const seller = await Seller.findOne({ userId: req.user._id });
        if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found' });
        if (seller.approvalStatus !== 'approved') {
            return res.status(403).json({ success: false, message: 'Your store is not approved yet.' });
        }

        const {
            productName,
            category,
            description,
            price,
            unit,
            stock,
            images,
            freshnessInformation,
            organic,
            discount,
            availability,
        } = req.body;

        // Validate category exists
        const cat = await Category.findById(category);
        if (!cat) return res.status(400).json({ success: false, message: 'Invalid category' });

        // Handle uploaded image files (from Cloudinary multer)
        let imageUrls = [];
        if (req.files && req.files.length) {
            imageUrls = req.files.map((f) => f.path || f.location);
        } else if (images) {
            imageUrls = Array.isArray(images) ? images : [images];
        }

        const product = await Product.create({
            sellerId: seller._id,
            productName,
            slug: slugify(productName) + '-' + Date.now().toString(36),
            category,
            description,
            price: Number(price),
            unit,
            stock: Number(stock),
            images: imageUrls,
            freshnessInformation: freshnessInformation || '',
            organic: organic === true || organic === 'true',
            discount: Number(discount) || 0,
            availability: availability || (Number(stock) > 0 ? 'in-stock' : 'out-of-stock'),
        });

        res.status(201).json({ success: true, message: 'Product added successfully', product });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get products with search, filter, sort, pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
    try {
        const {
            search,
            category,
            seller,
            minPrice,
            maxPrice,
            rating,
            availability,
            organic,
            sort,
            page = 1,
            limit = 12,
            featured,
            trending,
            bestSelling,
            seasonal,
            status,
        } = req.query;

        const query = {};

        // Status: default to active for public; admin can pass status
        if (status) query.status = status;
        else query.status = 'active';

        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) {
            // Accept category id or slug
            if (category.match(/^[0-9a-fA-F]{24}$/)) query.category = category;
            else {
                const cat = await Category.findOne({ slug: category });
                if (cat) query.category = cat._id;
            }
        }
        if (seller) query.sellerId = seller;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (rating) query.rating = { $gte: Number(rating) };
        if (availability) query.availability = availability;
        if (organic === 'true') query.organic = true;
        if (featured === 'true') query.isFeatured = true;
        if (trending === 'true') query.isTrending = true;
        if (bestSelling === 'true') query.isBestSelling = true;
        if (seasonal === 'true') query.isSeasonal = true;

        // Sorting
        let sortOption = '-createdAt';
        switch (sort) {
            case 'price_asc':
                sortOption = 'price';
                break;
            case 'price_desc':
                sortOption = '-price';
                break;
            case 'newest':
                sortOption = '-createdAt';
                break;
            case 'best_selling':
                sortOption = '-totalSold';
                break;
            case 'rating':
                sortOption = '-rating';
                break;
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category', 'name slug')
                .populate('sellerId', 'storeName storeLogo rating userId')
                .sort(sortOption)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean({ virtuals: true }),
            Product.countDocuments(query),
        ]);

        res.json({
            success: true,
            count: products.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            products,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('sellerId', 'storeName storeLogo storeBanner storeDescription storeAddress rating totalReviews userId');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Related products
        const related = await Product.find({
            category: product.category._id,
            _id: { $ne: product._id },
            status: 'active',
        })
            .limit(4)
            .populate('sellerId', 'storeName storeLogo');

        res.json({ success: true, product, related });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my products (logged-in seller)
 * @route   GET /api/products/my-products
 * @access  Private/Seller
 */
const getMyProducts = async (req, res, next) => {
    try {
        const seller = await Seller.findOne({ userId: req.user._id });
        if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found' });

        const products = await Product.find({ sellerId: seller._id })
            .populate('category', 'name slug')
            .sort('-createdAt');

        res.json({ success: true, count: products.length, products });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update product (owner seller or admin)
 * @route   PUT /api/products/:id
 * @access  Private/Seller|Admin
 */
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Ownership check
        if (req.user.role !== 'admin') {
            const seller = await Seller.findOne({ userId: req.user._id });
            if (!seller || product.sellerId.toString() !== seller._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to edit this product' });
            }
        }

        const fields = [
            'productName',
            'category',
            'description',
            'price',
            'unit',
            'stock',
            'freshnessInformation',
            'discount',
            'availability',
            'isFeatured',
            'isTrending',
            'isBestSelling',
            'isSeasonal',
            'status',
        ];

        fields.forEach((f) => {
            if (req.body[f] !== undefined) product[f] = req.body[f];
        });

        if (req.body.organic !== undefined) product.organic = req.body.organic === true || req.body.organic === 'true';

        // Replace image list when sent as JSON array (from dashboard editor)
        if (req.body.images !== undefined) {
            const incoming = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            product.images = incoming.filter(Boolean);
        }

        // Update stock-based availability
        if (req.body.stock !== undefined) {
            product.stock = Number(req.body.stock);
            if (product.stock === 0) product.availability = 'out-of-stock';
            else if (product.availability === 'out-of-stock') product.availability = 'in-stock';
        }

        // Append new images
        if (req.files && req.files.length) {
            product.images.push(...req.files.map((f) => f.path || f.location));
        }

        await product.save();
        res.json({ success: true, message: 'Product updated', product });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete product (owner seller or admin)
 * @route   DELETE /api/products/:id
 * @access  Private/Seller|Admin
 */
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (req.user.role !== 'admin') {
            const seller = await Seller.findOne({ userId: req.user._id });
            if (!seller || product.sellerId.toString() !== seller._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
            }
        }

        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update product availability quickly
 * @route   PATCH /api/products/:id/availability
 * @access  Private/Seller|Admin
 */
const updateAvailability = async (req, res, next) => {
    try {
        const { availability } = req.body;
        if (!['in-stock', 'out-of-stock', 'limited'].includes(availability)) {
            return res.status(400).json({ success: false, message: 'Invalid availability' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (req.user.role !== 'admin') {
            const seller = await Seller.findOne({ userId: req.user._id });
            if (!seller || product.sellerId.toString() !== seller._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
        }

        product.availability = availability;
        await product.save();
        res.json({ success: true, message: 'Availability updated', product });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Homepage data: featured, trending, best selling, seasonal, offers
 * @route   GET /api/products/home
 * @access  Public
 */
const getHomeData = async (req, res, next) => {
    try {
        const [featured, trending, bestSelling, seasonal, offers, categories, sellers] = await Promise.all([
            Product.find({ isFeatured: true, status: 'active' })
                .populate('category', 'name slug')
                .populate('sellerId', 'storeName storeLogo')
                .limit(8)
                .lean({ virtuals: true }),
            Product.find({ isTrending: true, status: 'active' })
                .populate('category', 'name slug')
                .populate('sellerId', 'storeName storeLogo')
                .limit(8)
                .lean({ virtuals: true }),
            Product.find({ isBestSelling: true, status: 'active' })
                .populate('category', 'name slug')
                .populate('sellerId', 'storeName storeLogo')
                .limit(8)
                .lean({ virtuals: true }),
            Product.find({ isSeasonal: true, status: 'active' })
                .populate('category', 'name slug')
                .populate('sellerId', 'storeName storeLogo')
                .limit(8)
                .lean({ virtuals: true }),
            Product.find({ discount: { $gt: 0 }, status: 'active' })
                .populate('category', 'name slug')
                .populate('sellerId', 'storeName storeLogo')
                .limit(8)
                .lean({ virtuals: true }),
            Category.find({ status: 'active' }).sort('displayOrder'),
            Seller.find({ approvalStatus: 'approved', isActive: true, isFeatured: true })
                .populate('userId', 'name')
                .limit(6),
        ]);

        res.json({ success: true, featured, trending, bestSelling, seasonal, offers, categories, sellers });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
    updateAvailability,
    getHomeData,
};
