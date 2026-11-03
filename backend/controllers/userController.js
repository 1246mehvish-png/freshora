const User = require('../models/User');
const Seller = require('../models/Seller');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

const buildUserResponse = (user) => ({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    whatsapp: user.whatsapp,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    address: user.address,
    city: user.city,
    province: user.province,
    postalCode: user.postalCode,
    country: user.country,
    addresses: user.addresses || [],
    createdAt: user.createdAt,
});

/**
 * @desc    Update own profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { name, phone, whatsapp, address, city, province, postalCode, country, avatar } = req.body;

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (whatsapp !== undefined) user.whatsapp = whatsapp;
        if (address !== undefined) user.address = address;
        if (city !== undefined) user.city = city;
        if (province !== undefined) user.province = province;
        if (postalCode !== undefined) user.postalCode = postalCode;
        if (country !== undefined) user.country = country;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();
        res.json({ success: true, message: 'Profile updated', user: buildUserResponse(user) });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a saved address
 * @route   POST /api/users/addresses
 * @access  Private
 */
const addAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { label, fullName, phone, addressLine, city, province, postalCode, country, isDefault } = req.body;

        if (!fullName || !phone || !addressLine || !city || !province || !postalCode || !country) {
            return res.status(400).json({ success: false, message: 'All address fields are required' });
        }

        if (isDefault) {
            user.addresses.forEach((a) => (a.isDefault = false));
        }

        user.addresses.push({
            label: label || 'Home',
            fullName,
            phone,
            addressLine,
            city,
            province,
            postalCode,
            country,
            isDefault: !!isDefault,
        });

        await user.save();
        res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a saved address
 * @route   PUT /api/users/addresses/:addressId
 * @access  Private
 */
const updateAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const address = user.addresses.id(req.params.addressId);
        if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

        const fields = ['label', 'fullName', 'phone', 'addressLine', 'city', 'province', 'postalCode', 'country', 'isDefault'];
        fields.forEach((f) => {
            if (req.body[f] !== undefined) address[f] = req.body[f];
        });

        if (req.body.isDefault) {
            user.addresses.forEach((a) => {
                if (a._id.toString() !== req.params.addressId) a.isDefault = false;
            });
        }

        await user.save();
        res.json({ success: true, message: 'Address updated', addresses: user.addresses });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a saved address
 * @route   DELETE /api/users/addresses/:addressId
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const address = user.addresses.id(req.params.addressId);
        if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

        address.deleteOne();
        await user.save();
        res.json({ success: true, message: 'Address deleted', addresses: user.addresses });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all buyers (admin)
 * @route   GET /api/users/buyers
 * @access  Private/Admin
 */
const getBuyers = async (req, res, next) => {
    try {
        const buyers = await User.find({ role: 'buyer' }).sort('-createdAt');
        res.json({ success: true, count: buyers.length, buyers: buyers.map(buildUserResponse) });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all sellers (admin)
 * @route   GET /api/users/sellers
 * @access  Private/Admin
 */
const getSellers = async (req, res, next) => {
    try {
        const sellers = await Seller.find().populate('userId', 'name email phone username status createdAt').sort('-createdAt');
        res.json({ success: true, count: sellers.length, sellers });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user status (admin) - approve/reject/suspend/activate
 * @route   PUT /api/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['active', 'pending', 'suspended', 'deactivated'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.status = status;
        await user.save();

        // If seller, sync approval status
        if (user.role === 'seller') {
            const seller = await Seller.findOne({ userId: user._id });
            if (seller) {
                if (status === 'active') seller.approvalStatus = 'approved';
                if (status === 'suspended' || status === 'deactivated') seller.approvalStatus = 'rejected';
                await seller.save();
            }
        }

        res.json({ success: true, message: 'User status updated', user: buildUserResponse(user) });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user (admin)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete admin account' });
        }

        if (user.role === 'seller') {
            await Seller.deleteOne({ userId: user._id });
        }
        if (user.role === 'buyer') {
            await Cart.deleteOne({ buyerId: user._id });
            await Wishlist.deleteOne({ buyerId: user._id });
        }

        await user.deleteOne();
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    getBuyers,
    getSellers,
    updateUserStatus,
    deleteUser,
};
