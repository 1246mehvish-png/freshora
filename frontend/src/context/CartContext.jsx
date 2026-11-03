import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};

export function CartProvider({ children }) {
    const { isAuthenticated, isBuyer } = useAuth();
    const [cart, setCart] = useState({ items: [], subtotal: 0, deliveryCharges: 0, totalAmount: 0 });
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated || !isBuyer) {
            setCart({ items: [], subtotal: 0, deliveryCharges: 0, totalAmount: 0 });
            return;
        }
        setLoading(true);
        try {
            const res = await cartService.get();
            setCart(res.data.cart);
        } catch (err) {
            // silent - cart may not exist yet
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isBuyer]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = useCallback(async (productId, quantity = 1) => {
        const res = await cartService.add(productId, quantity);
        setCart(res.data.cart);
        return res.data;
    }, []);

    const updateQuantity = useCallback(async (productId, quantity) => {
        const res = await cartService.update(productId, quantity);
        setCart(res.data.cart);
        return res.data;
    }, []);

    const removeFromCart = useCallback(async (productId) => {
        const res = await cartService.remove(productId);
        setCart(res.data.cart);
        return res.data;
    }, []);

    const clearCart = useCallback(async () => {
        await cartService.clear();
        setCart({ items: [], subtotal: 0, deliveryCharges: 0, totalAmount: 0 });
    }, []);

    const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

    const value = {
        cart,
        loading,
        itemCount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}