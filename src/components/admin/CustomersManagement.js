// src/components/admin/CustomersManagement.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Download,
    Eye,
    Mail,
    Phone,
    Calendar,
    ShoppingBag
} from 'lucide-react';
import { customerAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CustomersManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchQuery: '',
        segment: 'all',
        status: 'all'
    });

    useEffect(() => {
        loadCustomers();
    }, [filters]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const result = await customerAPI.getCustomers(filters);
            setCustomers(result.customers || []);
        } catch (error) {
            console.error('Error loading customers:', error);
            // Mock data for development
            setCustomers([
                {
                    id: '1',
                    name: 'Priya Sharma',
                    email: 'priya@email.com',
                    phone: '+91 9876543210',
                    orderCount: 5,
                    totalSpent: 25000,
                    lastOrderDate: new Date(Date.now() - 86400000).toISOString(),
                    status: 'active',
                    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
                },
                {
                    id: '2',
                    name: 'Anita Desai',
                    email: 'anita@email.com',
                    phone: '+91 9876543211',
                    orderCount: 12,
                    totalSpent: 65000,
                    lastOrderDate: new Date().toISOString(),
                    status: 'active',
                    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
                },
                {
                    id: '3',
                    name: 'Meera Gupta',
                    email: 'meera@email.com',
                    phone: '+91 9876543212',
                    orderCount: 2,
                    totalSpent: 8500,
                    lastOrderDate: new Date(Date.now() - 86400000 * 15).toISOString(),
                    status: 'inactive',
                    createdAt: new Date(Date.now() - 86400000 * 90).toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const exportCustomers = async () => {
        try {
            const data = await customerAPI.exportCustomers(filters);
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting customers:', error);
            toast.error('Failed to export customers');
        }
    };

    if (loading) {
        return <div className="animate-pulse">Loading customers...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                    <p className="text-gray-600">Manage customer accounts and relationships</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={exportCustomers}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                    <button className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <ShoppingBag className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Customers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {customers.filter(c => c.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">New This Month</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {customers.filter(c => {
                                    const createdDate = new Date(c.createdAt);
                                    const now = new Date();
                                    return createdDate.getMonth() === now.getMonth() &&
                                        createdDate.getFullYear() === now.getFullYear();
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <Mail className="h-8 w-8 text-orange-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(
                                    customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length || 0
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Customers
                        </label>
                        <div className="relative">
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Name, email, phone..."
                                value={filters.searchQuery}
                                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Segment
                        </label>
                        <select
                            value={filters.segment}
                            onChange={(e) => setFilters(prev => ({ ...prev, segment: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="all">All Segments</option>
                            <option value="vip">VIP Customers</option>
                            <option value="regular">Regular Customers</option>
                            <option value="new">New Customers</option>
                            <option value="inactive">Inactive Customers</option>
                        </select>
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
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ searchQuery: '', segment: 'all', status: 'all' })}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Orders
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Spent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-pink-600">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {customer.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {customer.id}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="text-sm text-gray-900 flex items-center">
                                            <Mail className="h-4 w-4 mr-1" />
                                            {customer.email}
                                        </div>
                                        {customer.phone && (
                                            <div className="text-sm text-gray-500 flex items-center mt-1">
                                                <Phone className="h-4 w-4 mr-1" />
                                                {customer.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {customer.orderCount || 0} orders
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Last: {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatCurrency(customer.totalSpent || 0)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Avg: {formatCurrency((customer.totalSpent || 0) / (customer.orderCount || 1))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            customer.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : customer.status === 'inactive'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                            {customer.status}
                                        </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {formatDate(customer.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/admin/customers/${customer.id}`}
                                            className="text-pink-600 hover:text-pink-700"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => window.open(`mailto:${customer.email}`)}
                                            className="text-gray-600 hover:text-gray-700"
                                        >
                                            <Mail className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {customers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                        <p className="text-gray-600">
                            {filters.searchQuery || filters.segment !== 'all' || filters.status !== 'all'
                                ? 'Try adjusting your filters to see more customers.'
                                : 'Customers will appear here once they register and make purchases.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomersManagement;