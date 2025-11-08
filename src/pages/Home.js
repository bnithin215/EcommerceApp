// Enhanced Home.js with Kala Mandir inspired features

import React, { useState, useEffect, useCallback } from 'react';
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
import { getImageUrl } from '../utils/helpers';

// Enhanced Categories with more details and fallback images
    const enhancedCategories = [
        {
            id: 'silk',
            name: 'Silk Sarees',
            slug: 'silk',
            description: 'Premium silk collection',
            fallbackImage: 'https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1587',
            icon: Crown,
            subCategories: ['Banarasi', 'Kanchipuram', 'South Silk', 'Art Silk'],
            priceRange: '₹2,000 - ₹15,000'
        },
        {
            id: 'cotton',
            name: 'Cotton Sarees',
            slug: 'cotton',
            description: 'Comfortable everyday wear',
            fallbackImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop',
            icon: Shirt,
            subCategories: ['Handloom', 'Printed', 'Block Print', 'Organic'],
            priceRange: '₹500 - ₹3,000'
        },
        {
            id: 'designer',
            name: 'Designer Collection',
            slug: 'designer',
            description: 'Latest designer trends',
            fallbackImage: 'https://images.unsplash.com/photo-1737972994636-39b386c28a10?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1564',
            icon: Sparkles,
            subCategories: ['Contemporary', 'Fusion', 'Party Wear', 'Indo-Western'],
            priceRange: '₹3,000 - ₹20,000'
        },
        {
            id: 'wedding',
            name: 'Bridal Collection',
            slug: 'wedding',
            description: 'Special wedding sarees',
            fallbackImage: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=300&fit=crop',
            icon: Heart,
            subCategories: ['Heavy Work', 'Traditional', 'Reception', 'Engagement'],
            priceRange: '₹5,000 - ₹50,000'
        },
        {
            id: 'casual',
            name: 'Casual Wear',
            slug: 'casual',
            description: 'Everyday elegance',
            fallbackImage: 'https://images.unsplash.com/photo-1654764746164-66b1e3aa04b8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1530',
            icon: Package,
            subCategories: ['Office Wear', 'Daily Use', 'Simple Elegance', 'Comfortable'],
            priceRange: '₹800 - ₹2,500'
        },
        {
            id: 'party',
            name: 'Party Wear',
            slug: 'party',
            description: 'Festive & party collection',
            fallbackImage: 'https://images.unsplash.com/photo-1760080839464-8dbe9468cb3f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1587',
            icon: Star,
            subCategories: ['Embellished', 'Sequin Work', 'Heavy Border', 'Festive'],
            priceRange: '₹2,500 - ₹12,000'
        }
    ];

