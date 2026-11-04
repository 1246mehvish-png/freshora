import api from './api';

// ---------- Auth ----------
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    changePassword: (data) => api.put('/auth/change-password', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

// ---------- Users ----------
export const userService = {
    updateProfile: (data) => api.put('/users/profile', data),
    addAddress: (data) => api.post('/users/addresses', data),
    updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
    deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
    getBuyers: () => api.get('/users/buyers'),
    getSellers: () => api.get('/users/sellers'),
    updateStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

// ---------- Sellers ----------
export const sellerService = {
    getAll: (params) => api.get('/sellers', { params }),
    getPublic: (id) => api.get(`/sellers/${id}`),
    getMine: () => api.get('/sellers/me/profile'),
    updateMine: (data) => api.put('/sellers/me', data),
    updateApproval: (id, data) => api.put(`/sellers/${id}/approval`, data),
    toggleFeatured: (id) => api.put(`/sellers/${id}/featured`),
    delete: (id) => api.delete(`/sellers/${id}`),
};

// ---------- Products ----------
export const productService = {
    getAll: (params) => api.get('/products', { params }),
    getHome: () => api.get('/products/home'),
    getOne: (id) => api.get(`/products/${id}`),
    getMine: () => api.get('/products/my-products/list'),
    create: (data) => api.post('/products', data),
    createAsAdmin: (data) => api.post('/products/admin', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    updateAvailability: (id, availability) => api.patch(`/products/${id}/availability`, { availability }),
    delete: (id) => api.delete(`/products/${id}`),
};

// ---------- Categories ----------
export const categoryService = {
    getAll: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// ---------- Cart ----------
export const cartService = {
    get: () => api.get('/cart'),
    add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
    update: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
    remove: (productId) => api.delete(`/cart/${productId}`),
    clear: () => api.delete('/cart'),
};

// ---------- Orders ----------
export const orderService = {
    create: (data) => api.post('/orders', data),
    getMine: () => api.get('/orders/my-orders'),
    getOne: (id) => api.get(`/orders/${id}`),
    getSellerOrders: () => api.get('/orders/seller'),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
    cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
    getAll: (params) => api.get('/orders', { params }),
};

// ---------- Payments ----------
export const paymentService = {
    getMine: () => api.get('/payments/my-payments'),
    getAll: (params) => api.get('/payments', { params }),
    verify: (id, data) => api.put(`/payments/${id}/verify`, data),
    initiate: (data) => api.post('/payments/initiate', data),
};

// ---------- Upload ----------
export const uploadService = {
    single: (fileRev) => {
        const formData = new FormData();
        formData.append('image', fileRev);
        return api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    multiple: (files) => {
        const formData = new FormData();
        files.forEach((f) => formData.append('images', f));
        return api.post('/upload/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
};

// ---------- Settings ----------
export const settingsService = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
    addBanner: (data) => api.post('/settings/banners', data),
    deleteBanner: (id) => api.delete(`/settings/banners/${id}`),
};

// ---------- Notifications ----------
export const notificationService = {
    getMine: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
};

// ---------- Contact ----------
export const contactService = {
    submit: (data) => api.post('/contact', data),
    getAll: () => api.get('/contact'),
    markRead: (id) => api.put(`/contact/${id}/read`),
    reply: (id, reply) => api.put(`/contact/${id}/reply`, { reply }),
    delete: (id) => api.delete(`/contact/${id}`),
};

// ---------- Reviews ----------
export const reviewService = {
    create: (data) => api.post('/reviews', data),
    getProduct: (productId) => api.get(`/reviews/product/${productId}`),
    getSeller: (sellerId) => api.get(`/reviews/seller/${sellerId}`),
    getAll: () => api.get('/reviews'),
    moderate: (id, status) => api.put(`/reviews/${id}/moderate`, { status }),
    delete: (id) => api.delete(`/reviews/${id}`),
};

// ---------- Wishlist ----------
export const wishlistService = {
    get: () => api.get('/wishlist'),
    toggle: (productId) => api.post(`/wishlist/${productId}`),
    remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// ---------- Dashboard ----------
export const dashboardService = {
    admin: () => api.get('/dashboard/admin'),
    seller: () => api.get('/dashboard/seller'),
    buyer: () => api.get('/dashboard/buyer'),
};
