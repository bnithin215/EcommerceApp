import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Menu,
    X,
    Search,
    ShoppingCart,
    Heart,
    User,
    Settings,
    Package,
    LogOut,
    MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { COMPANY_INFO, PRODUCT_CATEGORIES } from '../../utils/constants';

const Header = () => {
    const navigate = useNavigate();
    const { user, userProfile, logout } = useAuth();
    const { cartItems, wishlistItems, setIsCartOpen } = useCart();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false);
        }
    };

    // Handle category click
    const handleCategoryClick = (categorySlug) => {
        navigate(`/products?category=${categorySlug}`);
        setIsMobileMenuOpen(false);
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            setIsUserMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Bar */}
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <img
                                src={`${process.env.PUBLIC_URL}/img.png`}
                                alt="Srija Collections Logo"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">{COMPANY_INFO.name}</span>
                        </Link>
                    </div>



                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for sarees..."
                                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-300 bg-gray-50/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-600 transition-colors"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-4">
                        {/* Search Icon - Mobile */}
                        <button className="md:hidden text-gray-600 hover:text-pink-600">
                            <Search className="h-6 w-6" />
                        </button>

                        {/* Wishlist */}
                        {user && (
                            <Link
                                to="/wishlist"
                                className="relative p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                            >
                                <Heart className="h-5 w-5" />
                                {wishlistItems?.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Cart */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartItems?.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="hidden md:block text-sm font-medium">
                                        {userProfile?.firstName || user.displayName?.split(' ')[0] || 'User'}
                                    </span>
                                </button>

                                {/* User Dropdown */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {userProfile?.displayName || user.displayName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                                        >
                                            <Settings className="h-4 w-4 mr-3" />
                                            Profile Settings
                                        </Link>

                                        <Link
                                            to="/orders"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                                        >
                                            <Package className="h-4 w-4 mr-3" />
                                            My Orders
                                        </Link>

                                        {userProfile?.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                                            >
                                                <Settings className="h-4 w-4 mr-3" />
                                                Admin Panel
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                                        >
                                            <LogOut className="h-4 w-4 mr-3" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-pink-600 font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 transition-all shadow-sm hover:shadow"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden text-gray-600 hover:text-pink-600"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Navigation Categories - Desktop */}
                <div className="hidden md:flex items-center justify-center space-x-1 py-3 border-t border-gray-100">
                    {PRODUCT_CATEGORIES.slice(1).map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.slug)}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 font-medium rounded-lg transition-all"
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="space-y-4">
                            {/* Mobile Search */}
                            <form onSubmit={handleSearch} className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for sarees..."
                                        className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-300 bg-gray-50/50 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    >
                                        <Search className="h-5 w-5" />
                                    </button>
                                </div>
                            </form>

                            {/* Categories */}
                            <div>
                                <h3 className="font-medium text-gray-800 mb-2">Categories</h3>
                                <div className="space-y-2">
                                    {PRODUCT_CATEGORIES.slice(1).map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryClick(category.slug)}
                                            className="block text-gray-600 hover:text-pink-600 transition-colors"
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Auth Links */}
                            {!user && (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="space-y-2">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block w-full text-center px-4 py-2 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block w-full text-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                        >
                                            Register
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close dropdowns */}
            {(isUserMenuOpen || isMobileMenuOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsMobileMenuOpen(false);
                    }}
                />
            )}
        </header>
    );
};

export default Header;