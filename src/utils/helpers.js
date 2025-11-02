// src/utils/helpers.js - Complete Utility Functions

// Currency formatting
export const formatCurrency = (amount, currency = 'INR') => {
    if (amount === null || amount === undefined) return '₹0';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) return '₹0';

    if (currency === 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numAmount);
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numAmount);
};

// Number formatting
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';

    const numValue = typeof num === 'string' ? parseFloat(num) : num;

    if (isNaN(numValue)) return '0';

    return new Intl.NumberFormat('en-IN').format(numValue);
};

// Date formatting
export const formatDate = (date, options = {}) => {
    if (!date) return '';

    const dateObj = date.toDate ? date.toDate() : new Date(date);

    if (isNaN(dateObj.getTime())) return '';

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };

    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(dateObj);
};

// Date and time formatting
export const formatDateTime = (date) => {
    if (!date) return '';

    const dateObj = date.toDate ? date.toDate() : new Date(date);

    if (isNaN(dateObj.getTime())) return '';

    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(dateObj);
};

// Relative time formatting
export const formatRelativeTime = (date) => {
    if (!date) return '';

    const dateObj = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diff = now - dateObj;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${years} year${years > 1 ? 's' : ''} ago`;
};

// Text utilities
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

export const capitalizeFirst = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text) => {
    if (!text) return '';
    return text.split(' ')
        .map(word => capitalizeFirst(word))
        .join(' ');
};

export const slugify = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Validation utilities
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// MISSING FUNCTION: Add validateEmail as alias for isValidEmail
export const validateEmail = (email) => {
    return isValidEmail(email);
};

export const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
};

// MISSING FUNCTION: Add validatePhone as alias for isValidPhone
export const validatePhone = (phone) => {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if it's a valid length (assuming 10-15 digits)
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

export const isValidIndianPhone = (phone) => {
    const indianPhoneRegex = /^[+91]?[6-9]\d{9}$/;
    return indianPhoneRegex.test(phone.replace(/\s+/g, ''));
};

// Price utilities
export const calculateDiscount = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    if (!originalPrice || !discountPercentage) return originalPrice;
    return originalPrice - (originalPrice * discountPercentage / 100);
};

export const calculateTax = (amount, taxPercentage = 18) => {
    if (!amount) return 0;
    return (amount * taxPercentage) / 100;
};

export const calculateTotal = (subtotal, tax = 0, shipping = 0, discount = 0) => {
    const numSubtotal = parseFloat(subtotal) || 0;
    const numTax = parseFloat(tax) || 0;
    const numShipping = parseFloat(shipping) || 0;
    const numDiscount = parseFloat(discount) || 0;

    return numSubtotal + numTax + numShipping - numDiscount;
};

// Calculate order totals (additional function from your existing code)
export const calculateOrderTotal = (items, shippingFee = 0, tax = 0) => {
    const subtotal = items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    const discount = items.reduce((total, item) => {
        const itemDiscount = item.originalPrice ?
            (item.originalPrice - item.price) * item.quantity : 0;
        return total + itemDiscount;
    }, 0);

    return {
        subtotal,
        discount,
        tax,
        shipping: shippingFee,
        total: subtotal + tax + shippingFee
    };
};

// Array utilities
export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
    return array.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];

        // Handle nested keys like 'user.name'
        if (key.includes('.')) {
            const keys = key.split('.');
            aVal = keys.reduce((obj, k) => obj?.[k], a);
            bVal = keys.reduce((obj, k) => obj?.[k], b);
        }

        // Handle different data types
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
};

export const filterBy = (array, filters) => {
    return array.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === null || value === undefined || value === '') return true;

            let itemValue = item[key];

            // Handle nested keys
            if (key.includes('.')) {
                const keys = key.split('.');
                itemValue = keys.reduce((obj, k) => obj?.[k], item);
            }

            // Handle array filters
            if (Array.isArray(value)) {
                return value.includes(itemValue);
            }

            // Handle string searches
            if (typeof value === 'string' && typeof itemValue === 'string') {
                return itemValue.toLowerCase().includes(value.toLowerCase());
            }

            return itemValue === value;
        });
    });
};

// Local storage utilities
export const setLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error setting localStorage:', error);
        return false;
    }
};

export const getLocalStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error getting localStorage:', error);
        return defaultValue;
    }
};

export const removeLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing localStorage:', error);
        return false;
    }
};

// URL utilities
export const createQueryString = (params) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(v => searchParams.append(key, v));
            } else {
                searchParams.set(key, value);
            }
        }
    });

    return searchParams.toString();
};

export const parseQueryString = (queryString) => {
    const params = {};
    const searchParams = new URLSearchParams(queryString);

    for (let [key, value] of searchParams.entries()) {
        if (params[key]) {
            if (Array.isArray(params[key])) {
                params[key].push(value);
            } else {
                params[key] = [params[key], value];
            }
        } else {
            params[key] = value;
        }
    }

    return params;
};

// Image utilities
export const generateImageUrl = (imagePath, options = {}) => {
    if (!imagePath) return getImagePlaceholder();

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    const { width, height, quality = 80, format = 'webp' } = options;

    // If using a service like Cloudinary or similar
    if (width || height) {
        const params = [];
        if (width) params.push(`w_${width}`);
        if (height) params.push(`h_${height}`);
        params.push(`q_${quality}`);
        params.push(`f_${format}`);

        // This is a placeholder - adjust based on your image service
        return `${imagePath}?${params.join(',')}`;
    }

    return imagePath;
};

// MISSING FUNCTION: Add getImageUrl as alias for generateImageUrl
export const getImageUrl = (imagePath, options = {}) => {
    return generateImageUrl(imagePath, options);
};

export const getImagePlaceholder = (width = 400, height = 400, text = 'Image') => {
    return `https://via.placeholder.com/${width}x${height}/f8f9fa/6c757d?text=${encodeURIComponent(text)}`;
};

