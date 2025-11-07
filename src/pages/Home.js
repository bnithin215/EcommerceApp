// Enhanced Home.js with Kala Mandir inspired features

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    ShoppingBag,
    Users,
    Award,
    Truck,
    ChevronLeft,
    ChevronRight,
    Package,
    Sparkles,
    Shirt,
    Crown,
    Heart,
    Star,
    Filter,
    Grid,
    Palette,
    Calendar
} from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/common/Loader';
import { COMPANY_INFO } from '../utils/constants';
import { productAPI } from '../services/api';

const Home = () => {
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Enhanced Categories with more details
    const enhancedCategories = [
        {
            id: 'silk',
            name: 'Silk Sarees',
            slug: 'silk',
            description: 'Premium silk collection',
            image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop',
            icon: Crown,
            subCategories: ['Banarasi', 'Kanchipuram', 'South Silk', 'Art Silk'],
            priceRange: '₹2,000 - ₹15,000'
        },
        {
            id: 'cotton',
            name: 'Cotton Sarees',
            slug: 'cotton',
            description: 'Comfortable everyday wear',
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop',
            icon: Shirt,
            subCategories: ['Handloom', 'Printed', 'Block Print', 'Organic'],
            priceRange: '₹500 - ₹3,000'
        },
        {
            id: 'designer',
            name: 'Designer Collection',
            slug: 'designer',
            description: 'Latest designer trends',
            image: 'https://images.unsplash.com/photo-1606135772417-552e8b7a20d7?w=400&h=300&fit=crop',
            icon: Sparkles,
            subCategories: ['Contemporary', 'Fusion', 'Party Wear', 'Indo-Western'],
            priceRange: '₹3,000 - ₹20,000'
        },
        {
            id: 'wedding',
            name: 'Bridal Collection',
            slug: 'wedding',
            description: 'Special wedding sarees',
            image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=300&fit=crop',
            icon: Heart,
            subCategories: ['Heavy Work', 'Traditional', 'Reception', 'Engagement'],
            priceRange: '₹5,000 - ₹50,000'
        },
        {
            id: 'casual',
            name: 'Casual Wear',
            slug: 'casual',
            description: 'Everyday elegance',
            image: 'https://images.unsplash.com/photo-1623456436606-3930259e7ba5?w=400&h=300&fit=crop',
            icon: Package,
            subCategories: ['Office Wear', 'Daily Use', 'Simple Elegance', 'Comfortable'],
            priceRange: '₹800 - ₹2,500'
        },
        {
            id: 'party',
            name: 'Party Wear',
            slug: 'party',
            description: 'Festive & party collection',
            image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop',
            icon: Star,
            subCategories: ['Embellished', 'Sequin Work', 'Heavy Border', 'Festive'],
            priceRange: '₹2,500 - ₹12,000'
        }
    ];

    // Shopping by features
    const shopByFeatures = [
        {
            title: 'By Fabric',
            icon: Shirt,
            items: ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Crepe', 'Linen'],
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'By Occasion',
            icon: Calendar,
            items: ['Wedding', 'Party', 'Festival', 'Office', 'Casual', 'Religious'],
            bgColor: 'bg-pink-50',
            iconColor: 'text-pink-600'
        },
        {
            title: 'By Color',
            icon: Palette,
            items: ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Black'],
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'By Price',
            icon: Filter,
            items: ['Under ₹1,000', '₹1,000-₹3,000', '₹3,000-₹10,000', 'Above ₹10,000'],
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        }
    ];

    // Regional Collections
    const regionalCollections = [
        {
            name: 'Banarasi Collection',
            region: 'Varanasi, UP',
            specialty: 'Gold & Silver Brocade',
            image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=200&fit=crop',
            slug: 'banarasi'
        },
        {
            name: 'Kanchipuram Silk',
            region: 'Tamil Nadu',
            specialty: 'Pure Silk Tradition',
            image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop',
            slug: 'kanchipuram'
        },
        {
            name: 'Chanderi Sarees',
            region: 'Madhya Pradesh',
            specialty: 'Lightweight Elegance',
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=200&fit=crop',
            slug: 'chanderi'
        },
        {
            name: 'Sambalpuri Ikat',
            region: 'Odisha',
            specialty: 'Traditional Ikat Weave',
            image: 'https://images.unsplash.com/photo-1606135772417-552e8b7a20d7?w=300&h=200&fit=crop',
            slug: 'sambalpuri'
        }
    ];

    // Hero slides data
    const heroSlides = [
        {
            id: 1,
            title: "Elegant Silk Sarees",
            subtitle: "Discover our premium collection",
            description: "Handcrafted silk sarees with intricate designs perfect for special occasions",
            image: "https://images.unsplash.com/photo-1610030469978-6bb537f3b982?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            cta: "Shop Silk Collection",
            link: "/products?category=silk"
        },
        {
            id: 2,
            title: "Designer Collection",
            subtitle: "Latest trends in fashion",
            description: "Contemporary designer sarees that blend tradition with modern aesthetics",
            image: "https://images.unsplash.com/photo-1596706487679-9f95f5891975?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.1",
            cta: "Explore Designer Range",
            link: "/products?category=designer"
        },
        {
            id: 3,
            title: "Cotton Comfort",
            subtitle: "Everyday elegance",
            description: "Breathable cotton sarees perfect for daily wear and comfort",
            image: "https://images.unsplash.com/photo-1623456436606-3930259e7ba5?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.1",
            cta: "Shop Cotton Collection",
            link: "/products?category=cotton"
        }
    ];

    // Load featured products
    useEffect(() => {
        const loadFeaturedProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Loading featured products from Firebase...');

                const response = await productAPI.getFeaturedProducts(8);

                if (response && response.length > 0) {
                    console.log('Loaded featured products from Firebase:', response.length);
                    setFeaturedProducts(response);
                } else {
                    console.log('No featured products found, loading all products...');

                    const allProducts = await productAPI.getAllProducts();
                    if (allProducts && allProducts.products) {
                        const featured = allProducts.products.slice(0, 8);
                        setFeaturedProducts(featured);
                        console.log('Using first 8 products as featured:', featured.length);
                    } else {
                        throw new Error('No products found in database');
                    }
                }
            } catch (error) {
                console.error('Error loading featured products:', error);
                setError(error.message);
                setFeaturedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadFeaturedProducts();
    }, []);

    // Auto-slide effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [heroSlides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    const handleCategoryClick = (categorySlug) => {
        navigate(`/products?category=${categorySlug}`);
    };

    const handleFeatureClick = (feature, item) => {
        const params = new URLSearchParams();

        switch (feature.title) {
            case 'By Fabric':
                params.set('fabric', item.toLowerCase());
                break;
            case 'By Occasion':
                params.set('occasion', item.toLowerCase());
                break;
            case 'By Color':
                params.set('color', item.toLowerCase());
                break;
            case 'By Price':
                if (item.includes('Under')) {
                    params.set('maxPrice', '1000');
                } else if (item.includes('1,000-3,000')) {
                    params.set('minPrice', '1000');
                    params.set('maxPrice', '3000');
                } else if (item.includes('3,000-10,000')) {
                    params.set('minPrice', '3000');
                    params.set('maxPrice', '10000');
                } else {
                    params.set('minPrice', '10000');
                }
                break;
        }

        navigate(`/products?${params.toString()}`);
    };

    const stats = [
        { icon: Users, label: "Happy Customers", value: "10,000+" },
        { icon: Package, label: "Products Sold", value: "50,000+" },
        { icon: Award, label: "Years Experience", value: "15+" },
        { icon: Truck, label: "Free Delivery", value: "India Wide" }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen overflow-hidden">
                {heroSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                            index === currentSlide ? 'translate-x-0' :
                                index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                        }`}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${slide.image})` }}
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                        </div>

                        <div className="relative z-10 flex items-center justify-center h-full">
                            <div className="container mx-auto px-4 text-center text-white">
                                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp">
                                    {slide.title}
                                </h1>
                                <p className="text-xl md:text-2xl mb-4 animate-fadeInUp animation-delay-200">
                                    {slide.subtitle}
                                </p>
                                <p className="text-lg mb-8 max-w-2xl mx-auto animate-fadeInUp animation-delay-400">
                                    {slide.description}
                                </p>
                                <Link
                                    to={slide.link}
                                    className="inline-flex items-center px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors transform hover:scale-105 animate-fadeInUp animation-delay-600"
                                >
                                    {slide.cta}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all z-20"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all z-20"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                        />
                    ))}
                </div>
            </section>

            {/* Shop by Categories */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Shop by Category</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Discover our diverse collection of sarees, each carefully curated for different occasions and styles
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enhancedCategories.map((category) => {
                            const IconComponent = category.icon;
                            return (
                                <div
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.slug)}
                                    className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                >
                                    <div className="aspect-w-16 aspect-h-9">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="p-2.5 bg-pink-50 rounded-xl mr-3">
                                                <IconComponent className="h-6 w-6 text-pink-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{category.name}</h3>
                                                <p className="text-sm text-gray-500">{category.description}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-pink-600 font-semibold mb-3">{category.priceRange}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {category.subCategories.slice(0, 3).map((sub, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium"
                                                >
                                                    {sub}
                                                </span>
                                            ))}
                                            {category.subCategories.length > 3 && (
                                                <span className="text-xs text-gray-500 font-medium">+{category.subCategories.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Shop by Features */}
            <section className="py-24 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Shop by Features</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Find your perfect saree with our advanced filtering options
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {shopByFeatures.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className={`${feature.bgColor} rounded-2xl p-6 hover:shadow-lg border border-transparent hover:border-gray-200 transition-all`}
                                >
                                    <div className="flex items-center mb-5">
                                        <IconComponent className={`h-6 w-6 ${feature.iconColor} mr-3`} />
                                        <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                                    </div>
                                    <div className="space-y-2.5">
                                        {feature.items.map((item, itemIndex) => (
                                            <button
                                                key={itemIndex}
                                                onClick={() => handleFeatureClick(feature, item)}
                                                className="block w-full text-left text-sm text-gray-700 hover:text-pink-600 transition-colors font-medium py-1"
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Regional Collections */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Regional Collections</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Authentic sarees from India's rich textile heritage
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {regionalCollections.map((collection, index) => (
                            <Link
                                key={index}
                                to={`/products?region=${collection.slug}`}
                                className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all overflow-hidden transform hover:-translate-y-1"
                            >
                                <div className="aspect-w-16 aspect-h-10">
                                    <img
                                        src={collection.image}
                                        alt={collection.name}
                                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-1">{collection.name}</h3>
                                    <p className="text-sm text-gray-600 mb-1">{collection.region}</p>
                                    <p className="text-xs text-pink-600">{collection.specialty}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-20 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-16">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                                Featured Products
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Handpicked collection of our best sarees
                            </p>
                        </div>
                        <Link
                            to="/products"
                            className="hidden md:flex items-center text-pink-600 hover:text-pink-700 font-semibold transition-colors group"
                        >
                            View All Products
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, index) => (
                                <ProductCardSkeleton key={index} />
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                                <p className="text-red-600 mb-4">Failed to load featured products</p>
                                <p className="text-sm text-red-500 mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && featuredProducts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {!loading && !error && featuredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                                <Package className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                                <p className="text-yellow-800 mb-2">No featured products available</p>
                                <p className="text-sm text-yellow-600 mb-4">
                                    Products may still be loading or need to be uploaded to the database.
                                </p>
                                <Link
                                    to="/admin"
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                >
                                    Go to Admin Panel
                                </Link>
                            </div>
                        </div>
                    )}

                    {featuredProducts.length > 0 && (
                        <div className="mt-8 text-center md:hidden">
                            <Link
                                to="/products"
                                className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors"
                            >
                                View All Products
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full text-white mb-4">
                                        <IconComponent className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                                    <p className="text-gray-600">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-pink-600 to-purple-700 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Experience Traditional Elegance
                    </h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto">
                        Join thousands of satisfied customers who trust {COMPANY_INFO.name} for authentic,
                        high-quality sarees that celebrate Indian heritage and craftsmanship.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/products"
                            className="inline-flex items-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Start Shopping
                        </Link>
                        <Link
                            to="/products?featured=true"
                            className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-pink-600 transition-colors"
                        >
                            <Heart className="mr-2 h-5 w-5" />
                            View Collection
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;