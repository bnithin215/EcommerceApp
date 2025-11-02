import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';

const CartItem = ({ item, showImage = true, showControls = true, layout = 'horizontal' }) => {
    const { updateQuantity, removeFromCart, toggleWishlist, isInWishlist } = useCart();

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(item.id);
        } else {
            updateQuantity(item.id, newQuantity);
        }
    };

    const handleMoveToWishlist = () => {
        toggleWishlist(item);
        removeFromCart(item.id);
    };

    if (layout === 'vertical') {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {showImage && (
                    <div className="aspect-square">
                        <img
                            src={item.image || item.images?.[0] || '/images/placeholder.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-4">
                    <Link
                        to={`/products/${item.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors line-clamp-2"
                    >
                        {item.name}
                    </Link>

                    {item.category && (
                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                        <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(item.price)}
                        </div>

                        {item.originalPrice && item.originalPrice > item.price && (
                            <div className="text-sm text-gray-500 line-through">
                                {formatCurrency(item.originalPrice)}
                            </div>
                        )}
                    </div>

                    {showControls && (
                        <div className="mt-4 space-y-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Quantity:</span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleQuantityChange(item.quantity - 1)}
                                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(item.quantity + 1)}
                                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleMoveToWishlist}
                                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-pink-600 border border-gray-300 rounded-lg hover:border-pink-300 transition-colors"
                                >
                                    <Heart className="h-4 w-4" />
                                    <span>Wishlist</span>
                                </button>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:border-red-400 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Remove</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Horizontal layout (default)
    return (
        <div className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
            {showImage && (
                <div className="flex-shrink-0">
                    <Link to={`/products/${item.id}`}>
                        <img
                            src={item.image || item.images?.[0] || '/images/placeholder.jpg'}
                            alt={item.name}
                            className="h-20 w-20 object-cover rounded-lg hover:opacity-75 transition-opacity"
                        />
                    </Link>
                </div>
            )}

            <div className="flex-1 min-w-0">
                <Link
                    to={`/products/${item.id}`}
                    className="text-base font-medium text-gray-900 hover:text-pink-600 transition-colors block truncate"
                >
                    {item.name}
                </Link>

                {item.category && (
                    <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                )}

                <div className="flex items-center space-x-4 mt-2">
                    <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(item.price)}
                    </div>

                    {item.originalPrice && item.originalPrice > item.price && (
                        <div className="text-sm text-gray-500 line-through">
                            {formatCurrency(item.originalPrice)}
                        </div>
                    )}
                </div>

                {showControls && (
                    <div className="flex items-center space-x-4 mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Qty:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                    onClick={() => handleQuantityChange(item.quantity - 1)}
                                    className="p-1 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-l-lg"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-1 min-w-[40px] text-center font-medium">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => handleQuantityChange(item.quantity + 1)}
                                    className="p-1 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-r-lg"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <button
                                onClick={handleMoveToWishlist}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                                title="Move to Wishlist"
                            >
                                <Heart className={`h-4 w-4 ${isInWishlist(item.id) ? 'fill-current text-pink-600' : ''}`} />
                                <span className="hidden sm:inline">Wishlist</span>
                            </button>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                                title="Remove from Cart"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Remove</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end space-y-2">
                <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                </div>

                {item.quantity > 1 && (
                    <div className="text-sm text-gray-500">
                        {formatCurrency(item.price)} each
                    </div>
                )}

                {/* Stock Status */}
                {item.stock !== undefined && (
                    <div className="text-xs">
                        {item.stock > 10 ? (
                            <span className="text-green-600">In Stock</span>
                        ) : item.stock > 0 ? (
                            <span className="text-yellow-600">Only {item.stock} left</span>
                        ) : (
                            <span className="text-red-600">Out of Stock</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartItem;