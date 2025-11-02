import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount and user change
    useEffect(() => {
        if (user) {
            const savedCart = localStorage.getItem(`cart_${user.uid}`);
            const savedWishlist = localStorage.getItem(`wishlist_${user.uid}`);

            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
            if (savedWishlist) {
                setWishlistItems(JSON.parse(savedWishlist));
            }
        } else {
            setCartItems([]);
            setWishlistItems([]);
        }
    }, [user]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (user && cartItems.length >= 0) {
            localStorage.setItem(`cart_${user.uid}`, JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        if (user && wishlistItems.length >= 0) {
            localStorage.setItem(`wishlist_${user.uid}`, JSON.stringify(wishlistItems));
        }
    }, [wishlistItems, user]);

    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);

            if (existingItem) {
                toast.success('Quantity updated in cart!');
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                toast.success('Added to cart!');
                return [...prevItems, { ...product, quantity }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
        toast.success('Removed from cart!');
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        if (user) {
            localStorage.removeItem(`cart_${user.uid}`);
        }
    };

    const toggleWishlist = (product) => {
        setWishlistItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);

            if (existingItem) {
                toast.success('Removed from wishlist!');
                return prevItems.filter(item => item.id !== product.id);
            } else {
                toast.success('Added to wishlist!');
                return [...prevItems, product];
            }
        });
    };

    const isInCart = (productId) => {
        return cartItems.some(item => item.id === productId);
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getWishlistItemsCount = () => {
        return wishlistItems.length;
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getOrderDetails = () => {
        const subtotal = getCartTotal();
        const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over ₹1000
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + shipping + tax;

        return {
            subtotal,
            shipping,
            tax,
            total,
            itemsCount: getCartItemsCount()
        };
    };

    const value = {
        cartItems,
        wishlistItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInCart,
        isInWishlist,
        getCartItemsCount,
        getWishlistItemsCount,
        getCartTotal,
        getOrderDetails
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};