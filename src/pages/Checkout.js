import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard,
    MapPin,
    ShoppingBag,
    Check,
    Edit,
    Plus,
    Trash2,
    Shield
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import paymentService from '../services/payment';
import { formatCurrency, calculateOrderTotal, validateEmail, validatePhone } from '../utils/helpers';
import { ButtonLoader, LoadingOverlay } from '../components/common/Loader';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart, getOrderDetails } = useCart();
    const { user, userProfile } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Form states
    const [shippingAddress, setShippingAddress] = useState({
        fullName: userProfile?.displayName || '',
        email: user?.email || '',
        phone: userProfile?.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
    });

    const [billingAddress, setBillingAddress] = useState({});
    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [errors, setErrors] = useState({});

    // Order details
    const orderDetails = getOrderDetails();
    const shipping = orderDetails.subtotal >= 999 ? 0 : 99;
    const tax = Math.round(orderDetails.subtotal * 0.02); // 2% tax
    const finalTotal = orderDetails.subtotal + shipping + tax;

    // Redirect if cart is empty
    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            navigate('/cart');
            return;
        }
    }, [cartItems, navigate]);

    // Redirect if user is not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
            return;
        }
    }, [user, navigate]);

    // Handle input change
    const handleInputChange = (e, addressType = 'shipping') => {
        const { name, value } = e.target;

        if (addressType === 'shipping') {
            setShippingAddress(prev => ({ ...prev, [name]: value }));
        } else {
            setBillingAddress(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[`${addressType}.${name}`]) {
            setErrors(prev => ({
                ...prev,
                [`${addressType}.${name}`]: ''
            }));
        }
    };

    // Validate address
    const validateAddress = (address, type = 'shipping') => {
        const newErrors = {};
        const prefix = `${type}.`;

        if (!address.fullName?.trim()) {
            newErrors[`${prefix}fullName`] = 'Full name is required';
        }

        if (!address.email?.trim()) {
            newErrors[`${prefix}email`] = 'Email is required';
        } else if (!validateEmail(address.email)) {
            newErrors[`${prefix}email`] = 'Please enter a valid email';
        }

        if (!address.phone?.trim()) {
            newErrors[`${prefix}phone`] = 'Phone number is required';
        } else if (!validatePhone(address.phone)) {
            newErrors[`${prefix}phone`] = 'Please enter a valid phone number';
        }

        if (!address.address?.trim()) {
            newErrors[`${prefix}address`] = 'Address is required';
        }

        if (!address.city?.trim()) {
            newErrors[`${prefix}city`] = 'City is required';
        }

        if (!address.state?.trim()) {
            newErrors[`${prefix}state`] = 'State is required';
        }

        if (!address.pincode?.trim()) {
            newErrors[`${prefix}pincode`] = 'Pincode is required';
        } else if (!/^\d{6}$/.test(address.pincode)) {
            newErrors[`${prefix}pincode`] = 'Please enter a valid 6-digit pincode';
        }

        return newErrors;
    };

    // Handle step navigation
    const handleNextStep = () => {
        if (currentStep === 1) {
            // Validate shipping address
            const shippingErrors = validateAddress(shippingAddress, 'shipping');
            let billingErrors = {};

            if (!sameAsShipping) {
                billingErrors = validateAddress(billingAddress, 'billing');
            }

            const allErrors = { ...shippingErrors, ...billingErrors };

            if (Object.keys(allErrors).length > 0) {
                setErrors(allErrors);
                return;
            }

            setErrors({});
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(3);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle payment
    const handlePayment = async () => {
        try {
            setProcessingPayment(true);

            const orderData = {
                items: cartItems,
                subtotal: orderDetails.subtotal,
                shipping: shipping,
                tax: tax,
                total: finalTotal,
                shippingAddress,
                billingAddress: sameAsShipping ? shippingAddress : billingAddress,
                customerDetails: {
                    id: user.uid,
                    name: shippingAddress.fullName,
                    email: shippingAddress.email,
                    phone: shippingAddress.phone
                }
            };

            const result = await paymentService.processPayment(orderData, orderData.customerDetails);

            if (result.success) {
                toast.success('Payment successful! Order placed.');
                clearCart();
                navigate('/orders', { replace: true });
            } else {
                toast.error(result.error || 'Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment failed. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };

    // If cart is empty, don't render
    if (!cartItems || cartItems.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

                    {/* Progress Steps */}
                    <div className="mt-6">
                        <div className="flex items-center">
                            {[1, 2, 3].map((step) => (
                                <React.Fragment key={step}>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                        step <= currentStep
                                            ? 'bg-pink-600 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                    }`}>
                                        {step < currentStep ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    {step < 3 && (
                                        <div className={`flex-1 h-1 mx-4 ${
                                            step < currentStep ? 'bg-pink-600' : 'bg-gray-300'
                                        }`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-sm font-medium text-gray-600">Shipping</span>
                            <span className="text-sm font-medium text-gray-600">Review</span>
                            <span className="text-sm font-medium text-gray-600">Payment</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {/* Step 1: Shipping Address */}
                            {currentStep === 1 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Shipping Address
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={shippingAddress.fullName}
                                                    onChange={(e) => handleInputChange(e, 'shipping')}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                                        errors['shipping.fullName'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Enter your full name"
                                                />
                                                {errors['shipping.fullName'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['shipping.fullName']}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={shippingAddress.email}
                                                    onChange={(e) => handleInputChange(e, 'shipping')}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                                        errors['shipping.email'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Enter your email"
                                                />
                                                {errors['shipping.email'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['shipping.email']}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={shippingAddress.phone}
                                                onChange={(e) => handleInputChange(e, 'shipping')}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                                    errors['shipping.phone'] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="Enter your phone number"
                                            />
                                            {errors['shipping.phone'] && (
                                                <p className="mt-1 text-sm text-red-600">{errors['shipping.phone']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address *
                                            </label>
                                            <textarea
                                                name="address"
                                                rows={3}
                                                value={shippingAddress.address}
                                                onChange={(e) => handleInputChange(e, 'shipping')}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                                    errors['shipping.address'] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="Enter your complete address"
                                            />
                                            {errors['shipping.address'] && (
                                                <p className="mt-1 text-sm text-red-600">{errors['shipping.address']}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={shippingAddress.city}
                                                    onChange={(e) => handleInputChange(e, 'shipping')}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                                        errors['shipping.city'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="City"
                                                />
                                                {errors['shipping.city'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['shipping.city']}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    State *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={shippingAddress.state}
                                                    onChange={(e) => handleInputChange(e, 'shipping')}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                                        errors['shipping.state'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="State"
                                                />
                                                {errors['shipping.state'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['shipping.state']}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Pincode *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={shippingAddress.pincode}
                                                    onChange={(e) => handleInputChange(e, 'shipping')}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                                        errors['shipping.pincode'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="Pincode"
                                                />
                                                {errors['shipping.pincode'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['shipping.pincode']}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Landmark (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="landmark"
                                                value={shippingAddress.landmark}
                                                onChange={(e) => handleInputChange(e, 'shipping')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="Nearby landmark"
                                            />
                                        </div>

                                        {/* Billing Address Checkbox */}
                                        <div className="flex items-center">
                                            <input
                                                id="sameAsShipping"
                                                type="checkbox"
                                                checked={sameAsShipping}
                                                onChange={(e) => setSameAsShipping(e.target.checked)}
                                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="sameAsShipping" className="ml-2 block text-sm text-gray-700">
                                                Billing address is same as shipping address
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Review Order */}
                            {currentStep === 2 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                                        <ShoppingBag className="h-5 w-5 mr-2" />
                                        Review Your Order
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Order Items */}
                                        <div className="space-y-4">
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                                    <img
                                                        src={item.images?.[0] || item.image || '/images/no-image-placeholder.jpg'}
                                                        alt={item.name}
                                                        className="h-16 w-16 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {formatCurrency(item.price)} each
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping Address Review */}
                                        <div className="border-t pt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-gray-900">Shipping Address</h3>
                                                <button
                                                    onClick={() => setCurrentStep(1)}
                                                    className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center"
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </button>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <p>{shippingAddress.fullName}</p>
                                                <p>{shippingAddress.address}</p>
                                                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                                                <p>{shippingAddress.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Payment */}
                            {currentStep === 3 && (
                                <div className="relative">
                                    {processingPayment && (
                                        <LoadingOverlay message="Processing payment..." />
                                    )}

                                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        Payment
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Payment Method */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center justify-center w-12 h-8 bg-blue-600 rounded">
                                                    <span className="text-white text-xs font-bold">RAZORPAY</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Razorpay Secure Payment</p>
                                                    <p className="text-xs text-gray-600">
                                                        Supports UPI, Cards, Net Banking, and Wallets
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security Notice */}
                                        <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                                            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-800">Secure Payment</p>
                                                <p className="text-xs text-green-700">
                                                    Your payment information is encrypted and secure. We don't store your card details.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Place Order Button */}
                                        <button
                                            onClick={handlePayment}
                                            disabled={processingPayment}
                                            className="w-full bg-pink-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                        >
                                            {processingPayment ? (
                                                <>
                                                    <ButtonLoader className="mr-2" />
                                                    Processing Payment...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="mr-2 h-5 w-5" />
                                                    Pay {formatCurrency(finalTotal)}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t">
                                <button
                                    onClick={handlePrevStep}
                                    disabled={currentStep === 1}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>

                                {currentStep < 3 && (
                                    <button
                                        onClick={handleNextStep}
                                        className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                    >
                                        Continue
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>{formatCurrency(orderDetails.subtotal)}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span>Shipping</span>
                                    <span>
                                        {shipping === 0 ? (
                                            <span className="text-green-600">Free</span>
                                        ) : (
                                            formatCurrency(shipping)
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span>Tax</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(finalTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Free shipping notice */}
                            {shipping > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        Add {formatCurrency(999 - orderDetails.subtotal)} more for free shipping!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;