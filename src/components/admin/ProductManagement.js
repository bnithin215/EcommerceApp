import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Package,
    AlertTriangle,
    CheckCircle,
    Download
} from 'lucide-react';
import { productAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import ProductForm from './ProductForm';
import { TableSkeleton } from '../common/Loader';
import toast from 'react-hot-toast';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const applyFilters = useCallback(() => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(search) ||
                product.fabric.toLowerCase().includes(search) ||
                product.sku?.toLowerCase().includes(search)
            );
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(product => product.category === categoryFilter);
        }

        // Stock filter
        if (stockFilter !== 'all') {
            switch (stockFilter) {
                case 'in_stock':
                    filtered = filtered.filter(product => product.inStock > 0);
                    break;
                case 'low_stock':
                    filtered = filtered.filter(product => product.inStock > 0 && product.inStock <= 5);
                    break;
                case 'out_of_stock':
                    filtered = filtered.filter(product => product.inStock === 0);
                    break;
                default:
                    break;
            }
        }

        setFilteredProducts(filtered);
    }, [products, searchTerm, categoryFilter, stockFilter]);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const result = await productAPI.getAllProducts();
            console.log('Loaded products:', result);
            setProducts(result.products || []);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowProductForm(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            console.log('Deleting product:', productToDelete.id);
            await productAPI.deleteProduct(productToDelete.id);
            setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
            toast.success('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        } finally {
            setShowDeleteConfirm(false);
            setProductToDelete(null);
        }
    };

    const handleProductSave = (savedProduct) => {
        console.log('Product saved:', savedProduct);
        if (editingProduct) {
            // Update existing product
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            // Add new product
            setProducts(prev => [savedProduct, ...prev]);
        }
        setShowProductForm(false);
        setEditingProduct(null);
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return;

        try {
            const deletePromises = selectedProducts.map(id => productAPI.deleteProduct(id));
            await Promise.all(deletePromises);

            setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
            setSelectedProducts([]);
            toast.success(`${selectedProducts.length} products deleted successfully`);
        } catch (error) {
            console.error('Error deleting products:', error);
            toast.error('Failed to delete some products');
        }
    };

    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleAllProducts = () => {
        setSelectedProducts(prev =>
            prev.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id)
        );
    };

    const getStockStatus = (stock) => {
        if (stock === 0) {
            return { status: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
        } else if (stock <= 5) {
            return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
        } else {
            return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircle };
        }
    };

    const exportProducts = () => {
        const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredProducts.map(product => [
                `"${product.name}"`,
                product.sku || '',
                product.category,
                product.price,
                product.inStock,
                getStockStatus(product.inStock).status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (showProductForm) {
        return (
            <ProductForm
                product={editingProduct}
                onSave={handleProductSave}
                onCancel={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                    <p className="text-gray-600">Manage your product inventory and details</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={exportProducts}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={handleAddProduct}
                        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">In Stock</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {products.filter(p => p.inStock > 0).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Low Stock</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {products.filter(p => p.inStock > 0 && p.inStock <= 5).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {products.filter(p => p.inStock === 0).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="all">All Categories</option>
                            {PRODUCT_CATEGORIES.slice(1).map(category => (
                                <option key={category.id} value={category.slug}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {/* Stock Filter */}
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="all">All Stock Status</option>
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>

                        {selectedProducts.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete ({selectedProducts.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <TableSkeleton rows={8} columns={7} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                        onChange={toggleAllProducts}
                                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
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
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
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
                            {filteredProducts.map((product) => {
                                const stockStatus = getStockStatus(product.inStock);
                                const StatusIcon = stockStatus.icon;

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product.id)}
                                                onChange={() => toggleProductSelection(product.id)}
                                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                        src={product.images?.[0] || '/images/no-image-placeholder.jpg'}
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.fabric}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.sku || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <div className="text-sm text-gray-500 line-through">
                                                    {formatCurrency(product.originalPrice)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.inStock}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {stockStatus.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => window.open(`/products/${product.id}`, '_blank')}
                                                    className="text-gray-600 hover:text-gray-800"
                                                    title="View Product"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="text-pink-600 hover:text-pink-800"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {filteredProducts.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-4">
                                    {products.length === 0
                                        ? "You haven't added any products yet."
                                        : "No products match your current filters."
                                    }
                                </p>
                                {products.length === 0 && (
                                    <button
                                        onClick={handleAddProduct}
                                        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Your First Product
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;