// Form utilities
export const validateForm = (data, rules) => {
    const errors = {};

    Object.entries(rules).forEach(([field, fieldRules]) => {
        const value = data[field];

        fieldRules.forEach(rule => {
            if (errors[field]) return; // Skip if already has error

            switch (rule.type) {
                case 'required':
                    if (!value || (typeof value === 'string' && !value.trim())) {
                        errors[field] = rule.message || `${field} is required`;
                    }
                    break;

                case 'email':
                    if (value && !isValidEmail(value)) {
                        errors[field] = rule.message || 'Invalid email format';
                    }
                    break;

                case 'phone':
                    if (value && !isValidPhone(value)) {
                        errors[field] = rule.message || 'Invalid phone number';
                    }
                    break;

                case 'minLength':
                    if (value && value.length < rule.value) {
                        errors[field] = rule.message || `Minimum ${rule.value} characters required`;
                    }
                    break;

                case 'maxLength':
                    if (value && value.length > rule.value) {
                        errors[field] = rule.message || `Maximum ${rule.value} characters allowed`;
                    }
                    break;

                case 'min':
                    if (value && parseFloat(value) < rule.value) {
                        errors[field] = rule.message || `Minimum value is ${rule.value}`;
                    }
                    break;

                case 'max':
                    if (value && parseFloat(value) > rule.value) {
                        errors[field] = rule.message || `Maximum value is ${rule.value}`;
                    }
                    break;

                case 'pattern':
                    if (value && !rule.value.test(value)) {
                        errors[field] = rule.message || 'Invalid format';
                    }
                    break;

                case 'custom':
                    if (value && rule.validator && !rule.validator(value, data)) {
                        errors[field] = rule.message || 'Validation failed';
                    }
                    break;
                default:
                    break;
            }
        });
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Additional validation utilities
export const validateRequired = (value) => {
    return value && value.toString().trim() !== '';
};

// ID generation utility
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Color utilities
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Performance utilities
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Export grouped utility object
const utilityFunctions = {
    // Currency & formatting
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateTime,
    formatRelativeTime,

    // Text utilities
    truncateText,
    capitalizeFirst,
    capitalizeWords,
    slugify,

    // Validation utilities
    isValidEmail,
    validateEmail,
    isValidPhone,
    validatePhone,
    isValidIndianPhone,
    validateRequired,
    validateForm,

    // Price utilities
    calculateDiscount,
    calculateDiscountedPrice,
    calculateTax,
    calculateTotal,
    calculateOrderTotal,

    // Array utilities
    groupBy,
    sortBy,
    filterBy,

    // Storage utilities
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage,

    // URL utilities
    createQueryString,
    parseQueryString,

    // Image utilities
    generateImageUrl,
    getImageUrl,
    getImagePlaceholder,

    // Other utilities
    generateId,
    hexToRgb,
    rgbToHex,
    debounce,
    throttle

};
// Add this function to your frontend/src/utils/helpers.js file

// Image validation utility
// Add this function to your frontend/src/utils/helpers.js file

// Image validation utility
export const validateImageFile = (file, options = {}) => {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    } = options;

    const errors = [];

    // Check if file exists
    if (!file) {
        errors.push('No file provided');
        return errors;
    }

    // Check file size
    if (file.size > maxSize) {
        errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    // Return just the errors array, not an object
    return errors;
};

export default utilityFunctions;