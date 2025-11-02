// Updated ProductCard.js - Enhanced with better compatibility

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Play, MapPin, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, calculateDiscount, getImageUrl } from '../../utils/helpers';
import { APP_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';

const ProductCard = ({ product, className = "", variant = "default" }) => {
    const { addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useCart();
    const { user } = useAuth();
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Check if product is in wishlist
    const isInWishlist = wishlistItems.some(item => item.id === product.id);

    // Get discount percentage
    const discount = calculateDiscount(product.originalPrice, product.price);

    // Handle add to cart
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Please login to add items to cart');
            return;
        }

        if (product.inStock <= 0) {
            toast.error('Product is out of stock');
            return;
        }

        addToCart(product);
        toast.success('Added to cart successfully!');
    };

    // Handle wishlist toggle
    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Please login to add items to wishlist');
            return;
        }

        if (isInWishlist) {
            removeFromWishlist(product.id);
            toast.success('Removed from wishlist');
        } else {
            addToWishlist(product);
            toast.success('Added to wishlist');
        }
    };

    // Handle quick view
    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // You can implement a modal or navigate to product page
        window.location.href = `/products/${product.id}`;
    };

    // Handle image load
    const handleImageLoad = () => {
        setImageLoading(false);
    };

    // Handle image error
    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    // Get primary image
    const primaryImage = product.images?.[0] || product.image;
    const secondaryImage = product.images?.[1];
    const imageUrl = getImageUrl(primaryImage);

    // Render rating stars
    const renderRating = () => {
        const rating = product.rating || 0;
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-3 w-3 ${
                        i <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                    }`}
                />
            );
        }

        return stars;
    };

    // Get product features/tags
    const getProductTags = () => {
        const tags = [];
        if (product.fabric) tags.push(product.fabric);
        if (product.category) tags.push(product.category);
        if (product.featured) tags.push('Featured');
        return tags.slice(0, 2); // Show only first 2 tags
    };

    // Compact variant for mobile or list view
    if (variant === "compact") {
        return (
            <Link
                to={`/products/${product.id}`}
                className={`block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 ${className}`}
            >
                <div className="flex p-4">
                    {/* Image - Fixed dimensions */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                        {imageLoading && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                        )}
                        <img
                            src={imageError ? APP_CONFIG.defaultProductImage : imageUrl}
                            alt={product.name}
                            className={`w-full h-full object-cover rounded-lg ${
                                imageLoading ? 'opacity-0' : 'opacity-100'
                            } transition-opacity`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />

                        {/* Discount badge */}
                        {discount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                -{discount}%
                            </div>
                        )}

                        {/* Stock status */}
                        {product.inStock <= 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-medium">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 ml-4">
                        {/* Category/Tags */}
                        <div className="flex flex-wrap gap-1 mb-2">
                            {getProductTags().map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-block text-xs text-pink-600 bg-pink-50 px-2 py-1 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">
                            {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center space-x-1 mb-2">
                            <div className="flex space-x-0.5">
                                {renderRating()}
                            </div>
                            <span className="text-xs text-gray-500">
                                ({product.reviews || 0})
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-lg text-gray-900">
                                {formatCurrency(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                    {formatCurrency(product.originalPrice)}
                                </span>
                            )}
                        </div>

                        {/* Stock and features */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                {product.inStock > 0 ? (
                                    <>
                                        <span className="text-green-600 font-medium">In Stock</span>
                                        {product.inStock <= 5 && (
                                            <span className="text-orange-600">Only {product.inStock} left</span>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-red-600 font-medium">Out of Stock</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Truck className="h-3 w-3" />
                                <span>Free shipping</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                        <button
                            onClick={handleWishlistToggle}
                            className={`p-2 rounded-full transition-colors ${
                                isInWishlist
                                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                        >
                            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.inStock <= 0}
                            className="p-2 rounded-full bg-pink-600 text-white hover:bg-pink-700 disabled:bg-gray-300 transition-colors"
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    // Default card variant with enhanced design
    return (
        <div
            className={`group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 product-card ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container with fixed aspect ratio */}
            <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                {imageLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                )}

                <img
                    src={imageError ? APP_CONFIG.defaultProductImage : imageUrl}
                    alt={product.name}
                    className={`w-full h-full object-cover cursor-pointer ${
                        imageLoading ? 'opacity-0' : 'opacity-100'
                    } transition-all duration-300 group-hover:scale-105`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    onClick={() => window.location.href = `/products/${product.id}`}
                />

                {/* Secondary image on hover */}
                {secondaryImage && isHovered && !imageLoading && (
                    <img
                        src={getImageUrl(secondaryImage)}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => window.location.href = `/products/${product.id}`}
                    />
                )}

                {/* Overlay badges */}
                <div className="absolute top-3 left-3 space-y-2">
                    {discount > 0 && (
                        <span className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                            -{discount}% OFF
                        </span>
                    )}

                    {product.featured && (
                        <span className="block bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                            Featured
                        </span>
                    )}

                    {product.inStock <= 5 && product.inStock > 0 && (
                        <span className="block bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                            Only {product.inStock} left
                        </span>
                    )}

                    {product.inStock <= 0 && (
                        <span className="block bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={handleWishlistToggle}
                        className={`p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all ${
                            isInWishlist
                                ? 'text-red-500'
                                : 'text-gray-600 hover:text-red-500'
                        }`}
                    >
                        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                    </button>

                    <button
                        onClick={handleQuickView}
                        className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md text-gray-600 hover:text-pink-600 hover:bg-white transition-all"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                </div>

                {/* Quick add to cart button */}
                {isHovered && product.inStock > 0 && (
                    <button
                        onClick={handleAddToCart}
                        className="absolute bottom-3 left-3 right-3 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 font-medium text-sm"
                    >
                        Quick Add to Cart
                    </button>
                )}
            </div>

            {/* Product Details */}
            <div className="p-4">
                <Link to={`/products/${product.id}`} className="block">
                    {/* Category and Tags */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-wrap gap-1">
                            {getProductTags().map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-block text-xs text-pink-600 bg-pink-50 px-2 py-1 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        {product.colors && product.colors.length > 0 && (
                            <div className="flex space-x-1">
                                {product.colors.slice(0, 3).map((color, index) => (
                                    <div
                                        key={index}
                                        className="w-3 h-3 rounded-full border border-gray-200"
                                        style={{ backgroundColor: color.toLowerCase() }}
                                        title={color}
                                    />
                                ))}
                                {product.colors.length > 3 && (
                                    <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem] hover:text-pink-600 transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="flex space-x-0.5">
                            {renderRating()}
                        </div>
                        <span className="text-sm text-gray-500">
                            ({product.reviews || 0})
                        </span>
                        {product.rating >= 4.5 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Top Rated
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                    {formatCurrency(product.originalPrice)}
                                </span>
                            )}
                        </div>
                        {discount > 0 && (
                            <span className="text-sm font-medium text-green-600">
                                Save {formatCurrency(product.originalPrice - product.price)}
                            </span>
                        )}
                    </div>
                </Link>

                {/* Stock status and shipping */}
                <div className="flex items-center justify-between mb-3 text-sm">
                    <div>
                        {product.inStock > 0 ? (
                            <span className="text-green-600 font-medium flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                In Stock
                            </span>
                        ) : (
                            <span className="text-red-600 font-medium flex items-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                Out of Stock
                            </span>
                        )}
                    </div>
                    <div className="flex items-center text-gray-500">
                        <Truck className="h-3 w-3 mr-1" />
                        <span className="text-xs">Free shipping</span>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.inStock <= 0}
                    className="w-full bg-pink-600 text-white py-2.5 px-4 rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 font-medium"
                >
                    <ShoppingCart className="h-4 w-4" />
                    <span>
                        {product.inStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;