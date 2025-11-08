// src/components/admin/AnalyticsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Calendar,
    Download,
    Filter
} from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { formatCurrency, formatNumber } from '../../utils/helpers';

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState({
        overview: {},
        salesChart: [],
        topProducts: [],
        customerMetrics: {},
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('30days');

    const loadAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await analyticsAPI.getAnalytics(dateRange);
            setAnalytics(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
            setError('Failed to load analytics data. Showing mock data.');
            // Mock data for development
            setAnalytics({
                overview: {
                    totalRevenue: 125000,
                    revenueChange: 12.5,
                    totalOrders: 89,
                    ordersChange: 8.3,
                    newCustomers: 45,
                    customersChange: 15.2,
                    conversionRate: 3.8,
                    conversionChange: 2.1
                },
                salesChart: [
                    { label: 'Week 1', value: 25000 },
                    { label: 'Week 2', value: 32000 },
                    { label: 'Week 3', value: 28000 },
                    { label: 'Week 4', value: 40000 }
                ],
                topProducts: [
                    {
                        id: '1',
                        name: 'Banarasi Silk Saree',
                        image: 'https://images.unsplash.com/photo-1610030469978-6bb537f3b982?w=100&h=100&fit=crop',
                        sales: 45,
                        revenue: 202500
                    },
                    {
                        id: '2',
                        name: 'Designer Georgette',
                        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100&h=100&fit=crop',
                        sales: 38,
                        revenue: 121600
                    },
                    {
                        id: '3',
                        name: 'Cotton Handloom',
                        image: 'https://images.unsplash.com/photo-1596706487679-9f95f5891975?w=100&h=100&fit=crop',
                        sales: 52,
                        revenue: 93600
                    }
                ],
                customerMetrics: {
                    avgOrderValue: 2800,
                    lifetimeValue: 8500,
                    repeatRate: 0.35
                },
                recentActivity: [
                    {
                        type: 'order',
                        message: 'New order placed by Priya Sharma',
                        timestamp: '2 minutes ago'
                    },
                    {
                        type: 'customer',
                        message: 'New customer registration: Anita Desai',
                        timestamp: '15 minutes ago'
                    },
                    {
                        type: 'product',
                        message: 'Low stock alert for Banarasi Silk Saree',
                        timestamp: '1 hour ago'
                    }
                ]
            });
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
    };

    const getColorClasses = (color) => {
        const colorMap = {
            green: {
                bg: 'bg-green-100',
                text: 'text-green-600'
            },
            blue: {
                bg: 'bg-blue-100',
                text: 'text-blue-600'
            },
            purple: {
                bg: 'bg-purple-100',
                text: 'text-purple-600'
            },
            orange: {
                bg: 'bg-orange-100',
                text: 'text-orange-600'
            }
        };
        return colorMap[color] || colorMap.blue;
    };

    const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
        const colorClasses = getColorClasses(color);
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {change !== undefined && (
                            <div className={`flex items-center mt-1 ${
                                change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {change >= 0 ? (
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                )}
                                <span className="text-sm font-medium">
                                    {Math.abs(change)}% from last period
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={`p-3 rounded-full ${colorClasses.bg}`}>
                        <Icon className={`h-6 w-6 ${colorClasses.text}`} />
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600">Track your business performance and insights</p>
                </div>
                <div className="flex space-x-3">
                    <select
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                    >
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="90days">Last 90 days</option>
                        <option value="12months">Last 12 months</option>
                    </select>
                    <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">{error}</p>
                </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(analytics.overview.totalRevenue || 0)}
                    change={analytics.overview.revenueChange}
                    icon={DollarSign}
                    color="green"
                />
                <MetricCard
                    title="Total Orders"
                    value={formatNumber(analytics.overview.totalOrders || 0)}
                    change={analytics.overview.ordersChange}
                    icon={ShoppingCart}
                    color="blue"
                />
                <MetricCard
                    title="New Customers"
                    value={formatNumber(analytics.overview.newCustomers || 0)}
                    change={analytics.overview.customersChange}
                    icon={Users}
                    color="purple"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${(analytics.overview.conversionRate || 0).toFixed(1)}%`}
                    change={analytics.overview.conversionChange}
                    icon={TrendingUp}
                    color="orange"
                />
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-pink-100 text-pink-700 rounded-lg">Revenue</button>
                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Orders</button>
                    </div>
                </div>

                {/* Simple chart representation - in real app, use Chart.js or Recharts */}
                {analytics.salesChart && analytics.salesChart.length > 0 ? (
                    <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-between p-4">
                        {analytics.salesChart.map((data, index) => {
                            const maxValue = Math.max(...analytics.salesChart.map(d => d.value || 0));
                            const height = maxValue > 0 ? (data.value / maxValue) * 200 : 0;
                            return (
                                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                                    <div
                                        className="bg-pink-500 rounded-t-sm w-full max-w-[40px]"
                                        style={{
                                            height: `${height}px`,
                                            minHeight: height > 0 ? '4px' : '0px'
                                        }}
                                    ></div>
                                    <span className="text-xs text-gray-600 text-center">{data.label}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">No sales data available for this period</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                    {analytics.topProducts && analytics.topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.topProducts.map((product, index) => (
                                <div key={product.id || index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={product.image || 'https://via.placeholder.com/40'}
                                                alt={product.name || 'Product'}
                                                className="h-10 w-10 rounded-lg object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/40';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{product.name || 'Unknown Product'}</p>
                                            <p className="text-sm text-gray-500">{product.sales || 0} sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(product.revenue || 0)}
                                        </p>
                                        <p className="text-sm text-gray-500">#{index + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No product data available</p>
                        </div>
                    )}
                </div>

                {/* Customer Metrics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Average Order Value</p>
                                <p className="text-lg font-bold text-pink-600">
                                    {formatCurrency(analytics.customerMetrics.avgOrderValue || 0)}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Customer Lifetime Value</p>
                                <p className="text-lg font-bold text-purple-600">
                                    {formatCurrency(analytics.customerMetrics.lifetimeValue || 0)}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Repeat Purchase Rate</p>
                                <p className="text-lg font-bold text-blue-600">
                                    {((analytics.customerMetrics.repeatRate || 0) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                        {analytics.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`p-2 rounded-full ${
                                    activity.type === 'order' ? 'bg-green-100' :
                                        activity.type === 'customer' ? 'bg-blue-100' :
                                            'bg-purple-100'
                                }`}>
                                    {activity.type === 'order' ? (
                                        <ShoppingCart className="h-4 w-4 text-green-600" />
                                    ) : activity.type === 'customer' ? (
                                        <Users className="h-4 w-4 text-blue-600" />
                                    ) : (
                                        <Package className="h-4 w-4 text-purple-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.message || 'Activity'}</p>
                                    <p className="text-xs text-gray-500">{activity.timestamp || 'Just now'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;