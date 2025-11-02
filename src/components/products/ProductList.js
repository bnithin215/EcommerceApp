// Updated ProductList.js - Clean and compatible

import React from 'react';
import { Grid, List, Package, Filter } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductCardSkeleton, EmptyState } from '../common/Loader';

const ProductList = ({
                         products = [],
                         loading = false,
                         viewMode = 'grid',
                         onViewModeChange,
                         showViewToggle = true,
                         emptyMessage = "No products found",
                         emptyDescription = "Try adjusting your search or filters to find what you're looking for.",
                         className = ""
                     }) => {

    // Loading state
    if (loading) {
        return (
            <div className={className}>
                {showViewToggle && (
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="flex space-x-2">
                            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                )}

                <div className={`grid gap-6 ${
                    viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                }`}>
                    {Array.from({ length: 8 }, (_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!products || products.length === 0) {
        return (
            <div className={className}>
                {showViewToggle && (
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-600">0 products found</p>
                        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
                    </div>
                )}

                <EmptyState
                    icon={Package}
                    title={emptyMessage}
                    description={emptyDescription}
                />
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Header with product count and view toggle */}
            {showViewToggle && (
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <p className="text-gray-600 font-medium">
                            {products.length} product{products.length !== 1 ? 's' : ''} found
                        </p>

                        {/* Quick stats */}
                        <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                                {products.filter(p => p.inStock > 0).length} in stock
                            </span>
                            <span>
                                {products.filter(p => p.originalPrice && p.originalPrice > p.price).length} on sale
                            </span>
                        </div>
                    </div>
                    <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
                </div>
            )}

            {/* Product Grid/List */}
            <div className={`${
                viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
            }`}>
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        variant={viewMode === 'list' ? 'compact' : 'default'}
                        className={viewMode === 'list' ? 'w-full' : ''}
                    />
                ))}
            </div>

            {/* Load more or pagination can be added here */}
            {products.length > 0 && (
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Showing {products.length} products
                    </p>
                </div>
            )}
        </div>
    );
};

// View Toggle Component
const ViewToggle = ({ viewMode, onViewModeChange }) => {
    if (!onViewModeChange) return null;

    return (
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                        ? 'bg-white text-pink-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title="Grid View"
            >
                <Grid className="h-4 w-4" />
            </button>

            <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                        ? 'bg-white text-pink-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title="List View"
            >
                <List className="h-4 w-4" />
            </button>
        </div>
    );
};

// Enhanced Product List with filtering capabilities
export const FilterableProductList = ({
                                          products = [],
                                          loading = false,
                                          filters = {},
                                          onFilterChange,
                                          sortOptions = [],
                                          onSortChange,
                                          currentSort = '',
                                          viewMode = 'grid',
                                          onViewModeChange,
                                          showFilters = true
                                      }) => {
    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="space-y-6">
            {/* Enhanced Controls Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left side - Product count and filters */}
                    <div className="flex items-center space-x-4">
                        <p className="text-gray-600 font-medium">
                            {products.length} products
                        </p>

                        {/* Active filters indicator */}
                        {activeFiltersCount > 0 && (
                            <div className="flex items-center space-x-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right side - Sort and view controls */}
                    <div className="flex items-center space-x-4">
                        {/* Sort Dropdown */}
                        {sortOptions.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    Sort by:
                                </label>
                                <select
                                    value={currentSort}
                                    onChange={(e) => onSortChange && onSortChange(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* View Toggle */}
                        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
                    </div>
                </div>

                {/* Active Filters Tags */}
                {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Active filters:</span>
                        {Object.entries(filters).map(([key, value]) => (
                            value && (
                                <span
                                    key={key}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                                >
                                    {key}: {Array.isArray(value) ? value.join(', ') : value}
                                    <button
                                        onClick={() => onFilterChange && onFilterChange(key, null)}
                                        className="ml-2 text-pink-600 hover:text-pink-800 transition-colors"
                                    >
                                        ×
                                    </button>
                                </span>
                            )
                        ))}
                        <button
                            onClick={() => onFilterChange && onFilterChange('clear')}
                            className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Product List */}
            <ProductList
                products={products}
                loading={loading}
                viewMode={viewMode}
                showViewToggle={false}
                emptyMessage={activeFiltersCount > 0 ? "No products match your filters" : "No products found"}
                emptyDescription={activeFiltersCount > 0 ? "Try adjusting your filters to see more results" : "Check back later for new arrivals"}
            />
        </div>
    );
};

export default ProductList;