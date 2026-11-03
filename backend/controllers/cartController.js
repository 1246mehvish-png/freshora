const Cart = require('../models/Cart');
const Product = require('../models/Product');
const WebsiteSettings = require('../models/WebsiteSettings');

/**
 * Build a populated cart response with computed totals.
 */
const buildCartResponse = async (cart964) => {
    const cart = await Cart.findById(cart964._id)
        .populate({
            path: 'items.product',
            populate: [
                { path: 'sellerId', select: 'storeName storeLogo storeContactNumber userId' },
                { path: 'category', select: 'name slug' },
            ],
        })
        .lean();

    const settings = await WebsiteSettings.getOrCreate();
    const deliveryCharge = settings.deliveryCharges?.defaultCharge ?? 150;
    const freeAbove = settings.deliveryCharges?.freeAbove ?? 3000;

    let subtotal = 0;
    const items = (cart.items || [])
        .filter((i) => i.product) // drop orphaned items
        .map((i) => {
            const p = i.product;
            const finalPrice = p.discount ? Number((p.price - (p.price * p.discount) / 100).toFixed(2)) : p.price;
            const lineTotal = Number((finalPrice * i.quantity).toFixed(2));
            subtotal += lineTotal;
            return {
                product: p,
                quantity: i.quantity,
                unitPrice: p.price,
                finalPrice,
                lineTotal,
                stock: p.stock,
                sellerName: p.sellerId?.storeName || 'Freshora Seller',
            };
        });

    subtotal = Number(subtotal.toFixed(2));
    const deliveryCharges = subtotal >= freeAbove || subtotal === 0 ? 0 : deliveryCharge;
    const totalAmount = Number((subtotal + deliveryCharges).toFixed(2));

    return { items, subtotal, deliveryCharges, totalAmount, freeAbove, deliveryCharge };
};

/**
 * @desc    Get buyer cart
 * @route   GET /api/cart
 * @access  Private/Buyer
 */
const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ buyerId: req.user._id });
        if (!cart) cart = await Cart.create({ buyerId: req.user._id, items: [] });

        const data = await buildCartResponse(cart);
        res.json({ success: true, cart: data });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private/Buyer
 */
const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const qty = Math.max(1, Number(quantity));

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        if (product.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Product is not available' });
        }
        if (product.stock < qty) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} in stock` });
        }

        let cart = await Cart.findOne({ buyerId: req.user._id });
        if (!cart) cart = await Cart.create({ buyerId: req.user._id, items: [] });

        const existing = cart.items.find((i) => i.product.toString() === productId);
        if (existing) {
            const newQty = existing.quantity + qty;
            if (newQty > product.stock) {
                return res.status(400).json({ success: false, message: `Only ${product.stock} in stock` });
            }
            existing.quantity = newQty;
        } else {
            cart.items.push({ product: productId, quantity: qty });
        }

        await cart.save();
        const data = await buildCartResponse(cart);
        res.json({ success: true, message: 'Added to cart', cart: data });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:productId
 * @access  Private/Buyer
 */
const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const qty = Number(quantity);

        if (qty < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        if (qty > product.stock) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} in stock` });
        }

        const cart = await Cart.findOne({ buyerId: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const item = cart.items.find((i) => i.product.toString() === req.params.productId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

        item.quantity = qty;
        await cart.save();

        const data = await buildCartResponse(cart);
        res.json({ success: true, message: 'Cart updated', cart: data });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private/Buyer
 */
const removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ buyerId: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
        await cart.save();

        const data = await buildCartResponse(cart);
        res.json({ success: true, message: 'Item removed', cart: data });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private/Buyer
 */
const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ buyerId: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, buildCartResponse };
