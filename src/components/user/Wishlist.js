// src/components/user/Wishlist.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Heart,
    ShoppingCart,
    Trash2,
    Star,
    Plus,
    List,
    LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { wishlistAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        loadWishlist();
    }, [user]);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const result = await wishlistAPI.getUserWishlist(user.uid);
            setWishlistItems(result.items || []);
        } catch (error) {
            console.error('Error loading wishlist:', error);
            // Mock data for development
            setWishlistItems([
                {
                    id: '1',
                    name: 'Banarasi Silk Saree',
                    price: 4500,
                    originalPrice: 5500,
                    image: 'https://images.unsplash.com/photo-1610030469978-6bb537f3b982?w=400&h=400&fit=crop',
                    rating: 4.5,
                    reviews: 128,
                    inStock: true,
                    category: 'silk',
                    addedAt: new Date(Date.now() - 86400000 * 3).toISOString()
                },
                {
                    id: '2',
                    name: 'Designer Georgette Saree',
                    price: 6200,
                    originalPrice: 7200,
                    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=400&fit=crop',
                    rating: 4.8,
                    reviews: 92,
                    inStock: true,
                    category: 'designer',
                    addedAt: new Date(Date.now() - 86400000 * 7).toISOString()
                },
                {
                    id: '3',
                    name: 'Cotton Handloom Saree',
                    price: 1800,
                    originalPrice: 2200,
                    image: 'https://images.unsplash.com/photo-1596706487679-9f95f5891975?w=400&h=400&fit=crop',
                    rating: 4.2,
                    reviews: 67,
                    inStock: false,
                    category: 'cotton',
                    addedAt: new Date(Date.now() - 86400000 * 14).toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await wishlistAPI.removeFromWishlist(user.uid, productId);
            setWishlistItems(prev => prev.filter(item => item.id !== productId));
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove from wishlist');
        }
    };

    const handleAddToCart = async (item) => {
        try {
            await addToCart(item);
            toast.success('Added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
        }
    };

    const clearWishlist = async () => {
        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            try {
                await wishlistAPI.clearWishlist(user.uid);
                setWishlistItems([]);
                toast.success('Wishlist cleared');
            } catch (error) {
                console.error('Error clearing wishlist:', error);
                toast.error('Failed to clear wishlist');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-80 bg-gray-300 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Heart className="h-7 w-7 text-pink-600 mr-2 fill-current" />
                            My Wishlist
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-white rounded-lg border border-gray-200">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                            >
                                <LayoutGrid className="h-4 w-4" />

                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>

                        {wishlistItems.length > 0 && (
                            <button
                                onClick={clearWishlist}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Wishlist Content */}
                {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Save your favorite sarees here to easily find them later.
                            Start browsing and add items you love!
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className={`${
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            : 'space-y-4'
                    }`}>
                        {wishlistItems.map((item) => (
                            viewMode === 'grid' ? (
                                // Grid View
                                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="relative">
                                        <Link to={`/product/${item.id}`}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </Link>

                                        {!item.inStock && (
                                            <div className="absolute top-2 left-2">
                                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <Link to={`/product/${item.id}`}>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-pink-600 transition-colors">
                                                {item.name}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center mb-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${
                                                            i < Math.floor(item.rating)
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-600 ml-2">
                                                ({item.reviews} reviews)
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl font-bold text-gray-900">
                                                    {formatCurrency(item.price)}
                                                </span>
                                                {item.originalPrice > item.price && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatCurrency(item.originalPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!item.inStock}
                                            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                                                item.inStock
                                                    ? 'bg-pink-600 text-white hover:bg-pink-700'
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // List View
                                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="relative">
                                            <Link to={`/product/${item.id}`}>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-24 h-24 object-cover rounded-lg"
                                                />
                                            </Link>
                                            {!item.inStock && (
                                                <div className="absolute -top-2 -right-2">
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <Link to={`/product/${item.id}`}>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1 hover:text-pink-600 transition-colors">
                                                    {item.name}
                                                </h3>
                                            </Link>

                                            <div className="flex items-center mb-2">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < Math.floor(item.rating)
                                                                    ? 'text-yellow-400 fill-current'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-600 ml-2">
                                                    ({item.reviews} reviews)
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl font-bold text-gray-900">
                                                    {formatCurrency(item.price)}
                                                </span>
                                                {item.originalPrice > item.price && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatCurrency(item.originalPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={!item.inStock}
                                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                                    item.inStock
                                                        ? 'bg-pink-600 text-white hover:bg-pink-700'
                                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                                            </button>

                                            <button
                                                onClick={() => removeFromWishlist(item.id)}
                                                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
