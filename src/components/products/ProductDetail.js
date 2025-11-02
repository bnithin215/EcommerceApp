import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, SortAsc, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { CardSkeleton } from '../common/Loader';
import { SORT_OPTIONS, PRICE_RANGES, FABRIC_TYPES, COLORS } from '../../utils/constants';
import { sortArray } from '../../utils/helpers';

const ProductList = ({
                         products = [],
                         loading = false,
                         viewMode = 'grid',
                         onViewModeChange,
                         showFilters = true,
                         initialFilters = {}
                     }) => {
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [sortBy, setSortBy] = useState('featured');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [filters, setFilters] = useState({
        priceRange: null,
        fabrics: [],
        colors: [],
        inStock: false,
        rating: 0,
        ...initialFilters
    });

    // Update filtered products when products or filters change
    useEffect(() => {
        let filtered = [...products];

        // Apply filters
        if (filters.priceRange) {
            filtered = filtered.filter(product =>
                product.price >= filters.priceRange.min &&
                (filters.priceRange.max === Infinity || product.price <= filters.priceRange.max)
            );
        }

        if (filters.fabrics.length > 0) {
            filtered = filtered.filter(product =>
                filters.fabrics.includes(product.fabric)
            );
        }

        if (filters.colors.length > 0) {
            filtered = filtered.filter(product =>
                product.colors && product.colors.some(color => filters.colors.includes(color))
            );
        }

        if (filters.inStock) {
            filtered = filtered.filter(product => product.inStock > 0);
        }

        if (filters.rating > 0) {
            filtered = filtered.filter(product =>
                product.rating && product.rating >= filters.rating
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'price_low_high':
                filtered = sortArray(filtered, 'price', 'asc');
                break;
            case 'price_high_low':
                filtered = sortArray(filtered, 'price', 'desc');
                break;
            case 'rating':
                filtered = sortArray(filtered, 'rating', 'desc');
                break;
            case 'newest':
                filtered = sortArray(filtered, 'createdAt', 'desc');
                break;
            case 'popularity':
                filtered = sortArray(filtered, 'reviews', 'desc');
                break;
            default:
                // Keep original order for 'featured'
                break;
        }

        setFilteredProducts(filtered);
    }, [products, filters, sortBy]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => {
            const newFilters = { ...prev };

            if (filterType === 'priceRange') {
                newFilters.priceRange = newFilters.priceRange?.id === value.id ? null : value;
            } else if (filterType === 'fabrics' || filterType === 'colors') {
                const currentValues = newFilters[filterType];
                if (currentValues.includes(value)) {
                    newFilters[filterType] = currentValues.filter(v => v !== value);
                } else {
                    newFilters[filterType] = [...currentValues, value];
                }
            } else if (filterType === 'inStock') {
                newFilters.inStock = !newFilters.inStock;
            } else if (filterType === 'rating') {
                newFilters.rating = newFilters.rating === value ? 0 : value;
            }

            return newFilters;
        });
    };

    const clearFilters = () => {
        setFilters({
            priceRange: null,
            fabrics: [],
            colors: [],
            inStock: false,
            rating: 0
        });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.priceRange) count++;
        if (filters.fabrics.length > 0) count++;
        if (filters.colors.length > 0) count++;
        if (filters.inStock) count++;
        if (filters.rating > 0) count++;
        return count;
    };

    const FilterSection = ({ title, children, defaultOpen = false }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);

        return (
            <div className="border-b border-gray-200 pb-4 mb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h3 className="font-medium text-gray-900">{title}</h3>
                    <span className="text-gray-400">
            {isOpen ? '−' : '+'}
          </span>
                </button>
                {isOpen && <div className="mt-3">{children}</div>}
            </div>
        );
    };

    const FiltersContent = () => (
        <div className="space-y-4">
            {/* Price Range */}
            <FilterSection title="Price Range">
                <div className="space-y-2">
                    {PRICE_RANGES.map(range => (
                        <label key={range.id} className="flex items-center">
                            <input
                                type="radio"
                                name="priceRange"
                                checked={filters.priceRange?.id === range.id}
                                onChange={() => handleFilterChange('priceRange', range)}
                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Fabric */}
            <FilterSection title="Fabric">
                <div className="space-y-2">
                    {FABRIC_TYPES.slice(0, 8).map(fabric => (
                        <label key={fabric} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filters.fabrics.includes(fabric)}
                                onChange={() => handleFilterChange('fabrics', fabric)}
                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{fabric}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Colors */}
            <FilterSection title="Colors">
                <div className="grid grid-cols-2 gap-2">
                    {COLORS.slice(0, 12).map(color => (
                        <label key={color} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={filters.colors.includes(color)}
                                onChange={() => handleFilterChange('colors', color)}
                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{color}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Customer Rating">
                <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                        <label key={rating} className="flex items-center">
                            <input
                                type="radio"
                                name="rating"
                                checked={filters.rating === rating}
                                onChange={() => handleFilterChange('rating', rating)}
                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                {rating}★ & above
              </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Availability */}
            <FilterSection title="Availability">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={() => handleFilterChange('inStock')}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
            </FilterSection>

            {/* Clear Filters */}
            {getActiveFiltersCount() > 0 && (
                <button
                    onClick={clearFilters}
                    className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Clear All Filters ({getActiveFiltersCount()})
                </button>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex">
                {showFilters && (
                    <div className="hidden lg:block w-64 mr-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i}>
                                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(j => (
                                                <div key={j} className="h-3 bg-gray-200 rounded w-full"></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex-1">
                    <div className={`grid gap-6 ${
                        viewMode === 'grid'
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'grid-cols-1'
                    }`}>
                        <CardSkeleton count={8} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            {/* Desktop Filters */}
            {showFilters && (
                <div className="hidden lg:block w-64 mr-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-900">Filters</h2>
                            {getActiveFiltersCount() > 0 && (
                                <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
                            )}
                        </div>
                        <FiltersContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <p className="text-gray-600">
                            Showing {filteredProducts.length} of {products.length} products
                        </p>

                        {showFilters && (
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filters</span>
                                {getActiveFiltersCount() > 0 && (
                                    <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            {SORT_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* View Mode Toggle */}
                        {onViewModeChange && (
                            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
                                <button
                                    onClick={() => onViewModeChange('grid')}
                                    className={`p-2 rounded ${
                                        viewMode === 'grid'
                                            ? 'bg-pink-100 text-pink-600'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onViewModeChange('list')}
                                    className={`p-2 rounded ${
                                        viewMode === 'list'
                                            ? 'bg-pink-100 text-pink-600'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className={`grid gap-6 ${
                        viewMode === 'grid'
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'grid-cols-1'
                    }`}>
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-2">No products found</div>
                        <p className="text-gray-400 mb-4">
                            Try adjusting your filters or search terms
                        </p>
                        {getActiveFiltersCount() > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-pink-600 hover:text-pink-700 font-medium"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
                <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                    <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Filters</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-4">
                            <FiltersContent />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;