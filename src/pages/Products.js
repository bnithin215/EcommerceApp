// Fixed Products.js - Compatible with existing ProductList component

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Filter,
    X,
    ChevronDown,
    SlidersHorizontal
} from 'lucide-react';
import ProductList from '../components/products/ProductList';
import { PageLoader } from '../components/common/Loader';
import { productAPI } from '../services/api';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import { debounce } from '../utils/helpers';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [totalProducts, setTotalProducts] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const PRODUCTS_PER_PAGE = 20; // Limit products per page for better performance

    // Advanced filter options
    const filterOptions = {
        categories: PRODUCT_CATEGORIES,
        fabrics: [
            'Silk', 'Cotton', 'Georgette', 'Chiffon', 'Crepe', 'Linen', 'Net', 'Organza'
        ],
        occasions: [
            'Wedding', 'Party', 'Festival', 'Office', 'Casual', 'Religious', 'Reception'
        ],
        colors: [
            'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Black', 'White', 'Orange',
            'Purple', 'Maroon', 'Gold', 'Silver'
        ],
        priceRanges: [
            { label: 'Under ₹1,000', min: 0, max: 1000 },
            { label: '₹1,000 - ₹3,000', min: 1000, max: 3000 },
            { label: '₹3,000 - ₹5,000', min: 3000, max: 5000 },
            { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
            { label: 'Above ₹10,000', min: 10000, max: null }
        ],
        sortOptions: [
            { value: 'popularity', label: 'Popularity' },
            { value: 'newest', label: 'Newest First' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
            { value: 'rating', label: 'Customer Rating' },
            { value: 'discount', label: 'Discount' }
        ]
    };

    // Get current filters from URL
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const fabric = searchParams.get('fabric');
    const occasion = searchParams.get('occasion');
    const color = searchParams.get('color');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'popularity';

    // Memoize filter params to avoid unnecessary re-renders
    // For small datasets or no filters, load all products. For filtered/searched results, use pagination
    const filterParams = useMemo(() => {
        // Check if any actual filters are applied (excluding 'all' category)
        const hasActualFilters = (category && category !== 'all') || search || fabric || occasion || color || minPrice || maxPrice;
        const params = {};
        
        // Only apply small limit if we have filters or search (pagination for filtered results)
        // Otherwise, load more products (100) for better UX with small-medium catalogs
        if (hasActualFilters) {
            params.limit = PRODUCTS_PER_PAGE; // 20 for filtered results
        } else {
            // Load up to 100 products initially when viewing all products (covers catalogs up to 100 products)
            params.limit = 100;
        }
        
        // Only add category filter if it's not 'all' and not empty
        if (category && category !== 'all') {
            params.category = category;
        }
        if (search) params.search = search;
        if (fabric) params.fabric = fabric;
        if (occasion) params.occasion = occasion;
        if (color) params.color = color;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sortBy) params.sortBy = sortBy;
        return params;
    }, [category, search, fabric, occasion, color, minPrice, maxPrice, sortBy]);

    // Load products function with caching and optimized loading
    const loadProducts = useCallback(async (params, resetPage = true) => {
        try {
            setLoading(true);
            if (resetPage) {
                setProducts([]);
            }

            // Create cache key from params (excluding limit for cache consistency)
            const cacheParams = { ...params };
            delete cacheParams.limit;
            const cacheKey = `products_${JSON.stringify(cacheParams)}`;
            const cached = sessionStorage.getItem(cacheKey);
            
            // Use cache if available and less than 2 minutes old (only for initial load)
            if (cached && resetPage) {
                try {
                    const cachedData = JSON.parse(cached);
                    const cacheTime = cachedData.timestamp || 0;
                    const now = Date.now();
                    if (now - cacheTime < 2 * 60 * 1000) {
                        // Use all cached products (they're already filtered)
                        const cachedProducts = cachedData.products || [];
                        setProducts(cachedProducts);
                        setTotalProducts(cachedData.total || cachedProducts.length);
                        
                        // Determine if there are more products to load
                        const hasFilters = params.category || params.search || params.fabric || params.occasion || params.color || params.minPrice || params.maxPrice;
                        if (hasFilters) {
                            setHasMore(cachedProducts.length >= (params.limit || PRODUCTS_PER_PAGE));
                        } else {
                            setHasMore(cachedProducts.length === (params.limit || 100));
                        }
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    // Cache invalid, continue to fetch
                }
            }

            console.log('Loading products with params:', params);

            const response = await productAPI.getAllProducts(params);
            let newProducts = response.products || [];
            
            // For "Load More", we replace products since Firestore returns from the start with higher limit
            // The client-side filters will ensure we show the correct filtered results
            setProducts(newProducts);
            
            // Cache results (only on initial load or when filters change)
            if (resetPage) {
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify({
                        products: newProducts,
                        total: response.total || newProducts.length,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    // Ignore cache errors (sessionStorage might be full)
                }
            }
            
            setTotalProducts(response.total || newProducts.length);
            // Show "Load More" only if we got exactly the limit (indicating there might be more)
            // For unfiltered results with limit 100, assume we got all if less than 100
            const hasFilters = params.category || params.search || params.fabric || params.occasion || params.color || params.minPrice || params.maxPrice;
            if (hasFilters) {
                // For filtered results, show "Load More" if we got a full page
                setHasMore(newProducts.length >= (params.limit || PRODUCTS_PER_PAGE));
            } else {
                // For unfiltered results, only show "Load More" if we got exactly the limit (100)
                setHasMore(newProducts.length === (params.limit || 100));
            }

        } catch (error) {
            console.error('Error loading products:', error);
            if (resetPage) {
                setProducts([]);
                setTotalProducts(0);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search function
    const debouncedLoadProducts = useMemo(
        () => debounce((params, resetPage) => {
            loadProducts(params, resetPage);
        }, 300),
        [loadProducts]
    );

    // Load products when filters change
    useEffect(() => {
        loadProducts(filterParams, true);
    }, [filterParams, loadProducts]);

    // Load more products (pagination)
    // Fetch more products with increased limit
    const loadMoreProducts = useCallback(() => {
        if (!loading) {
            const currentLimit = filterParams.limit || PRODUCTS_PER_PAGE;
            const nextLimit = currentLimit + PRODUCTS_PER_PAGE;
            const nextPageParams = {
                ...filterParams,
                limit: nextLimit
            };
            loadProducts(nextPageParams, false);
        }
    }, [loading, filterParams, loadProducts]);

    // Update URL with filter changes
    const updateFilters = (newFilters) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        setSearchParams(params);
    };

    // Handle filter changes (optimized)
    const handleFilterChange = useCallback((filterType, value) => {
        const currentFilters = {
            category,
            search,
            fabric,
            occasion,
            color,
            minPrice,
            maxPrice,
            sortBy
        };

        if (filterType === 'category') {
            currentFilters.category = value;
        } else if (filterType === 'fabric') {
            currentFilters.fabric = currentFilters.fabric === value ? null : value;
        } else if (filterType === 'occasion') {
            currentFilters.occasion = currentFilters.occasion === value ? null : value;
        } else if (filterType === 'color') {
            currentFilters.color = currentFilters.color === value ? null : value;
        } else if (filterType === 'priceRange') {
            currentFilters.minPrice = value.min || null;
            currentFilters.maxPrice = value.max || null;
        } else if (filterType === 'sort') {
            currentFilters.sortBy = value;
        }

        updateFilters(currentFilters);
    }, [category, search, fabric, occasion, color, minPrice, maxPrice, sortBy]);

    // Clear specific filter
    const clearFilter = (filterType) => {
        const currentFilters = {
            category,
            search,
            fabric,
            occasion,
            color,
            minPrice,
            maxPrice,
            sortBy
        };

        if (filterType === 'price') {
            delete currentFilters.minPrice;
            delete currentFilters.maxPrice;
        } else {
            delete currentFilters[filterType];
        }

        updateFilters(currentFilters);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchParams({});
    };

    // Get active filters count
    const getActiveFiltersCount = () => {
        let count = 0;
        if (category && category !== 'all') count++;
        if (fabric) count++;
        if (occasion) count++;
        if (color) count++;
        if (minPrice || maxPrice) count++;
        return count;
    };

    // Get current category info
    const currentCategory = PRODUCT_CATEGORIES.find(cat => cat.slug === category) ||
        PRODUCT_CATEGORIES[0];

    const FilterSection = ({ title, children, defaultOpen = false }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);

        return (
            <div className="border-b border-gray-200 pb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full py-2 text-left"
                >
                    <span className="font-medium text-gray-900">{title}</span>
                    <ChevronDown className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <div className="mt-3">{children}</div>}
            </div>
        );
    };

    // Don't show full page loader if we're loading more products (pagination)
    const isLoadingInitial = loading && products.length === 0;

    if (isLoadingInitial) {
        return <PageLoader message="Loading products..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {search ? `Search Results for "${search}"` : currentCategory.name}
                    </h1>
                    {currentCategory.description && !search && (
                        <p className="text-gray-600">{currentCategory.description}</p>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-between w-full bg-white p-4 rounded-lg shadow-sm border"
                        >
                            <div className="flex items-center">
                                <SlidersHorizontal className="h-5 w-5 mr-2" />
                                <span className="font-medium">Filters</span>
                                {getActiveFiltersCount() > 0 && (
                                    <span className="ml-2 bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </div>
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Filters Sidebar */}
                    <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                {getActiveFiltersCount() > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-pink-600 hover:text-pink-700"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Active Filters */}
                            {getActiveFiltersCount() > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">Active Filters:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {category && category !== 'all' && (
                                            <span className="inline-flex items-center bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full">
                                                {filterOptions.categories.find(c => c.slug === category)?.name}
                                                <button onClick={() => clearFilter('category')} className="ml-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )}
                                        {fabric && (
                                            <span className="inline-flex items-center bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                                {fabric}
                                                <button onClick={() => clearFilter('fabric')} className="ml-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )}
                                        {occasion && (
                                            <span className="inline-flex items-center bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                {occasion}
                                                <button onClick={() => clearFilter('occasion')} className="ml-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )}
                                        {color && (
                                            <span className="inline-flex items-center bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                                                {color}
                                                <button onClick={() => clearFilter('color')} className="ml-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )}
                                        {(minPrice || maxPrice) && (
                                            <span className="inline-flex items-center bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                                                ₹{minPrice || 0} - ₹{maxPrice || '∞'}
                                                <button onClick={() => clearFilter('price')} className="ml-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Category Filter */}
                            <FilterSection title="Categories" defaultOpen={true}>
                                <div className="space-y-2">
                                    {filterOptions.categories.map((cat) => (
                                        <label key={cat.slug} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat.slug}
                                                checked={category === cat.slug || (!category && cat.slug === 'all')}
                                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Fabric Filter */}
                            <FilterSection title="Fabric">
                                <div className="space-y-2">
                                    {filterOptions.fabrics.map((fabricOption) => (
                                        <label key={fabricOption} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={fabric === fabricOption}
                                                onChange={() => handleFilterChange('fabric', fabricOption)}
                                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{fabricOption}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Occasion Filter */}
                            <FilterSection title="Occasion">
                                <div className="space-y-2">
                                    {filterOptions.occasions.map((occasionOption) => (
                                        <label key={occasionOption} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={occasion === occasionOption}
                                                onChange={() => handleFilterChange('occasion', occasionOption)}
                                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{occasionOption}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Color Filter */}
                            <FilterSection title="Color">
                                <div className="grid grid-cols-3 gap-2">
                                    {filterOptions.colors.map((colorOption) => (
                                        <button
                                            key={colorOption}
                                            onClick={() => handleFilterChange('color', colorOption)}
                                            className={`p-2 text-xs rounded border transition-colors ${
                                                color === colorOption
                                                    ? 'bg-pink-100 border-pink-500 text-pink-700'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            {colorOption}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Price Range Filter */}
                            <FilterSection title="Price Range">
                                <div className="space-y-2">
                                    {filterOptions.priceRanges.map((priceRange, index) => (
                                        <label key={index} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="priceRange"
                                                checked={
                                                    (minPrice == priceRange.min || (!minPrice && priceRange.min === 0)) &&
                                                    (maxPrice == priceRange.max || (!maxPrice && priceRange.max === null))
                                                }
                                                onChange={() => handleFilterChange('priceRange', priceRange)}
                                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{priceRange.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>
                        </div>
                    </div>

                    {/* Products Content */}
                    <div className="flex-1">
                        {/* Sort and View Options */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                                <span className="text-sm text-gray-600">
                                    {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
                                </span>
                            </div>

                            <div className="flex items-center space-x-4">
                                {/* Sort Dropdown */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                                        className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        {filterOptions.sortOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Products List - Using your existing component */}
                        <ProductList
                            products={products}
                            loading={loading && products.length === 0}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            emptyMessage={search ? "No products found for your search" : "No products found with current filters"}
                            emptyDescription={search ? "Try different keywords or browse our categories" : "Try adjusting your filters or browse our full collection"}
                        />

                        {/* Load More Button */}
                        {hasMore && products.length > 0 && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={loadMoreProducts}
                                    disabled={loading}
                                    className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Loading...' : 'Load More Products'}
                                </button>
                            </div>
                        )}

                        {/* Loading indicator for pagination */}
                        {loading && products.length > 0 && (
                            <div className="mt-8 text-center">
                                <div className="inline-flex items-center text-gray-600">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600 mr-2"></div>
                                    Loading more products...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;