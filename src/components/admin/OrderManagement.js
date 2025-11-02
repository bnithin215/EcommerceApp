// src/components/admin/OrderManagement.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Eye,
    Package,
    Truck,
    CheckCircle,
    Clock,
    X,
    Filter,
    Search,
    Download,
    Printer
} from 'lucide-react';
import { orderAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: 'all',
        searchQuery: ''
    });

    const orderStatuses = {
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
        processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
        shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
        delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: X }
    };

    useEffect(() => {
        loadOrders();
    }, [filters]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const result = await orderAPI.getOrders(filters);
            setOrders(result.orders || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            // Mock data for development
            setOrders([
                {
                    id: '1',
                    orderNumber: 'ORD-001',
                    customer: {
                        name: 'Priya Sharma',
                        email: 'priya@email.com'
                    },
                    items: [
                        { name: 'Banarasi Silk Saree', quantity: 1 },
                        { name: 'Blouse Piece', quantity: 1 }
                    ],
                    total: 4500,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    orderNumber: 'ORD-002',
                    customer: {
                        name: 'Anita Desai',
                        email: 'anita@email.com'
                    },
                    items: [
                        { name: 'Designer Georgette Saree', quantity: 1 }
                    ],
                    total: 6200,
                    status: 'confirmed',
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await orderAPI.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            toast.success(`Order status updated to ${orderStatuses[newStatus].label}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

    const bulkUpdateStatus = async (newStatus) => {
        if (selectedOrders.length === 0) return;

        try {
            await Promise.all(
                selectedOrders.map(orderId => orderAPI.updateOrderStatus(orderId, newStatus))
            );

            setOrders(prev => prev.map(order =>
                selectedOrders.includes(order.id) ? { ...order, status: newStatus } : order
            ));

            setSelectedOrders([]);
            toast.success(`${selectedOrders.length} orders updated to ${orderStatuses[newStatus].label}`);
        } catch (error) {
            console.error('Error bulk updating orders:', error);
            toast.error('Failed to update orders');
        }
    };

    const exportOrders = async () => {
        try {
            const data = await orderAPI.exportOrders(filters);
            // Trigger download
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting orders:', error);
            toast.error('Failed to export orders');
        }
    };

    if (loading) {
        return <div className="animate-pulse">Loading orders...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-600">Manage and track all customer orders</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={exportOrders}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                    {selectedOrders.length > 0 && (
                        <div className="flex space-x-2">
                            <select
                                onChange={(e) => bulkUpdateStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Bulk Update Status</option>
                                {Object.entries(orderStatuses).map(([status, config]) => (
                                    <option key={status} value={status}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Orders
                        </label>
                        <div className="relative">
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Order ID, customer name..."
                                value={filters.searchQuery}
                                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="all">All Statuses</option>
                            {Object.entries(orderStatuses).map(([status, config]) => (
                                <option key={status} value={status}>{config.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date Range
                        </label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ status: 'all', dateRange: 'all', searchQuery: '' })}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.length === orders.length && orders.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedOrders(orders.map(order => order.id));
                                        } else {
                                            setSelectedOrders([]);
                                        }
                                    }}
                                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Products
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => {
                            const StatusIcon = orderStatuses[order.status]?.icon || Clock;

                            return (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedOrders(prev => [...prev, order.id]);
                                                } else {
                                                    setSelectedOrders(prev => prev.filter(id => id !== order.id));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.orderNumber}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.id}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.customer.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.customer.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.items.slice(0, 2).map(item => item.name).join(', ')}
                                            {order.items.length > 2 && `... +${order.items.length - 2} more`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(order.total)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <StatusIcon className="h-4 w-4" />
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${orderStatuses[order.status]?.color}`}
                                            >
                                                {Object.entries(orderStatuses).map(([status, config]) => (
                                                    <option key={status} value={status}>{config.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="text-pink-600 hover:text-pink-700"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => window.print()}
                                                className="text-gray-600 hover:text-gray-700"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600">
                            {filters.searchQuery || filters.status !== 'all' || filters.dateRange !== 'all'
                                ? 'Try adjusting your filters to see more orders.'
                                : 'Orders will appear here once customers start purchasing.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderManagement;