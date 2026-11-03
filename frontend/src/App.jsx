import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Sellers from './pages/Sellers';
import SellerStore from './pages/SellerStore';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Buyer
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerProfile from './pages/buyer/BuyerProfile';
import BuyerOrders from './pages/buyer/BuyerOrders';
import BuyerOrderDetail from './pages/buyer/BuyerOrderDetail';
import BuyerPayments from './pages/buyer/BuyerPayments';
import BuyerWishlist from './pages/buyer/BuyerWishlist';
import BuyerAddresses from './pages/buyer/BuyerAddresses';
import BuyerNotifications from './pages/buyer/BuyerNotifications';
import BuyerChangePassword from './pages/buyer/BuyerChangePassword';

// Seller
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerAddProduct from './pages/seller/SellerAddProduct';
import SellerEditProduct from './pages/seller/SellerEditProduct';
import SellerOrders from './pages/seller/SellerOrders';
import SellerSales from './pages/seller/SellerSales';
import SellerEarnings from './pages/seller/SellerEarnings';
import SellerStoreProfile from './pages/seller/SellerStoreProfile';
import SellerSettings from './pages/seller/SellerSettings';
import SellerNotifications from './pages/seller/SellerNotifications';
import SellerChangePassword from './pages/seller/SellerChangePassword';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBuyers from './pages/admin/AdminBuyers';
import AdminSellers from './pages/admin/AdminSellers';
import AdminSellerRequests from './pages/admin/AdminSellerRequests';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminDeliveryCharges from './pages/admin/AdminDeliveryCharges';
import AdminReviews from './pages/admin/AdminReviews';
import AdminContactMessages from './pages/admin/AdminContactMessages';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminWebsiteSettings from './pages/admin/AdminWebsiteSettings';
import AdminLogo from './pages/admin/AdminLogo';
import AdminBanners from './pages/admin/AdminBanners';
import AdminAboutUs from './pages/admin/AdminAboutUs';
import AdminContactUs from './pages/admin/AdminContactUs';
import AdminPrivacy from './pages/admin/AdminPrivacy';
import AdminTerms from './pages/admin/AdminTerms';

// Route guards
const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
};

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/sellers" element={<Sellers />} />
                <Route path="/seller/:id" element={<SellerStore />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Buyer-only pages */}
            <Route
                path="/cart"
                element={
                    <ProtectedRoute roles={['buyer']}>
                        <CartPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/checkout"
                element={
                    <ProtectedRoute roles={['buyer']}>
                        <Checkout />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/order-success/:id"
                element={
                    <ProtectedRoute roles={['buyer']}>
                        <OrderSuccess />
                    </ProtectedRoute>
                }
            />

            {/* Buyer dashboard */}
            <Route
                path="/buyer"
                element={
                    <ProtectedRoute roles={['buyer']}>
                        <DashboardLayout role="buyer" />
                    </ProtectedRoute>
                }
            >
                <Route index element={<BuyerDashboard />} />
                <Route path="profile" element={<BuyerProfile />} />
                <Route path="orders" element={<BuyerOrders />} />
                <Route path="orders/:id" element={<BuyerOrderDetail />} />
                <Route path="payments" element={<BuyerPayments />} />
                <Route path="wishlist" element={<BuyerWishlist />} />
                <Route path="addresses" element={<BuyerAddresses />} />
                <Route path="notifications" element={<BuyerNotifications />} />
                <Route path="change-password" element={<BuyerChangePassword />} />
            </Route>

            {/* Seller dashboard */}
            <Route
                path="/seller"
                element={
                    <ProtectedRoute roles={['seller']}>
                        <DashboardLayout role="seller" />
                    </ProtectedRoute>
                }
            >
                <Route index element={<SellerDashboard />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="products/add" element={<SellerAddProduct />} />
                <Route path="products/edit/:id" element={<SellerEditProduct />} />
                <Route path="orders" element={<SellerOrders />} />
                <Route path="sales" element={<SellerSales />} />
                <Route path="earnings" element={<SellerEarnings />} />
                <Route path="store" element={<SellerStoreProfile />} />
                <Route path="settings" element={<SellerSettings />} />
                <Route path="notifications" element={<SellerNotifications />} />
                <Route path="change-password" element={<SellerChangePassword />} />
            </Route>

            {/* Admin dashboard */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute roles={['admin']}>
                        <DashboardLayout role="admin" />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="buyers" element={<AdminBuyers />} />
                <Route path="sellers" element={<AdminSellers />} />
                <Route path="seller-requests" element={<AdminSellerRequests />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="delivery-charges" element={<AdminDeliveryCharges />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="contact-messages" element={<AdminContactMessages />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="settings" element={<AdminWebsiteSettings />} />
                <Route path="logo" element={<AdminLogo />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="about-us" element={<AdminAboutUs />} />
                <Route path="contact-us" element={<AdminContactUs />} />
                <Route path="privacy" element={<AdminPrivacy />} />
                <Route path="terms" element={<AdminTerms />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;