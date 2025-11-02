// Create this file: frontend/src/components/admin/FinancialReports.js

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    RefreshCw,
    BarChart3,
    PieChart,
    FileText
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const FinancialReports = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState('last30days');
    const [reportData, setReportData] = useState({
        revenue: {
            total: 0,
            change: 0,
            trend: 'up'
        },
        expenses: {
            total: 0,
            change: 0,
            trend: 'down'
        },
        profit: {
            total: 0,
            change: 0,
            trend: 'up'
        },
        transactions: []
    });

    useEffect(() => {
        loadFinancialData();
    }, [dateRange]);

    const loadFinancialData = async () => {
        setLoading(true);
        try {
            // Simulate API call - replace with actual API
            setTimeout(() => {
                setReportData({
                    revenue: {
                        total: 150000,
                        change: 12.5,
                        trend: 'up'
                    },
                    expenses: {
                        total: 45000,
                        change: -5.2,
                        trend: 'down'
                    },
                    profit: {
                        total: 105000,
                        change: 18.3,
                        trend: 'up'
                    },
                    transactions: [
                        { id: 1, date: new Date(), type: 'Sale', amount: 2500, description: 'Product Sales' },
                        { id: 2, date: new Date(), type: 'Expense', amount: -500, description: 'Shipping Costs' },
                        { id: 3, date: new Date(), type: 'Sale', amount: 1800, description: 'Product Sales' },
                    ]
                });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error loading financial data:', error);
            setLoading(false);
        }
    };

    const handleExportReport = () => {
        // Implement report export functionality
        console.log('Exporting financial report...');
    };

    const MetricCard = ({ title, value, change, trend, icon: Icon }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <div className="flex items-center mt-2">
                        {trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                            trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {Math.abs(change)}%
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-gray-400" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
                    <p className="text-gray-600">Track revenue, expenses, and financial performance</p>
                </div>
                <div className="flex space-x-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                        <option value="last90days">Last 90 Days</option>
                        <option value="thisyear">This Year</option>
                    </select>
                    <button
                        onClick={handleExportReport}
                        className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(reportData.revenue.total)}
                    change={reportData.revenue.change}
                    trend={reportData.revenue.trend}
                    icon={DollarSign}
                />
                <MetricCard
                    title="Total Expenses"
                    value={formatCurrency(reportData.expenses.total)}
                    change={reportData.expenses.change}
                    trend={reportData.expenses.trend}
                    icon={TrendingDown}
                />
                <MetricCard
                    title="Net Profit"
                    value={formatCurrency(reportData.profit.total)}
                    change={reportData.profit.change}
                    trend={reportData.profit.trend}
                    icon={BarChart3}
                />
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                        <button
                            onClick={loadFinancialData}
                            disabled={loading}
                            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center">
                                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Loading transactions...</p>
                                </td>
                            </tr>
                        ) : reportData.transactions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center">
                                    <FileText className="h-8 w-8 mx-auto text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">No transactions found</p>
                                </td>
                            </tr>
                        ) : (
                            reportData.transactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(transaction.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                transaction.type === 'Sale'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {transaction.type}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {transaction.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatCurrency(Math.abs(transaction.amount))}
                                            </span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;