import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, X, FileText, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ButtonLoader } from '../common/Loader';
import { validateEmail, validatePhone } from '../../utils/helpers';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Terms agreement validation
        if (!agreedToTerms) {
            newErrors.terms = 'You must agree to the terms and conditions';
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
            await register(formData);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Registration error:', error);
            // Error toast is already shown in the auth context
        } finally {
            setLoading(false);
        }
    };

    // Terms and Conditions Modal
    const TermsModal = ({ isOpen, onClose }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-6 w-6 text-pink-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Terms and Conditions</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        <div className="space-y-4 text-sm text-gray-700">
                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h4>
                                <p>By creating an account with Srija4Her, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">2. Account Registration</h4>
                                <p>You must provide accurate and complete information when creating your account. You are responsible for maintaining the security of your account credentials.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">3. Product Information</h4>
                                <p>We strive to provide accurate product descriptions and images. However, we do not guarantee that all product information is completely accurate or current.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">4. Orders and Payments</h4>
                                <p>All orders are subject to availability. We reserve the right to cancel orders if products are unavailable. Payment must be completed before order processing.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">5. Shipping and Delivery</h4>
                                <p>We provide estimated delivery times, but actual delivery may vary. We are not responsible for delays caused by shipping carriers or circumstances beyond our control.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">6. Returns and Exchanges</h4>
                                <p>Returns are accepted within 7 days of delivery. Items must be in original condition with tags attached. Custom or personalized items are not eligible for return.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">7. Intellectual Property</h4>
                                <p>All content on this website, including images, text, and designs, are protected by copyright and other intellectual property laws.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">8. Limitation of Liability</h4>
                                <p>Srija4Her's liability is limited to the purchase price of the product. We are not liable for any indirect, incidental, or consequential damages.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">9. Changes to Terms</h4>
                                <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">10. Contact Information</h4>
                                <p>For questions about these terms, please contact us at support@srija4her.com or call +91 799 394 3031.</p>
                            </section>
                        </div>
                    </div>
                    <div className="flex justify-end p-6 border-t bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Privacy Policy Modal
    const PrivacyModal = ({ isOpen, onClose }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-6 w-6 text-pink-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        <div className="space-y-4 text-sm text-gray-700">
                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h4>
                                <p>We collect information you provide directly, such as your name, email, phone number, and shipping address. We also collect information about your browsing behavior and purchase history.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h4>
                                <p>We use your information to process orders, provide customer service, send promotional emails (with your consent), and improve our services.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">3. Information Sharing</h4>
                                <p>We do not sell or rent your personal information to third parties. We may share information with service providers who help us operate our business, such as payment processors and shipping companies.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">4. Data Security</h4>
                                <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">5. Cookies and Tracking</h4>
                                <p>We use cookies to enhance your browsing experience and analyze website traffic. You can control cookie settings through your browser.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">6. Email Communications</h4>
                                <p>We may send you promotional emails about new products and offers. You can unsubscribe at any time by clicking the unsubscribe link in our emails.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">7. Your Rights</h4>
                                <p>You have the right to access, update, or delete your personal information. Contact us if you wish to exercise these rights.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">8. Data Retention</h4>
                                <p>We retain your information for as long as necessary to provide our services and comply with legal obligations.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">9. Children's Privacy</h4>
                                <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
                            </section>

                            <section>
                                <h4 className="font-semibold text-gray-900 mb-2">10. Contact Us</h4>
                                <p>If you have questions about this privacy policy, contact us at privacy@srija4her.com or call +91 799 394 3031.</p>
                            </section>
                        </div>
                    </div>
                    <div className="flex justify-end p-6 border-t bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us for an amazing shopping experience
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* First Name */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                                            errors.firstName
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        placeholder="First name"
                                    />
                                </div>
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                                        errors.lastName
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    placeholder="Last name"
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                )}
                            </div>
                        </div>

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

                        {/* Phone Field */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                                        errors.phone
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
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
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                                        errors.password
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    placeholder="Create a password"
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

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                                        errors.confirmPassword
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Terms and Conditions */}
                        <div>
                            <div className="flex items-start">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mt-1"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowTermsModal(true)}
                                        className="text-pink-600 hover:text-pink-500 font-medium underline"
                                    >
                                        Terms and Conditions
                                    </button>{' '}
                                    and{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowPrivacyModal(true)}
                                        className="text-pink-600 hover:text-pink-500 font-medium underline"
                                    >
                                        Privacy Policy
                                    </button>
                                </label>
                            </div>
                            {errors.terms && (
                                <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
                            )}
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
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-pink-600 hover:text-pink-500"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions Modal */}
            <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

            {/* Privacy Policy Modal */}
            <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
        </div>
    );
};

export default Register;