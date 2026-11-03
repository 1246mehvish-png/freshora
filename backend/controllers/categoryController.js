const Category = require('../models/Category');
const Product = require('../models/Product');

const slugify = (str) =>
    str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
    try {
        const { name, description, image, status, displayOrder } = req.body;
        const category = await Category.create({
            name,
            slug: slugify(name),
            description: description || '',
            image: image || '',
            status: status || 'active',
            displayOrder: displayOrder || 0,
        });
        res.status(201).json({ success: true, message: 'Category created', category });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
    try {
        const query = req.user && req.user.role === 'admin' ? {} : { status: 'active' };
        const categories = await Category.find(query).sort('displayOrder name');
        res.json({ success: true, count: categories.length, categories });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        const { name, description, image, status, displayOrder } = req.body;
        if (name) {
            category.name = name;
            category.slug = slugify(name);
        }
        if (description !== undefined) category.description = description;
        if (image !== undefined) category.image = image;
        if (status) category.status = status;
        if (displayOrder !== undefined) category.displayOrder = displayOrder;

        await category.save();
        res.json({ success: true, message: 'Category updated', category });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        const productCount = await Product.countDocuments({ category: category._id });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete: ${productCount} product(s) belong to this category. Move or delete them first.`,
            });
        }

        await category.deleteOne();
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
