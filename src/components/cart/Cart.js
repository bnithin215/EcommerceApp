import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, Gift } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';

const Cart = () => {
    const {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        updateQuantity,
        removeFromCart,
        getOrderDetails
    } = useCart();

    const orderDetails = getOrderDetails();

    const CartItem = ({ item }) => {
        return (
            <div className="flex items-center space-x-3 py-4 border-b border-gray-200">
                <div className="flex-shrink-0">
                    <img
                        src={item.image || item.images?.[0] || '/images/placeholder.jpg'}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-lg"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-2">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium px-2">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    if (!isCartOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Cart Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <ShoppingBag className="h-5 w-5 mr-2" />
                            Shopping Cart ({orderDetails.itemsCount})
                        </h2>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Your cart is empty
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Add some beautiful sarees to get started!
                                </p>
                                <Link
                                    to="/products"
                                    onClick={() => setIsCartOpen(false)}
                                    className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        ) : (
                            <div className="p-4">
                                {cartItems.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Summary & Actions */}
                    {cartItems.length > 0 && (
                        <>
                            <div className="border-t border-gray-200 p-4 space-y-4">
                                {/* Order Summary */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900">{formatCurrency(orderDetails.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="text-gray-900">
                                            {orderDetails.shipping === 0 ? 'Free' : formatCurrency(orderDetails.shipping)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (GST)</span>
                                        <span className="text-gray-900">{formatCurrency(orderDetails.tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                                        <span>Total</span>
                                        <span>{formatCurrency(orderDetails.total)}</span>
                                    </div>
                                </div>

                                {/* Free Shipping Progress */}
                                {orderDetails.shipping > 0 && orderDetails.subtotal < 1000 && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <div className="flex items-center space-x-2 text-sm text-blue-800 mb-2">
                                            <Gift className="h-4 w-4" />
                                            <span>
                                                Add {formatCurrency(1000 - orderDetails.subtotal)} more for free shipping!
                                            </span>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${(orderDetails.subtotal / 1000) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Link
                                        to="/checkout"
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-700 transition-colors text-center block"
                                    >
                                        Proceed to Checkout
                                    </Link>

                                    <Link
                                        to="/products"
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>

                                {/* Security Badge */}
                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Secure checkout guaranteed</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;