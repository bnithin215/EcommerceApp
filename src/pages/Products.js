// Fixed Products.js - Compatible with existing ProductList component

import React, { useState, useEffect } from 'react';
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

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [totalProducts, setTotalProducts] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

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

    // Load products
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);

                const params = {};
                if (category && category !== 'all') params.category = category;
                if (search) params.search = search;
                if (fabric) params.fabric = fabric;
                if (occasion) params.occasion = occasion;
                if (color) params.color = color;
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;
                if (sortBy) params.sortBy = sortBy;

                console.log('Loading products with params:', params);

                const response = await productAPI.getAllProducts(params);
                setProducts(response.products || []);
                setTotalProducts(response.total || response.products?.length || 0);

            } catch (error) {
                console.error('Error loading products:', error);
                setProducts([]);
                setTotalProducts(0);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [category, search, fabric, occasion, color, minPrice, maxPrice, sortBy]);

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

    // Handle filter changes
    const handleFilterChange = (filterType, value) => {
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
    };

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

    if (loading) {
        return <PageLoader message="Loading products..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border">
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
                            loading={loading}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            emptyMessage={search ? "No products found for your search" : "No products found with current filters"}
                            emptyDescription={search ? "Try different keywords or browse our categories" : "Try adjusting your filters or browse our full collection"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;