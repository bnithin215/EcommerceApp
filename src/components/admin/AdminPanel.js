// src/components/admin/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    BarChart3
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const AdminPanel = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            // Set mock data for development
            setStats({
                totalRevenue: 125000,
                totalOrders: 89,
                totalCustomers: 156,
                totalProducts: 45,
                pendingOrders: 12,
                lowStockProducts: 8,
                recentOrders: [
                    {
                        id: '1',
                        orderNumber: 'ORD-001',
                        customerName: 'Priya Sharma',
                        customerEmail: 'priya@email.com',
                        total: 4500,
                        status: 'pending',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        orderNumber: 'ORD-002',
                        customerName: 'Anita Desai',
                        customerEmail: 'anita@email.com',
                        total: 6200,
                        status: 'confirmed',
                        createdAt: new Date(Date.now() - 86400000).toISOString()
                    }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-300 h-24 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <ShoppingCart className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-orange-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                        <h3 className="font-medium text-yellow-800">Pending Orders</h3>
                    </div>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pendingOrders}</p>
                    <p className="text-sm text-yellow-700">Orders awaiting processing</p>
                </div>

                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <h3 className="font-medium text-red-800">Low Stock</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-900 mt-1">{stats.lowStockProducts}</p>
                    <p className="text-sm text-red-700">Products running low</p>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-medium text-green-800">Completed Today</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-1">12</p>
                    <p className="text-sm text-green-700">Orders completed today</p>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                        <Link
                            to="/admin/orders"
                            className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                        >
                            View All Orders
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
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
                        {stats.recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        #{order.orderNumber}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{order.customerName}</div>
                                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(order.total)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            order.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : order.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Link
                                        to={`/admin/orders/${order.id}`}
                                        className="text-pink-600 hover:text-pink-700"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link
                        to="/admin/products/new"
                        className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors"
                    >
                        <Package className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">Add Product</span>
                    </Link>

                    <Link
                        to="/admin/orders"
                        className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors"
                    >
                        <ShoppingCart className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">Process Orders</span>
                    </Link>

                    <Link
                        to="/admin/analytics"
                        className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors"
                    >
                        <BarChart3 className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">View Analytics</span>
                    </Link>

                    <Link
                        to="/admin/customers"
                        className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors"
                    >
                        <Users className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">Manage Customers</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;