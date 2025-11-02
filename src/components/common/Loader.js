import React from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';

// Page Loader Component
export const PageLoader = ({ message = "Loading..." }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="mb-4">
                    <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto" />
                </div>
                <p className="text-gray-600 text-lg">{message}</p>
            </div>
        </div>
    );
};

// Button Loader Component
export const ButtonLoader = ({ size = "sm", className = "" }) => {
    const sizeClasses = {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6"
    };

    return (
        <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
    );
};

// Card Skeleton Loader
export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-w-3 aspect-h-4 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="flex items-center justify-between">
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Image skeleton */}
            <div className="aspect-w-3 aspect-h-4 bg-gray-200 animate-pulse" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                {/* Title skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>

                {/* Price skeleton */}
                <div className="flex items-center space-x-2">
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                </div>

                {/* Rating skeleton */}
                <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse ml-2" />
                </div>

                {/* Button skeleton */}
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    );
};

// Table Skeleton Loader
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header skeleton */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: columns }, (_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Rows skeleton */}
            <div className="divide-y divide-gray-200">
                {Array.from({ length: rows }, (_, i) => (
                    <div key={i} className="px-6 py-4">
                        <div className="grid grid-cols-4 gap-4">
                            {Array.from({ length: columns }, (_, j) => (
                                <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// List Skeleton Loader
export const ListSkeleton = ({ items = 5 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: items }, (_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                        </div>
                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
};

// Cart Item Skeleton
export const CartItemSkeleton = () => {
    return (
        <div className="flex items-center space-x-3 py-4 border-b border-gray-200">
            <div className="h-16 w-16 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
        </div>
    );
};

// Image Loader Component
export const ImageLoader = ({ src, alt, className = "", fallback }) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    const handleLoad = () => setLoading(false);
    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    if (error && fallback) {
        return fallback;
    }

    return (
        <div className={`relative ${className}`}>
            {loading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
            )}
            <img
                src={src}
                alt={alt}
                className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
};

// Spinner Component
export const Spinner = ({ size = "md", color = "pink" }) => {
    const sizeClasses = {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12"
    };

    const colorClasses = {
        pink: "text-pink-600",
        blue: "text-blue-600",
        green: "text-green-600",
        gray: "text-gray-600",
        red: "text-red-600"
    };

    return (
        <Loader2 className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
    );
};

// Empty State Component
export const EmptyState = ({
                               icon: Icon = ShoppingBag,
                               title = "No items found",
                               description = "Try adjusting your search or filters",
                               action = null
                           }) => {
    return (
        <div className="text-center py-12">
            <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6">{description}</p>
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
};

// Progress Bar Component
export const ProgressBar = ({ progress = 0, className = "", showPercentage = false }) => {
    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center justify-between mb-1">
                {showPercentage && (
                    <span className="text-sm font-medium text-gray-700">{progress}%</span>
                )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-pink-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
        </div>
    );
};

// Loading overlay for forms
export const LoadingOverlay = ({ message = "Processing..." }) => {
    return (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>
        </div>
    );
};