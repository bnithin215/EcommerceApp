// src/pages/Admin.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    Plus,
    TrendingUp,
    Eye,
    Upload,
    FileText,
    CreditCard,
    Truck,
    Tag
} from 'lucide-react';
import AdminPanel from '../components/admin/AdminPanel';
import ProductForm from '../components/admin/ProductForm';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import CustomersManagement from '../components/admin/CustomersManagement';
import AnalyticsPage from '../components/admin/AnalyticsPage';
import InventoryManagement from '../components/admin/InventoryManagement';
import FinancialReports from '../components/admin/FinancialReports';
import SettingsPage from '../components/admin/SettingsPage';
import { adminAPI, productAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { PageLoader } from '../components/common/Loader';

const Admin = () => {
    const location = useLocation();

    // Updated navigation items (removed testing components)
    const navItems = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { id: 'products', name: 'Products', icon: Package, path: '/admin/products' },
        { id: 'inventory', name: 'Inventory', icon: FileText, path: '/admin/inventory' },
        { id: 'orders', name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
        { id: 'customers', name: 'Customers', icon: Users, path: '/admin/customers' },
        { id: 'analytics', name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
        { id: 'reports', name: 'Reports', icon: FileText, path: '/admin/reports' },
        { id: 'promotions', name: 'Promotions', icon: Tag, path: '/admin/promotions' },
        { id: 'settings', name: 'Settings', icon: Settings, path: '/admin/settings' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
                    <div className="p-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Srija4Her</h2>
                                <p className="text-sm text-gray-500">Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    <nav className="px-4 pb-4">
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path ||
                                    (item.path !== '/admin' && location.pathname.startsWith(item.path));

                                return (
                                    <li key={item.id}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4 mr-3" />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <Routes>
                        <Route path="/" element={<AdminPanel />} />
                        <Route path="/products" element={<ProductManagement />} />
                        <Route path="/products/new" element={<AddProductPage />} />
                        <Route path="/products/edit/:id" element={<EditProductPage />} />
                        <Route path="/inventory" element={<InventoryManagement />} />
                        <Route path="/orders" element={<OrderManagement />} />
                        <Route path="/orders/:id" element={<OrderDetailsPage />} />
                        <Route path="/customers" element={<CustomersManagement />} />
                        <Route path="/customers/:id" element={<CustomerDetailsPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/reports" element={<FinancialReports />} />
                        <Route path="/promotions" element={<PromotionsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

// Add Product Page Component
const AddProductPage = () => {
    const navigate = useNavigate();

    const handleProductSave = (savedProduct) => {
        console.log('Product saved:', savedProduct);
        navigate('/admin/products');
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                    <p className="text-gray-600">Create a new product listing</p>
                </div>
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
            <ProductForm
                onSave={handleProductSave}
                onCancel={handleCancel}
            />
        </div>
    );
};

// Edit Product Page Component
const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const productData = await productAPI.getProduct(id);
                setProduct(productData);
            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const handleProductSave = (savedProduct) => {
        console.log('Product updated:', savedProduct);
        navigate('/admin/products');
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                <span className="ml-2 text-gray-600">Loading product...</span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
                <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                    <p className="text-gray-600">Update product information</p>
                </div>
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
            <ProductForm
                product={product}
                onSave={handleProductSave}
                onCancel={handleCancel}
            />
        </div>
    );
};

// Order Details Page Component
const OrderDetailsPage = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">Order details view coming soon...</p>
            </div>
        </div>
    );
};

// Customer Details Page Component
const CustomerDetailsPage = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">Customer details view coming soon...</p>
            </div>
        </div>
    );
};

// Promotions Page Component
const PromotionsPage = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Promotions & Discounts</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">Promotions management coming soon...</p>
            </div>
        </div>
    );
};

export default Admin;