const Home = () => {
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [categoryImages, setCategoryImages] = useState({});
    const [loadingCategoryImages, setLoadingCategoryImages] = useState(true);
    const [heroSlides, setHeroSlides] = useState([]);
    const [loadingHeroSlides, setLoadingHeroSlides] = useState(true);

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

    // Hero slides fallback data (used if no products found in database)
    const heroSlidesFallback = [
        {
            id: 1,
            title: "Elegant Silk Sarees",
            subtitle: "Discover our premium collection",
            description: "Handcrafted silk sarees with intricate designs perfect for special occasions",
            image: "https://images.unsplash.com/photo-1610030469978-6bb537f3b982?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            cta: "Shop Silk Collection",
            link: "/products?category=silk",
            category: "silk"
        },
        {
            id: 2,
            title: "Designer Collection",
            subtitle: "Latest trends in fashion",
            description: "Contemporary designer sarees that blend tradition with modern aesthetics",
            image: "https://images.unsplash.com/photo-1596706487679-9f95f5891975?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.1",
            cta: "Explore Designer Range",
            link: "/products?category=designer",
            category: "designer"
        },
        {
            id: 3,
            title: "Cotton Comfort",
            subtitle: "Everyday elegance",
            description: "Breathable cotton sarees perfect for daily wear and comfort",
            image: "https://images.unsplash.com/photo-1623456436606-3930259e7ba5?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.1",
            cta: "Shop Cotton Collection",
            link: "/products?category=cotton",
            category: "cotton"
        }
    ];

    // Preload images function
    const preloadImage = useCallback((src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }, []);

    // Preload hero slide images function
    const preloadHeroImages = useCallback(async (slides) => {
        if (!slides || slides.length === 0) return;
        
        // Preload first 2 slides immediately (critical)
        const criticalSlides = slides.slice(0, 2);
        await Promise.all(
            criticalSlides.map(slide => 
                preloadImage(slide.image).catch(err => {
                    console.warn('Failed to preload image:', slide.image, err);
                })
            )
        );

        // Preload remaining slides in background (non-blocking)
        const remainingSlides = slides.slice(2);
        remainingSlides.forEach(slide => {
            setTimeout(() => {
                preloadImage(slide.image).catch(err => {
                    console.warn('Failed to preload image:', slide.image, err);
                });
            }, 100); // Small delay to not block critical images
        });
    }, [preloadImage]);

    // Preload hero slide images when they change
    useEffect(() => {
        if (heroSlides.length > 0) {
            preloadHeroImages(heroSlides);
        }
    }, [heroSlides, preloadHeroImages]);

    // Load hero slides dynamically from database
    useEffect(() => {
        const loadHeroSlides = async () => {
            try {
                setLoadingHeroSlides(true);
                const slides = [];

                // Categories to feature in hero slides
                const heroCategories = [
                    { slug: 'silk', title: 'Elegant Silk Sarees', subtitle: 'Discover our premium collection', description: 'Handcrafted silk sarees with intricate designs perfect for special occasions', cta: 'Shop Silk Collection' },
                    { slug: 'designer', title: 'Designer Collection', subtitle: 'Latest trends in fashion', description: 'Contemporary designer sarees that blend tradition with modern aesthetics', cta: 'Explore Designer Range' },
                    { slug: 'cotton', title: 'Cotton Comfort', subtitle: 'Everyday elegance', description: 'Breathable cotton sarees perfect for daily wear and comfort', cta: 'Shop Cotton Collection' },
                    { slug: 'party', title: 'Party Wear', subtitle: 'Festive collection', description: 'Stunning party wear sarees for your special occasions', cta: 'Shop Party Collection' },
                    { slug: 'wedding', title: 'Bridal Collection', subtitle: 'Special wedding sarees', description: 'Exquisite bridal sarees for your special day', cta: 'Shop Bridal Collection' }
                ];

                // Load featured products from each category (optimized - load only 1 product per category)
                await Promise.all(
                    heroCategories.map(async (category, index) => {
                        try {
                            // Try to get a featured product from this category (limit to 1 for performance)
                            const products = await productAPI.getAllProducts({
                                category: category.slug,
                                limit: 1
                            });

                            let selectedProduct = null;
                            let productImage = null;

                            if (products && products.products && products.products.length > 0) {
                                selectedProduct = products.products[0];
                                
                                // Get the first valid image from the product
                                if (selectedProduct.images && Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0) {
                                    const validImages = selectedProduct.images.filter(img => 
                                        img && img !== '' && img !== 'undefined' && img !== 'null'
                                    );
                                    if (validImages.length > 0) {
                                        productImage = validImages[0];
                                    }
                                } else if (selectedProduct.image && selectedProduct.image !== '' && selectedProduct.image !== 'undefined' && selectedProduct.image !== 'null') {
                                    productImage = selectedProduct.image;
                                } else if (selectedProduct.imageUrl && selectedProduct.imageUrl !== '' && selectedProduct.imageUrl !== 'undefined' && selectedProduct.imageUrl !== 'null') {
                                    productImage = selectedProduct.imageUrl;
                                }
                            }

                            // Use product image if available, otherwise use fallback
                            const fallbackSlide = heroSlidesFallback.find(s => s.category === category.slug) || heroSlidesFallback[index % heroSlidesFallback.length];
                            const slideImage = productImage || fallbackSlide.image;

                            slides.push({
                                id: index + 1,
                                title: category.title,
                                subtitle: category.subtitle,
                                description: category.description,
                                image: getImageUrl(slideImage),
                                cta: category.cta,
                                link: `/products?category=${category.slug}`,
                                category: category.slug,
                                isFromDatabase: !!productImage
                            });
                        } catch (error) {
                            console.warn(`Error loading hero slide for category ${category.slug}:`, error);
                            // Use fallback slide
                            const fallbackSlide = heroSlidesFallback.find(s => s.category === category.slug) || heroSlidesFallback[index % heroSlidesFallback.length];
                            slides.push({
                                ...fallbackSlide,
                                image: getImageUrl(fallbackSlide.image),
                                isFromDatabase: false
                            });
                        }
                    })
                );

                // If we got slides from database, use them; otherwise use fallback
                if (slides.length > 0) {
                    // Limit to top 3-5 slides for better UX and performance
                    const finalSlides = slides.slice(0, 5);
                    setHeroSlides(finalSlides);
                    
                    // Preload images immediately
                    preloadHeroImages(finalSlides);
                } else {
                    // Use fallback slides
                    const fallbackSlides = heroSlidesFallback.map(slide => ({
                        ...slide,
                        image: getImageUrl(slide.image),
                        isFromDatabase: false
                    }));
                    setHeroSlides(fallbackSlides);
                    preloadHeroImages(fallbackSlides);
                }

                console.log('Hero slides loaded:', slides.length);
            } catch (error) {
                console.error('Error loading hero slides:', error);
                // Use fallback slides on error
                const fallbackSlides = heroSlidesFallback.map(slide => ({
                    ...slide,
                    image: getImageUrl(slide.image),
                    isFromDatabase: false
                }));
                setHeroSlides(fallbackSlides);
                preloadHeroImages(fallbackSlides);
            } finally {
                setLoadingHeroSlides(false);
            }
        };

        loadHeroSlides();
    }, []);

    // Load category images from database (optimized - load only 1 product per category)
    useEffect(() => {
        const loadCategoryImages = async () => {
            try {
                setLoadingCategoryImages(true);
                const imagesMap = {};

                // Load one product from each category to get the image (optimized - limit to 1)
                await Promise.all(
                    enhancedCategories.map(async (category) => {
                        try {
                            // Get only 1 product from this category for performance
                            const products = await productAPI.getAllProducts({
                                category: category.slug,
                                limit: 1
                            });

                            if (products && products.products && products.products.length > 0) {
                                const product = products.products[0];
                                // Get the first valid image from the product
                                let productImage = null;
                                if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                                    // Filter out invalid images
                                    const validImages = product.images.filter(img => 
                                        img && img !== '' && img !== 'undefined' && img !== 'null'
                                    );
                                    if (validImages.length > 0) {
                                        productImage = validImages[0];
                                    }
                                } else if (product.image && product.image !== '' && product.image !== 'undefined' && product.image !== 'null') {
                                    productImage = product.image;
                                } else if (product.imageUrl && product.imageUrl !== '' && product.imageUrl !== 'undefined' && product.imageUrl !== 'null') {
                                    productImage = product.imageUrl;
                                }

                                // Only use if it's a valid image URL
                                if (productImage) {
                                    imagesMap[category.slug] = productImage;
                                    // Preload category image in background
                                    setTimeout(() => {
                                        preloadImage(getImageUrl(productImage)).catch(() => {});
                                    }, 200);
                                }
                            }
                        } catch (error) {
                            console.warn(`Error loading image for category ${category.slug}:`, error);
                            // Continue with fallback image
                        }
                    })
                );

                setCategoryImages(imagesMap);
            } catch (error) {
                console.error('Error loading category images:', error);
            } finally {
                setLoadingCategoryImages(false);
            }
        };

        loadCategoryImages();
    }, [preloadImage]);

    // Load featured products (optimized with caching)
    useEffect(() => {
        const loadFeaturedProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check cache first (simple in-memory cache)
                const cacheKey = 'featured_products';
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    try {
                        const cachedData = JSON.parse(cached);
                        const cacheTime = cachedData.timestamp || 0;
                        const now = Date.now();
                        // Use cache if less than 5 minutes old
                        if (now - cacheTime < 5 * 60 * 1000) {
                            setFeaturedProducts(cachedData.products || []);
                            setLoading(false);
                            // Preload images in background
                            cachedData.products?.slice(0, 4).forEach(product => {
                                const image = product.images?.[0] || product.image || product.imageUrl;
                                if (image) {
                                    setTimeout(() => {
                                        preloadImage(getImageUrl(image)).catch(() => {});
                                    }, 100);
                                }
                            });
                            return;
                        }
                    } catch (e) {
                        // Cache invalid, continue to fetch
                    }
                }

                // Try to get featured products first (limit to 8 for performance)
                const response = await productAPI.getFeaturedProducts(8);

                if (response && response.length > 0) {
                    setFeaturedProducts(response);
                    // Cache the results
                    try {
                        sessionStorage.setItem(cacheKey, JSON.stringify({
                            products: response,
                            timestamp: Date.now()
                        }));
                    } catch (e) {
                        // Ignore cache errors
                    }
                    // Preload first 4 product images in background
                    response.slice(0, 4).forEach((product, index) => {
                        const image = product.images?.[0] || product.image || product.imageUrl;
                        if (image) {
                            setTimeout(() => {
                                preloadImage(getImageUrl(image)).catch(() => {});
                            }, index * 100); // Stagger image preloading
                        }
                    });
                } else {
                    // Load limited products if no featured products found
                    const allProducts = await productAPI.getAllProducts({ limit: 8 });
                    if (allProducts && allProducts.products && allProducts.products.length > 0) {
                        const featured = allProducts.products.slice(0, 8);
                        setFeaturedProducts(featured);
                        // Preload first 4 product images with staggered timing
                        featured.slice(0, 4).forEach((product, index) => {
                            const image = product.images?.[0] || product.image || product.imageUrl;
                            if (image) {
                                setTimeout(() => {
                                    preloadImage(getImageUrl(image)).catch(() => {});
                                }, index * 100);
                            }
                        });
                    } else {
                        setFeaturedProducts([]);
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
    }, [preloadImage]);

    // Calculate the actual number of slides to display
    const slidesCount = heroSlides.length > 0 ? heroSlides.length : heroSlidesFallback.length;

    // Preload next slide image
    useEffect(() => {
        if (heroSlides.length === 0) return;
        
        const nextSlideIndex = (currentSlide + 1) % heroSlides.length;
        if (heroSlides[nextSlideIndex]) {
            // Preload next slide image
            preloadImage(heroSlides[nextSlideIndex].image).catch(() => {});
        }
    }, [currentSlide, heroSlides, preloadImage]);

    // Auto-slide effect
    useEffect(() => {
        if (slidesCount === 0) return;
        
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slidesCount);
        }, 5000);

        return () => clearInterval(timer);
    }, [slidesCount]);

    const nextSlide = () => {
        if (slidesCount === 0) return;
        setCurrentSlide((prev) => (prev + 1) % slidesCount);
    };

    const prevSlide = () => {
        if (slidesCount === 0) return;
        setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount);
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

    // Use fallback slides if hero slides are still loading or empty
    const displaySlides = heroSlides.length > 0 ? heroSlides : heroSlidesFallback.map(slide => ({
        ...slide,
        image: getImageUrl(slide.image),
        isFromDatabase: false
    }));

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen overflow-hidden">
                {loadingHeroSlides && heroSlides.length === 0 ? (
                    // Loading state
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p className="text-lg">Loading hero slides...</p>
                        </div>
                    </div>
                ) : (
                    displaySlides.map((slide, index) => (
                        <div
                            key={slide.id || index}
                        className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                            index === currentSlide ? 'translate-x-0' :
                                index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                        }`}
                    >
                            <div className="absolute inset-0 overflow-hidden">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    fetchPriority={index === 0 ? "high" : index === 1 ? "high" : "low"}
                                    loading={index === 0 || index === 1 ? "eager" : "lazy"}
                                    decoding="async"
                                    onError={(e) => {
                                        // If image fails to load, use fallback
                                        const fallbackSlide = heroSlidesFallback.find(s => s.category === slide.category) || heroSlidesFallback[0];
                                        if (fallbackSlide && e.target.src !== getImageUrl(fallbackSlide.image)) {
                                            e.target.src = getImageUrl(fallbackSlide.image);
                                        }
                                    }}
                                />
                        </div>

                        <div className="relative z-10 flex items-center justify-center h-full">
                                <div className="container mx-auto px-4 text-center">
                                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-white animate-fadeInUp" style={{
                                        textShadow: '3px 3px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.7), 0 0 50px rgba(0,0,0,0.5)'
                                    }}>
                                    {slide.title}
                                </h1>
                                    <p className="text-lg md:text-xl lg:text-2xl mb-3 md:mb-4 text-white font-semibold animate-fadeInUp animation-delay-200" style={{
                                        textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6), 0 0 30px rgba(0,0,0,0.4)'
                                    }}>
                                    {slide.subtitle}
                                </p>
                                    <p className="text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto text-white animate-fadeInUp animation-delay-400 leading-relaxed" style={{
                                        textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6), 0 0 25px rgba(0,0,0,0.4)'
                                    }}>
                                    {slide.description}
                                </p>
                                <Link
                                    to={slide.link}
                                        className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 animate-fadeInUp animation-delay-600 shadow-lg hover:shadow-xl"
                                >
                                    {slide.cta}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    ))
                )}

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
                {displaySlides.length > 0 && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                        {displaySlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                        />
                    ))}
                </div>
                )}
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
                            // Use dynamic image from database if available, otherwise use fallback
                            const categoryImage = categoryImages[category.slug] || category.fallbackImage;
                            const imageUrl = getImageUrl(categoryImage);
                            
                            return (
                                <div
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.slug)}
                                    className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                >
                                    <div className="aspect-w-16 aspect-h-9 relative bg-gray-100">
                                        <img
                                            key={`${category.slug}-${categoryImages[category.slug] ? 'db' : 'fallback'}`}
                                            src={imageUrl}
                                            alt={category.name}
                                            className="w-full h-48 object-cover group-hover:scale-110 transition-all duration-300"
                                            loading="lazy"
                                            decoding="async"
                                            fetchPriority="low"
                                            onError={(e) => {
                                                // If database image fails, try fallback
                                                if (categoryImages[category.slug] && e.target.src !== category.fallbackImage) {
                                                    e.target.src = getImageUrl(category.fallbackImage);
                                                } else {
                                                    // Final fallback to placeholder
                                                    e.target.src = 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=' + encodeURIComponent(category.name);
                                                }
                                            }}
                                        />
                                        {loadingCategoryImages && !categoryImages[category.slug] && (
                                            <div className="absolute inset-0 bg-black bg-opacity-5 flex items-center justify-center pointer-events-none">
                                                <div className="bg-white bg-opacity-80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-gray-600 font-medium shadow-sm">
                                                    Loading from database...
                                                </div>
                                            </div>
                                        )}
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
                                <div className="aspect-w-16 aspect-h-10 relative">
                                    <img
                                        src={collection.image}
                                        alt={collection.name}
                                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                                        loading="lazy"
                                        decoding="async"
                                        fetchPriority="low"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=' + encodeURIComponent(collection.name);
                                        }}
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