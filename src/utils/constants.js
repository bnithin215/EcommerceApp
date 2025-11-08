// Company Information
export const COMPANY_INFO = {
    name: "Srija Collections",
    tagline: "Elegant Sarees & Fashion for Every Occasion",
    email: "info@srijacollections.com",
    phone: "+91 79939 43031", // Your actual WhatsApp number
    whatsappGroup: "https://chat.whatsapp.com/KTdWS5MvwCB2djGOwsqKaY", // Your WhatsApp group link
    address: "Hyderabad,Telangana", // Update with your actual address
    socialMedia: {
        facebook: "https://facebook.com/srijacollections", // Update if you have Facebook
        instagram: "https://www.instagram.com/srija.collections_forher/",
        twitter: "https://twitter.com/srijacollections", // Update if you have Twitter
        youtube: "https://youtube.com/srijacollections", // Update if you have YouTube
        whatsapp: "+917993943031" // WhatsApp number for direct contact
    },
    policies: {
        shipping: "Free shipping on orders above ₹999",
        returns: "7-day return policy",
        support: "24/7 customer support via WhatsApp"
    }
};

// Product Categories
export const PRODUCT_CATEGORIES = [
    {
        id: 'all',
        name: 'All Products',
        slug: 'all',
        description: 'Browse all our products'
    },
    {
        id: 'silk',
        name: 'Silk Sarees',
        slug: 'silk',
        description: 'Premium silk sarees'
    },
    {
        id: 'cotton',
        name: 'Cotton Sarees',
        slug: 'cotton',
        description: 'Comfortable cotton sarees'
    },
    {
        id: 'designer',
        name: 'Designer Sarees',
        slug: 'designer',
        description: 'Latest designer collections'
    },
    {
        id: 'wedding',
        name: 'Wedding Collection',
        slug: 'wedding',
        description: 'Special wedding sarees'
    },
    {
        id: 'casual',
        name: 'Casual Wear',
        slug: 'casual',
        description: 'Everyday casual sarees'
    },
    {
        id: 'party',
        name: 'Party Wear',
        slug: 'party',
        description: 'Party and festive sarees'
    }
];

// API Endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        profile: '/auth/profile'
    },
    products: {
        list: '/products',
        details: (id) => `/products/${id}`,
        categories: '/products/categories',
        search: '/products/search'
    },
    orders: {
        create: '/orders',
        list: '/orders',
        details: (id) => `/orders/${id}`,
        cancel: (id) => `/orders/${id}/cancel`
    },
    admin: {
        dashboard: '/admin/dashboard',
        products: '/admin/products',
        orders: '/admin/orders',
        customers: '/admin/customers'
    }
};

// Payment Gateway Configuration
// NOTE: Razorpay Key Secret should NEVER be exposed in frontend code
// It should only be used on the backend for payment verification and order creation
// For frontend, we only use the Key ID (public key)
export const RAZORPAY_CONFIG = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
    keySecret: process.env.REACT_APP_RAZORPAY_KEY_SECRET || '', // Only for backend use
    currency: 'INR',
    name: COMPANY_INFO.name,
    description: 'Purchase from Srija4Her',
    image: '/img.png'
};

// Debug: Log Razorpay configuration (only in development)
if (process.env.NODE_ENV === 'development') {
    console.log('Razorpay Config:', {
        key: RAZORPAY_CONFIG.key ? `${RAZORPAY_CONFIG.key.substring(0, 10)}...` : 'NOT SET',
        keySecret: RAZORPAY_CONFIG.keySecret ? 'SET (hidden)' : 'NOT SET',
        hasKey: !!RAZORPAY_CONFIG.key
    });
}

// App Configuration
export const APP_CONFIG = {
    itemsPerPage: 20,
    maxCartItems: 50,
    minOrderAmount: 299,
    freeShippingThreshold: 999,
    maxImageSize: 5 * 1024 * 1024, // 5MB
    supportedImageFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    defaultProductImage: 'https://via.placeholder.com/400x400/f8f9fa/6c757d?text=No+Image'
};

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned'
};

// Order Status Labels
export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Order Pending',
    [ORDER_STATUS.CONFIRMED]: 'Order Confirmed',
    [ORDER_STATUS.PROCESSING]: 'Processing',
    [ORDER_STATUS.SHIPPED]: 'Shipped',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
    [ORDER_STATUS.RETURNED]: 'Returned'
};

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

// User Roles
export const USER_ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
};

// Product Filters
export const PRODUCT_FILTERS = {
    sortBy: [
        { value: 'latest', label: 'Latest' },
        { value: 'price_low_high', label: 'Price: Low to High' },
        { value: 'price_high_low', label: 'Price: High to Low' },
        { value: 'rating', label: 'Customer Rating' },
        { value: 'popular', label: 'Most Popular' }
    ],
    priceRanges: [
        { min: 0, max: 1000, label: 'Under ₹1,000' },
        { min: 1000, max: 2500, label: '₹1,000 - ₹2,500' },
        { min: 2500, max: 5000, label: '₹2,500 - ₹5,000' },
        { min: 5000, max: 10000, label: '₹5,000 - ₹10,000' },
        { min: 10000, max: null, label: 'Above ₹10,000' }
    ],
    colors: [
        'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Black', 'White', 'Gray', 'Brown', 'Gold', 'Silver'
    ],
    fabrics: [
        'Silk', 'Cotton', 'Georgette', 'Chiffon', 'Crepe', 'Net', 'Satin', 'Velvet', 'Linen', 'Polyester'
    ]
};

// Local Storage Keys
export const STORAGE_KEYS = {
    cart: 'srija4her_cart',
    wishlist: 'srija4her_wishlist',
    recentlyViewed: 'srija4her_recently_viewed',
    userPreferences: 'srija4her_user_preferences'
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please fill all required fields correctly.',
    AUTH_ERROR: 'Authentication failed. Please login again.',
    PERMISSION_ERROR: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Successfully logged in!',
    REGISTER: 'Account created successfully!',
    LOGOUT: 'Successfully logged out!',
    PROFILE_UPDATE: 'Profile updated successfully!',
    ORDER_PLACED: 'Order placed successfully!',
    PRODUCT_ADDED: 'Product added to cart!',
    PRODUCT_REMOVED: 'Product removed from cart!',
    WISHLIST_ADDED: 'Added to wishlist!',
    WISHLIST_REMOVED: 'Removed from wishlist!'
};

// Countries supported for shipping
export const COUNTRIES = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' }
];

// Indian States and Union Territories
export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// US States
export const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

// Country-specific state mapping
export const COUNTRY_STATES = {
    'IN': INDIAN_STATES,
    'US': US_STATES
};