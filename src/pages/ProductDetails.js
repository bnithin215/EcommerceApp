import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Minus, Plus, Share2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';
import { formatCurrency, calculateDiscount, getImageUrl } from '../utils/helpers';
import { PageLoader } from '../components/common/Loader';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Check if product is in wishlist
    const isInWishlist = wishlistItems.some(item => item.id === id);

    // Load product details
    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);

                // For demo purposes, find product from mock data
                const response = await productAPI.getAllProducts();
                const foundProduct = response.products.find(p => p.id === id);

                if (foundProduct) {
                    setProduct(foundProduct);

                    // Load related products
                    const related = response.products
                        .filter(p => p.id !== id && p.category === foundProduct.category)
                        .slice(0, 4);
                    setRelatedProducts(related);
                } else {
                    // Product not found
                    toast.error('Product not found');
                    navigate('/products');
                }
            } catch (error) {
                console.error('Error loading product:', error);
                toast.error('Error loading product details');
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProduct();
        }
    }, [id, navigate]);

    // Handle add to cart
    const handleAddToCart = () => {
        if (!user) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        if (product.inStock <= 0) {
            toast.error('Product is out of stock');
            return;
        }

        addToCart(product, quantity);
    };

    // Handle wishlist toggle
    const handleWishlistToggle = () => {
        if (!user) {
            toast.error('Please login to add items to wishlist');
            navigate('/login');
            return;
        }

        if (isInWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    // Handle share
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success('Product URL copied to clipboard!');
        }
    };

    // Render rating stars
    const renderRating = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-5 w-5 ${
                        i <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                    }`}
                />
            );
        }
        return stars;
    };

    if (loading) {
        return <PageLoader message="Loading product details..." />;
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    const discount = calculateDiscount(product.originalPrice, product.price);
    const images = product.images || [product.image];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-1 hover:text-pink-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                    </button>
                    <span>/</span>
                    <span>Products</span>
                    <span>/</span>
                    <span className="text-gray-900">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                            <img
                                src={getImageUrl(images[selectedImage])}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 ${
                                            selectedImage === index
                                                ? 'border-pink-600'
                                                : 'border-gray-200'
                                        }`}
                                    >
                                        <img
                                            src={getImageUrl(image)}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Title and Category */}
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                                {product.category}
                            </p>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="flex">
                                    {renderRating(product.rating)}
                                </div>
                                <span className="text-sm text-gray-600">
                                    ({product.reviews} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-4">
                            <span className="text-3xl font-bold text-gray-900">
                                {formatCurrency(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <>
                                    <span className="text-xl text-gray-500 line-through">
                                        {formatCurrency(product.originalPrice)}
                                    </span>
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                                        {discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600">{product.description}</p>
                        </div>

                        {/* Product Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-gray-900">Fabric</h4>
                                <p className="text-gray-600">{product.fabric}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Care Instructions</h4>
                                <p className="text-gray-600">{product.care}</p>
                            </div>
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="text-gray-600">{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Available Colors</h3>
                                <div className="flex space-x-2">
                                    {product.colors.map((color, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                                        >
                                            {color}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock Status */}
                        <div>
                            {product.inStock > 0 ? (
                                <p className="text-green-600 font-medium">
                                    ✓ In Stock ({product.inStock} available)
                                </p>
                            ) : (
                                <p className="text-red-600 font-medium">
                                    ✗ Out of Stock
                                </p>
                            )}
                        </div>

                        {/* Quantity and Actions */}
                        <div className="space-y-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center space-x-4">
                                <span className="font-medium">Quantity:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 hover:bg-gray-100"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.inStock, quantity + 1))}
                                        className="p-2 hover:bg-gray-100"
                                        disabled={quantity >= product.inStock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.inStock <= 0}
                                    className="flex-1 bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    <span>{product.inStock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                                </button>

                                <button
                                    onClick={handleWishlistToggle}
                                    className={`p-3 rounded-lg border-2 transition-colors ${
                                        isInWishlist
                                            ? 'border-pink-600 bg-pink-50 text-pink-600'
                                            : 'border-gray-300 hover:border-pink-600 hover:text-pink-600'
                                    }`}
                                >
                                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="p-3 rounded-lg border-2 border-gray-300 hover:border-pink-600 hover:text-pink-600 transition-colors"
                                >
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;