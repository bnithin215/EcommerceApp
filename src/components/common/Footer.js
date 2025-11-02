import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { COMPANY_INFO, PRODUCT_CATEGORIES } from '../../utils/constants';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img
                                src={`${process.env.PUBLIC_URL}/img.png`}
                                alt="Srija Collections Logo"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="font-bold text-xl">{COMPANY_INFO.name}</span>
                        </div>


                        <p className="text-gray-300 text-sm">
                            {COMPANY_INFO.tagline}
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4 text-pink-400" />
                                <span>{COMPANY_INFO.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Mail className="h-4 w-4 text-pink-400" />
                                <span>{COMPANY_INFO.email}</span>
                            </div>
                            <div className="flex items-start space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-pink-400 mt-0.5" />
                                <span>{COMPANY_INFO.address}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <MessageCircle className="h-4 w-4 text-green-400" />
                                <a
                                    href={`https://wa.me/${COMPANY_INFO.socialMedia.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-400 hover:text-green-300"
                                >
                                    WhatsApp Support
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Track Order
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2">
                            {PRODUCT_CATEGORIES.slice(1, 6).map((category) => (
                                <li key={category.id}>
                                    <Link
                                        to={`/products?category=${category.slug}`}
                                        className="text-gray-300 hover:text-white transition-colors text-sm"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <span className="text-gray-300 text-sm">
                                    {COMPANY_INFO.policies?.returns || '7-day return policy'}
                                </span>
                            </li>
                            <li>
                                <span className="text-gray-300 text-sm">
                                    {COMPANY_INFO.policies?.shipping || 'Free shipping on orders above ₹999'}
                                </span>
                            </li>
                            <li>
                                <span className="text-gray-300 text-sm">
                                    {COMPANY_INFO.policies?.support || '24/7 customer support'}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Social Media & Newsletter */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        {/* Social Media */}
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-300">Follow us:</span>
                            <div className="flex space-x-3">
                                {COMPANY_INFO.socialMedia?.facebook && (
                                    <a
                                        href={COMPANY_INFO.socialMedia.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                )}
                                {COMPANY_INFO.socialMedia?.instagram && (
                                    <a
                                        href={COMPANY_INFO.socialMedia.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                )}
                                {COMPANY_INFO.socialMedia?.twitter && (
                                    <a
                                        href={COMPANY_INFO.socialMedia.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Twitter className="h-5 w-5" />
                                    </a>
                                )}
                                {COMPANY_INFO.socialMedia?.youtube && (
                                    <a
                                        href={COMPANY_INFO.socialMedia.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Youtube className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Newsletter */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300 whitespace-nowrap">Stay updated:</span>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400"
                                />
                                <button className="px-4 py-2 bg-pink-600 text-white rounded-r-lg hover:bg-pink-700 transition-colors text-sm">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} {COMPANY_INFO.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;