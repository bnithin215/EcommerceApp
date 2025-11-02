import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ButtonLoader } from '../common/Loader';
import { validateEmail } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, resetPassword } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    // Get redirect URL from location state
    const from = location.state?.from?.pathname || '/';

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            await login(formData.email, formData.password);
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Login error:', error);
            // Error toast is already shown in the auth context
        } finally {
            setLoading(false);
        }
    };

    // Handle forgot password
    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!resetEmail) {
            toast.error('Please enter your email address');
            return;
        }

        if (!validateEmail(resetEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setResetLoading(true);
            await resetPassword(resetEmail);
            toast.success('Password reset email sent! Check your inbox.');
            setShowForgotPassword(false);
            setResetEmail('');
        } catch (error) {
            console.error('Password reset error:', error);
            toast.error('Failed to send reset email. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    // Forgot Password Modal/Form
    if (showForgotPassword) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <KeyRound className="mx-auto h-12 w-12 text-pink-600" />
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Reset Password
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your email address and we'll send you a link to reset your password
                        </p>
                    </div>

                    {/* Reset Form */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <form className="space-y-6" onSubmit={handleForgotPassword}>
                            {/* Email Field */}
                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="reset-email"
                                        name="reset-email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors hover:border-gray-400"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={resetLoading}
                                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {resetLoading ? (
                                    <ButtonLoader className="mr-2" />
                                ) : (
                                    <Mail className="mr-2 h-4 w-4" />
                                )}
                                {resetLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setShowForgotPassword(false)}
                                className="text-sm text-pink-600 hover:text-pink-500 font-medium"
                            >
                                Back to sign in
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your account to continue shopping
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                                        errors.email
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                                        errors.password
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm text-pink-600 hover:text-pink-500 font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <ButtonLoader className="mr-2" />
                            ) : (
                                <ArrowRight className="mr-2 h-4 w-4" />
                            )}
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-pink-600 hover:text-pink-500"
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;