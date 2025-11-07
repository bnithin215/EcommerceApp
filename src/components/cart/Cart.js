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
            <div className="flex items-center space-x-4 py-5 border-b border-gray-100">
                <div className="flex-shrink-0">
                    <img
                        src={item.image || item.images?.[0] || '/images/placeholder.jpg'}
                        alt={item.name}
                        className="h-20 w-20 object-cover rounded-xl"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {item.name}
                    </h4>
                    <p className="text-sm font-medium text-pink-600 mb-3">
                        {formatCurrency(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-semibold px-3 py-1 bg-gray-50 rounded-lg min-w-[2rem] text-center">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-end space-y-3">
                    <p className="text-base font-bold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all"
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
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <ShoppingBag className="h-5 w-5 mr-2.5" />
                            Shopping Cart ({orderDetails.itemsCount})
                        </h2>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <ShoppingBag className="h-20 w-20 text-gray-300 mb-5" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Your cart is empty
                                </h3>
                                <p className="text-gray-500 mb-8 max-w-xs">
                                    Add some beautiful sarees to get started!
                                </p>
                                <Link
                                    to="/products"
                                    onClick={() => setIsCartOpen(false)}
                                    className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all shadow-sm hover:shadow font-medium"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        ) : (
                            <div className="p-5">
                                {cartItems.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Summary & Actions */}
                    {cartItems.length > 0 && (
                        <>
                            <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/50">
                                {/* Order Summary */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900 font-medium">{formatCurrency(orderDetails.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="text-gray-900 font-medium">
                                            {orderDetails.shipping === 0 ? 'Free' : formatCurrency(orderDetails.shipping)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (GST)</span>
                                        <span className="text-gray-900 font-medium">{formatCurrency(orderDetails.tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-gray-900">{formatCurrency(orderDetails.total)}</span>
                                    </div>
                                </div>

                                {/* Free Shipping Progress */}
                                {orderDetails.shipping > 0 && orderDetails.subtotal < 1000 && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="flex items-center space-x-2 text-sm text-blue-800 mb-3 font-medium">
                                            <Gift className="h-4 w-4" />
                                            <span>
                                                Add {formatCurrency(1000 - orderDetails.subtotal)} more for free shipping!
                                            </span>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${(orderDetails.subtotal / 1000) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-2">
                                    <Link
                                        to="/checkout"
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full bg-pink-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-pink-700 transition-all text-center block shadow-sm hover:shadow"
                                    >
                                        Proceed to Checkout
                                    </Link>

                                    <Link
                                        to="/products"
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full bg-gray-100 text-gray-800 py-3.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all text-center block"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>

                                {/* Security Badge */}
                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-3">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">Secure checkout guaranteed</span>
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