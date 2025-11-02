// Replace the content of frontend/src/components/admin/SettingsPage.js with this:

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Store,
    CreditCard,
    Mail,
    Truck,
    Shield,
    Globe,
    Bell,
    Users,
    Database,
    Save,
    RefreshCw
} from 'lucide-react';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [settings, setSettings] = useState({
        general: {
            storeName: 'Srija4Her',
            storeDescription: 'Premium Sarees for Every Occasion',
            storeEmail: 'contact@srija4her.com',
            storePhone: '+91 9876543210',
            storeAddress: '123 Fashion Street, Mumbai, India',
            currency: 'INR',
            timezone: 'Asia/Kolkata'
        },
        payment: {
            razorpayEnabled: true,
            razorpayKeyId: '',
            razorpayKeySecret: '',
            stripeEnabled: false,
            stripePublishableKey: '',
            stripeSecretKey: '',
            codEnabled: true,
            upiEnabled: true
        },
        shipping: {
            freeShippingThreshold: 1500,
            defaultShippingRate: 100,
            shippingZones: [],
            estimatedDeliveryDays: 7
        },
        email: {
            smtpHost: '',
            smtpPort: 587,
            smtpUsername: '',
            smtpPassword: '',
            fromEmail: 'noreply@srija4her.com',
            fromName: 'Srija4Her'
        },
        notifications: {
            orderNotifications: true,
            lowStockAlerts: true,
            customerSignups: true,
            dailyReports: false
        }
    });

    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'shipping', label: 'Shipping', icon: Truck },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setInitialLoad(true);
            const data = await settingsAPI.getSettings();
            if (data && Object.keys(data).length > 0) {
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setInitialLoad(false);
        }
    };

    const saveSettings = async (section) => {
        try {
            setLoading(true);
            await settingsAPI.updateSettings({ [section]: settings[section] });
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const GeneralSettings = () => (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Store Information</h3>
                <p className="text-sm text-gray-600">Basic information about your store</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Name
                    </label>
                    <input
                        type="text"
                        value={settings.general.storeName}
                        onChange={(e) => updateSetting('general', 'storeName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Email
                    </label>
                    <input
                        type="email"
                        value={settings.general.storeEmail}
                        onChange={(e) => updateSetting('general', 'storeEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Phone
                    </label>
                    <input
                        type="tel"
                        value={settings.general.storePhone}
                        onChange={(e) => updateSetting('general', 'storePhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                    </label>
                    <select
                        value={settings.general.currency}
                        onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Description
                    </label>
                    <textarea
                        value={settings.general.storeDescription}
                        onChange={(e) => updateSetting('general', 'storeDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Describe your store..."
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Address
                    </label>
                    <textarea
                        value={settings.general.storeAddress}
                        onChange={(e) => updateSetting('general', 'storeAddress', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Full business address..."
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    onClick={() => saveSettings('general')}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Save General Settings
                </button>
            </div>
        </div>
    );

    const NotificationSettings = () => (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-600">Manage how you receive notifications</p>
            </div>

            <div className="space-y-4">
                <label className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-gray-900">Order Notifications</span>
                        <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.notifications.orderNotifications}
                        onChange={(e) => updateSetting('notifications', 'orderNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                </label>

                <label className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-gray-900">Low Stock Alerts</span>
                        <p className="text-sm text-gray-500">Get alerts when products are running low</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.notifications.lowStockAlerts}
                        onChange={(e) => updateSetting('notifications', 'lowStockAlerts', e.target.checked)}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                </label>

                <label className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-gray-900">Customer Signups</span>
                        <p className="text-sm text-gray-500">Get notified about new customer registrations</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.notifications.customerSignups}
                        onChange={(e) => updateSetting('notifications', 'customerSignups', e.target.checked)}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                </label>

                <label className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-gray-900">Daily Reports</span>
                        <p className="text-sm text-gray-500">Receive daily sales and analytics reports</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.notifications.dailyReports}
                        onChange={(e) => updateSetting('notifications', 'dailyReports', e.target.checked)}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    onClick={() => saveSettings('notifications')}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Notification Settings
                </button>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings />;
            case 'notifications':
                return <NotificationSettings />;
            default:
                return (
                    <div className="p-6 text-center">
                        <p className="text-gray-500">This section is coming soon...</p>
                    </div>
                );
        }
    };

    if (initialLoad) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your store configuration and preferences</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Sidebar */}
                    <div className="w-full lg:w-64 bg-gray-50 border-r border-gray-200">
                        <nav className="p-4 space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 mr-3" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;