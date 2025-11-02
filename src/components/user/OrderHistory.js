// src/components/user/OrderHistory.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingBag,
    Calendar,
    Package,
    Truck,
    CheckCircle,
    Clock,
    Eye,
    Download,
    RefreshCw,
    Star,
    MessageCircle,
    RotateCcw,
    Search,
    Filter,
    ArrowLeft,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orderAPI } from '../../services/api';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const OrderHistory = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    const orderStatuses = {
        pending: {
            label: 'Pending',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: Clock,
            description: 'Your order is being processed'
        },
        confirmed: {
            label: 'Confirmed',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: CheckCircle,
            description: 'Your order has been confirmed'
        },
        processing: {
            label: 'Processing',
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: Package,
            description: 'Your order is being prepared for shipment'
        },
        shipped: {
            label: 'Shipped',
            color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            icon: Truck,
            description: 'Your order is on its way'
        },
        delivered: {
            label: 'Delivered',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: CheckCircle,
            description: 'Your order has been delivered'
        },
        cancelled: {
            label: 'Cancelled',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: RefreshCw,
            description: 'Your order has been cancelled'
        }
    };

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const result = await orderAPI.getUserOrders(user.uid);
            setOrders(result.orders || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            // Mock data for development
            setOrders([
                {
                    id: '1',
                    orderNumber: 'ORD-001',
                    items: [
                        {
                            id: '1',
                            name: 'Banarasi Silk Saree - Golden Elegance',
                            image: 'https://images.unsplash.com/photo-1610030469978-6bb537f3b982?w=100&h=100&fit=crop',
                            price: 4500,
                            quantity: 1,
                            variant: 'Golden with Red Border'
                        }
                    ],
                    total: 4600,
                    subtotal: 4500,
                    shipping: 100,
                    tax: 0,
                    status: 'delivered',
                    paymentStatus: 'paid',
                    paymentMethod: 'Razorpay',
                    shippingAddress: {
                        name: 'Priya Sharma',
                        address: '123 Main Street, Apartment 4B',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        zipCode: '400001',
                        phone: '+91 9876543210'
                    },
                    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
                    estimatedDelivery: new Date(Date.now() - 86400000 * 2).toISOString(),
                    deliveredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                    trackingNumber: 'TRK123456789'
                },
                {
                    id: '2',
                    orderNumber: 'ORD-002',
                    items: [
                        {
                            id: '2',
                            name: 'Designer Georgette Saree',
                            image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100&h=100&fit=crop',
                            price: 6200,
                            quantity: 1,
                            variant: 'Navy Blue with Gold Work'
                        },
                        {
                            id: '3',
                            name: 'Matching Blouse Piece',
                            image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop',
                            price: 800,
                            quantity: 1,
                            variant: 'Stitched - Size M'
                        }
                    ],
                    total: 7000,
                    subtotal: 7000,
                    shipping: 0,
                    tax: 0,
                    status: 'shipped',
                    paymentStatus: 'paid',
                    paymentMethod: 'UPI',
                    shippingAddress: {
                        name: 'Priya Sharma',
                        address: '123 Main Street, Apartment 4B',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        zipCode: '400001',
                        phone: '+91 9876543210'
                    },
                    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                    estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
                    trackingNumber: 'TRK987654321'
                },
                {
                    id: '3',
                    orderNumber: 'ORD-003',
                    items: [
                        {
                            id: '4',
                            name: 'Cotton Handloom Saree',
                            image: 'https://images.unsplash.com/photo-1596706487679-9f95f5891975?w=100&h=100&fit=crop',
                            price: 1800,
                            quantity: 2,
                            variant: 'Multicolor'
                        }
                    ],
                    total: 3700,
                    subtotal: 3600,
                    shipping: 100,
                    tax: 0,
                    status: 'processing',
                    paymentStatus: 'paid',
                    paymentMethod: 'COD',
                    shippingAddress: {
                        name: 'Priya Sharma',
                        address: '123 Main Street, Apartment 4B',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        zipCode: '400001',
                        phone: '+91 9876543210'
                    },
                    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                    estimatedDelivery: new Date(Date.now() + 86400000 * 5).toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = !searchQuery ||
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    const reorderItems = async (order) => {
        try {
            for (const item of order.items) {
                await addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: item.quantity
                });
            }
            toast.success(`${order.items.length} item(s) added to cart`);
        } catch (error) {
            console.error('Error reordering:', error);
            toast.error('Failed to add items to cart');
        }
    };

    const downloadInvoice = (order) => {
        // Mock download - in real app, this would download a PDF
        toast.success('Invoice download started');
    };

    const trackOrder = (order) => {
        if (order.trackingNumber) {
            // In real app, this would open tracking page
            toast.info(`Tracking: ${order.trackingNumber}`);
        } else {
            toast.info('Tracking information not available yet');
        }
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
    };

    const OrderDetailsModal = ({ order, onClose }) => {
        if (!order) return null;

        const statusInfo = orderStatuses[order.status];
        const StatusIcon = statusInfo.icon;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                            <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Order Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-full ${statusInfo.color.split(' ')[0]}`}>
                                    <StatusIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{statusInfo.label}</h3>
                                    <p className="text-sm text-gray-600">{statusInfo.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Order Date</p>
                                <p className="font-medium">{formatDate(order.createdAt)}</p>
                            </div>
                        </div>

                        {/* Tracking Info */}
                        {order.trackingNumber && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-blue-900">Tracking Number</p>
                                        <p className="text-blue-700">{order.trackingNumber}</p>
                                    </div>
                                    <button
                                        onClick={() => trackOrder(order)}
                                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        Track
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Items */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                        <div className="h-16 w-16 flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-16 w-16 rounded-lg object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                                            {item.variant && (
                                                <p className="text-sm text-gray-600">Variant: {item.variant}</p>
                                            )}
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {formatCurrency(item.price)} each
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">
                                        {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}
                                    </span>
                                </div>
                                {order.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-medium">{formatCurrency(order.tax)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Shipping Address</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium">{order.shippingAddress.name}</p>
                                <p className="text-gray-600">{order.shippingAddress.address}</p>
                                <p className="text-gray-600">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                </p>
                                <p className="text-gray-600">{order.shippingAddress.phone}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Payment Information</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">Payment Method</p>
                                        <p className="text-gray-600">{order.paymentMethod}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">Payment Status</p>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            order.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => downloadInvoice(order)}
                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Invoice
                            </button>

                            {order.status === 'delivered' && (
                                <>
                                    <button
                                        onClick={() => reorderItems(order)}
                                        className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reorder
                                    </button>
                                    <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                        <Star className="h-4 w-4 mr-2" />
                                        Write Review
                                    </button>
                                </>
                            )}

                            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <ShoppingBag className="h-7 w-7 text-pink-600 mr-3" />
                        Order History
                    </h1>
                    <p className="text-gray-600 mt-1">Track and manage your orders</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'pending', label: 'Pending' },
                                { key: 'processing', label: 'Processing' },
                                { key: 'shipped', label: 'Shipped' },
                                { key: 'delivered', label: 'Delivered' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        filter === tab.key
                                            ? 'bg-white text-pink-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                {filter === 'all'
                                    ? "You haven't placed any orders yet. Start shopping to see your orders here."
                                    : `You don't have any ${filter} orders at the moment.`
                                }
                            </p>
                            <Link
                                to="/products"
                                className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const statusInfo = orderStatuses[order.status];
                            const StatusIcon = statusInfo?.icon || Clock;

                            return (
                                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Order Header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                                        Order #{order.orderNumber}
                                                        <span className={`ml-3 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${statusInfo?.color}`}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusInfo?.label}
                                                        </span>
                                                    </h3>
                                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        Placed {formatRelativeTime(order.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end space-x-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(order.total)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => viewOrderDetails(order)}
                                                    className="flex items-center px-3 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="px-6 py-4">
                                        <div className="space-y-3">
                                            {order.items.slice(0, 2).map((item, index) => (
                                                <div key={index} className="flex items-center space-x-4">
                                                    <div className="h-12 w-12 flex-shrink-0">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            Qty: {item.quantity} × {formatCurrency(item.price)}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </div>
                                                </div>
                                            ))}

                                            {order.items.length > 2 && (
                                                <p className="text-sm text-gray-500 text-center py-2">
                                                    ... and {order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status Progress */}
                                        {(order.status === 'shipped' || order.status === 'delivered') && (
                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-900">
                                                            {order.status === 'shipped' ? 'Package shipped!' : 'Order delivered!'}
                                                        </p>
                                                        <p className="text-sm text-blue-700">
                                                            {order.status === 'shipped'
                                                                ? `Expected delivery: ${formatDate(order.estimatedDelivery)}`
                                                                : `Delivered on ${formatDate(order.deliveredAt)}`
                                                            }
                                                        </p>
                                                    </div>
                                                    {order.trackingNumber && (
                                                        <button
                                                            onClick={() => trackOrder(order)}
                                                            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                        >
                                                            <Truck className="h-4 w-4 mr-1" />
                                                            Track Package
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button
                                                onClick={() => downloadInvoice(order)}
                                                className="flex items-center text-sm text-gray-600 hover:text-gray-700 font-medium"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Invoice
                                            </button>

                                            {order.status === 'delivered' && (
                                                <>
                                                    <button
                                                        onClick={() => reorderItems(order)}
                                                        className="flex items-center text-sm text-pink-600 hover:text-pink-700 font-medium"
                                                    >
                                                        <RotateCcw className="h-4 w-4 mr-1" />
                                                        Reorder
                                                    </button>
                                                    <button className="flex items-center text-sm text-gray-600 hover:text-gray-700 font-medium">
                                                        <Star className="h-4 w-4 mr-1" />
                                                        Write Review
                                                    </button>
                                                </>
                                            )}

                                            <button className="flex items-center text-sm text-gray-600 hover:text-gray-700 font-medium">
                                                <MessageCircle className="h-4 w-4 mr-1" />
                                                Support
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Load More Button */}
                {filteredOrders.length > 0 && filteredOrders.length >= 10 && (
                    <div className="text-center mt-8">
                        <button className="flex items-center mx-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Load More Orders
                        </button>
                    </div>
                )}

                {/* Order Details Modal */}
                {showOrderDetails && (
                    <OrderDetailsModal
                        order={selectedOrder}
                        onClose={() => {
                            setShowOrderDetails(false);
                            setSelectedOrder(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default OrderHistory;