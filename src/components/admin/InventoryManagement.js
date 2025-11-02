// src/components/admin/InventoryManagement.js
import React, { useState, useEffect } from 'react';
import {
    Package,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Plus,
    Download,
    Search,
    Filter
} from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import { formatNumber } from '../../utils/helpers';
import toast from 'react-hot-toast';

const InventoryManagement = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchQuery: '',
        category: 'all',
        stockStatus: 'all'
    });
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        loadInventory();
    }, [filters]);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const result = await inventoryAPI.getInventory(filters);
            setInventory(result.items || []);
        } catch (error) {
            console.error('Error loading inventory:', error);
            // Mock data for development
            setInventory([
                {
                    id: '1',
                    name: 'Banarasi Silk Saree',
                    sku: 'BSS-001',
                    category: 'silk',
                    stock: 25,
                    lowStockThreshold: 10,
                    image: 'https://images.unsplash.com/photo-1610030469978-6bb537f3b982?w=100&h=100&fit=crop'
                },
                {
                    id: '2',
                    name: 'Designer Georgette Saree',
                    sku: 'DGS-002',
                    category: 'designer',
                    stock: 5,
                    lowStockThreshold: 10,
                    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100&h=100&fit=crop'
                },
                {
                    id: '3',
                    name: 'Cotton Handloom Saree',
                    sku: 'CHS-003',
                    category: 'cotton',
                    stock: 0,
                    lowStockThreshold: 5,
                    image: 'https://images.unsplash.com/photo-1596706487679-9f95f5891975?w=100&h=100&fit=crop'
                },
                {
                    id: '4',
                    name: 'Wedding Collection Saree',
                    sku: 'WCS-004',
                    category: 'wedding',
                    stock: 35,
                    lowStockThreshold: 15,
                    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&h=100&fit=crop'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const updateStock = async (productId, newStock) => {
        try {
            await inventoryAPI.updateStock(productId, newStock);
            setInventory(prev => prev.map(item =>
                item.id === productId ? { ...item, stock: newStock } : item
            ));
            toast.success('Stock updated successfully');
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Failed to update stock');
        }
    };

    const bulkStockUpdate = async (updates) => {
        try {
            await inventoryAPI.bulkUpdateStock(updates);
            loadInventory();
            toast.success('Bulk stock update completed');
        } catch (error) {
            console.error('Error in bulk update:', error);
            toast.error('Failed to update stock');
        }
    };

    const getStockStatus = (item) => {
        if (item.stock <= 0) return { status: 'out-of-stock', color: 'text-red-600', bg: 'bg-red-100' };
        if (item.stock <= item.lowStockThreshold) return { status: 'low-stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { status: 'in-stock', color: 'text-green-600', bg: 'bg-green-100' };
    };

    if (loading) {
        return <div className="animate-pulse">Loading inventory...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-600">Track and manage product stock levels</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                    <button className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stock
                    </button>
                </div>
            </div>

            {/* Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">In Stock</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {inventory.filter(item => item.stock > item.lowStockThreshold).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Low Stock</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {inventory.filter(item => item.stock > 0 && item.stock <= item.lowStockThreshold).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <TrendingDown className="h-8 w-8 text-red-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {inventory.filter(item => item.stock <= 0).length}
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
                            Search Products
                        </label>
                        <div className="relative">
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Product name, SKU..."
                                value={filters.searchQuery}
                                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            <option value="silk">Silk Sarees</option>
                            <option value="cotton">Cotton Sarees</option>
                            <option value="designer">Designer</option>
                            <option value="wedding">Wedding</option>
                            <option value="casual">Casual</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Status
                        </label>
                        <select
                            value={filters.stockStatus}
                            onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ searchQuery: '', category: 'all', stockStatus: 'all' })}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedItems(inventory.map(item => item.id));
                                        } else {
                                            setSelectedItems([]);
                                        }
                                    }}
                                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Current Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Low Stock Alert
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {inventory.map((item) => {
                            const stockStatus = getStockStatus(item);

                            return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedItems(prev => [...prev, item.id]);
                                                } else {
                                                    setSelectedItems(prev => prev.filter(id => id !== item.id));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {item.sku}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {item.category}
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={item.stock}
                                            onChange={(e) => updateStock(item.id, parseInt(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {item.lowStockThreshold}
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                                                {stockStatus.status}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => {
                                                const newStock = prompt('Enter new stock quantity:', item.stock);
                                                if (newStock !== null) {
                                                    updateStock(item.id, parseInt(newStock) || 0);
                                                }
                                            }}
                                            className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                                        >
                                            Adjust
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {inventory.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                        <p className="text-gray-600">
                            {filters.searchQuery || filters.category !== 'all' || filters.stockStatus !== 'all'
                                ? 'Try adjusting your filters to see more items.'
                                : 'Start by adding products to track inventory.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryManagement;