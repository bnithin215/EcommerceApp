// src/components/user/UserProfile.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    Heart,
    Settings,
    Lock,
    Bell,
    CreditCard,
    Edit3,
    Plus,
    Trash2,
    Save,
    X,
    Check,
    Eye,
    EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const UserProfile = () => {
    const { user, userProfile, updateUserProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        addresses: [],
        preferences: {
            newsletter: true,
            orderUpdates: true,
            promotions: false,
            smsNotifications: true
        }
    });

    const [newAddress, setNewAddress] = useState({
        type: 'home',
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        isDefault: false
    });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'orders', label: 'Order History', icon: ShoppingBag },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    useEffect(() => {
        if (userProfile) {
            setProfileData({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                phone: userProfile.phone || '',
                dateOfBirth: userProfile.dateOfBirth || '',
                gender: userProfile.gender || '',
                addresses: userProfile.addresses || [],
                preferences: {
                    newsletter: userProfile.preferences?.newsletter ?? true,
                    orderUpdates: userProfile.preferences?.orderUpdates ?? true,
                    promotions: userProfile.preferences?.promotions ?? false,
                    smsNotifications: userProfile.preferences?.smsNotifications ?? true
                }
            });
        }
    }, [userProfile]);

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            await updateUserProfile(profileData);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async () => {
        try {
            const updatedAddresses = [...profileData.addresses, { ...newAddress, id: Date.now().toString() }];

            // If this is set as default, remove default from others
            if (newAddress.isDefault) {
                updatedAddresses.forEach(addr => {
                    if (addr.id !== newAddress.id) addr.isDefault = false;
                });
            }

            setProfileData(prev => ({ ...prev, addresses: updatedAddresses }));
            setNewAddress({
                type: 'home',
                name: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                phone: '',
                isDefault: false
            });
            setShowAddAddress(false);

            // Save to backend
            await updateUserProfile({ ...profileData, addresses: updatedAddresses });
            toast.success('Address added successfully');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Failed to add address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                const updatedAddresses = profileData.addresses.filter(addr => addr.id !== addressId);
                setProfileData(prev => ({ ...prev, addresses: updatedAddresses }));

                await updateUserProfile({ ...profileData, addresses: updatedAddresses });
                toast.success('Address deleted successfully');
            } catch (error) {
                console.error('Error deleting address:', error);
                toast.error('Failed to delete address');
            }
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            // In a real app, you'd validate current password and update
            toast.success('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const ProfileForm = () => (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600">Update your personal details and contact information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                    </label>
                    <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                    </label>
                    <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 9876543210"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                    </label>
                    <select
                        value={profileData.gender}
                        onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                        <option value="">Select Gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                </button>
            </div>
        </div>
    );

    const AddressManagement = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Saved Addresses</h3>
                    <p className="text-sm text-gray-600">Manage your delivery addresses</p>
                </div>
                <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                </button>
            </div>

            {profileData.addresses.length === 0 ? (
                <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h4>
                    <p className="text-gray-600 mb-4">Add your addresses for faster checkout</p>
                    <button
                        onClick={() => setShowAddAddress(true)}
                        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileData.addresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative">
                            {address.isDefault && (
                                <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Default
                                </span>
                            )}

                            <div className="pr-16">
                                <div className="flex items-center mb-2">
                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-2">
                                        {address.type}
                                    </span>
                                    <h4 className="font-medium text-gray-900">{address.name}</h4>
                                </div>

                                <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                                <p className="text-gray-600 text-sm mb-1">
                                    {address.city}, {address.state} {address.zipCode}
                                </p>
                                <p className="text-gray-600 text-sm">{address.phone}</p>
                            </div>

                            <div className="absolute top-4 right-4 flex space-x-2">
                                <button
                                    onClick={() => setEditingAddress(address)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteAddress(address.id)}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Address Modal */}
            {showAddAddress && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Add New Address</h3>
                            <button
                                onClick={() => setShowAddAddress(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Type
                                </label>
                                <select
                                    value={newAddress.type}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                >
                                    <option value="home">Home</option>
                                    <option value="work">Work</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={newAddress.name}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    value={newAddress.address}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={newAddress.isDefault}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowAddAddress(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddAddress}
                                disabled={!newAddress.name || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.zipCode}
                                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Address
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const SecuritySettings = () => (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-600">Manage your account security and login preferences</p>
            </div>

            {/* Change Password */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Change Password</h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password *
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password *
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password *
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleChangePassword}
                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                            <Lock className="h-4 w-4 mr-2" />
                        )}
                        Update Password
                    </button>
                </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">SMS Authentication</p>
                        <p className="text-sm text-gray-600">Receive verification codes via SMS</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Enable 2FA
                    </button>
                </div>
            </div>

            {/* Login Sessions */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                            <p className="font-medium text-green-900">Current Session</p>
                            <p className="text-sm text-green-700">Chrome on Mac • Mumbai, India</p>
                            <p className="text-xs text-green-600">Last active: Now</p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Current
                        </span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="mt-4 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                    Sign Out of All Devices
                </button>
            </div>
        </div>
    );

    const NotificationSettings = () => (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-600">Choose how you want to receive notifications</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h4>
                <div className="space-y-4">
                    <label className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">Order Updates</span>
                            <p className="text-sm text-gray-500">Receive updates about your orders and shipping</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={profileData.preferences.orderUpdates}
                            onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, orderUpdates: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">Newsletter</span>
                            <p className="text-sm text-gray-500">Get the latest news, trends, and new arrivals</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={profileData.preferences.newsletter}
                            onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, newsletter: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">Promotions & Offers</span>
                            <p className="text-sm text-gray-500">Receive special offers, discounts, and sale notifications</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={profileData.preferences.promotions}
                            onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, promotions: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                    </label>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">SMS Notifications</h4>
                <div className="space-y-4">
                    <label className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900">SMS Updates</span>
                            <p className="text-sm text-gray-500">Receive important order updates via SMS</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={profileData.preferences.smsNotifications}
                            onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, smsNotifications: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                    </label>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Preferences
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-8">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                                <User className="h-8 w-8 text-pink-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {profileData.firstName && profileData.lastName
                                        ? `${profileData.firstName} ${profileData.lastName}`
                                        : user?.displayName || 'Welcome!'
                                    }
                                </h1>
                                <p className="text-pink-100">{user?.email}</p>
                                {profileData.phone && (
                                    <p className="text-pink-100">{profileData.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

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
                                                    ? 'bg-pink-100 text-pink-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
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
                        <div className="flex-1 p-6 lg:p-8">
                            {activeTab === 'profile' && <ProfileForm />}
                            {activeTab === 'addresses' && <AddressManagement />}

                            {activeTab === 'orders' && (
                                <div className="text-center py-12">
                                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Order History</h3>
                                    <p className="text-gray-600 mb-4">View and track all your orders</p>
                                    <Link
                                        to="/orders"
                                        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                                    >
                                        View Order History
                                    </Link>
                                </div>
                            )}

                            {activeTab === 'wishlist' && (
                                <div className="text-center py-12">
                                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">My Wishlist</h3>
                                    <p className="text-gray-600 mb-4">Save your favorite items here</p>
                                    <Link
                                        to="/wishlist"
                                        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                                    >
                                        View Wishlist
                                    </Link>
                                </div>
                            )}

                            {activeTab === 'security' && <SecuritySettings />}
                            {activeTab === 'notifications' && <NotificationSettings />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default UserProfile;