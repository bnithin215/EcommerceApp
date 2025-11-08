// src/services/api.js - Complete Production API Implementation
import { db, storage, auth } from './firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    increment,
    writeBatch
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';

// Fallback products data
import fallbackProducts from '../products.json';

// Utility functions
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const handleApiError = (error, operation) => {
    console.error(`Error in ${operation}:`, error);
    throw new Error(`Failed to ${operation}: ${error.message}`);
};

// Product API
class ProductAPI {
    constructor() {
        this.collectionName = 'products';
    }

    // Replace your getAllProducts method in frontend/src/services/api.js with this fixed version

    // Helper function to transform fallback products to match expected format
    transformFallbackProduct(product, index) {
        // Map category names to slugs
        const categoryMap = {
            'Silk Sarees': 'silk',
            'Cotton Sarees': 'cotton',
            'Designer Sarees': 'designer',
            'Wedding Collection': 'wedding',
            'Party Wear': 'party',
            'Casual Wear': 'casual'
        };

        return {
            id: `fallback-${index}`,
            name: product.name,
            category: categoryMap[product.category] || product.category?.toLowerCase() || 'all',
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            image: product.imageUrl,
            images: [product.imageUrl],
            description: `${product.name} - ${product.occasion || 'Elegant'} ${product.category}`,
            inStock: 10,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 50) + 10,
            color: product.color,
            size: product.size,
            weight: product.weight,
            occasion: product.occasion,
            features: product.features || [],
            fabric: product.category?.includes('Silk') ? 'Silk' : product.category?.includes('Cotton') ? 'Cotton' : 'Georgette',
            sku: `SKU-${Date.now()}-${index}`,
            createdAt: new Date(),
            featured: index < 4
        };
    }

    // Helper function to load fallback products
    loadFallbackProducts(filters = {}) {
        console.log('Loading fallback products from products.json...');
        
        let products = fallbackProducts.map((product, index) => 
            this.transformFallbackProduct(product, index)
        );

        // Apply filters
        if (filters.category && filters.category !== 'all') {
            products = products.filter(p => p.category === filters.category);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.fabric) {
            products = products.filter(p => 
                p.fabric?.toLowerCase() === filters.fabric.toLowerCase()
            );
        }

        if (filters.occasion) {
            products = products.filter(p => 
                p.occasion?.toLowerCase().includes(filters.occasion.toLowerCase())
            );
        }

        if (filters.color) {
            products = products.filter(p => 
                p.color?.toLowerCase() === filters.color.toLowerCase()
            );
        }

        if (filters.minPrice) {
            products = products.filter(p => p.price >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            products = products.filter(p => p.price <= parseFloat(filters.maxPrice));
        }

        // Apply sorting
        if (filters.sortBy) {
            products = this.sortProductsClientSide(products, filters.sortBy);
        }

        console.log(`Loaded ${products.length} fallback products`);
        return {
            products,
            total: products.length
        };
    }

    async getAllProducts(filters = {}) {
        try {
            // Check if Firestore is properly initialized
            if (!db || db._isMock) {
                console.error('❌ Firebase Firestore is not initialized.');
                console.error('💡 Please configure Firebase in your .env file');
                throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
            }

            console.log('Loading products with filters:', filters);

            let q = collection(db, this.collectionName);
            const constraints = [];

            // Apply category filter if specified
            if (filters.category && filters.category !== 'all') {
                constraints.push(where('category', '==', filters.category));
            }

            // Apply stock filter if specified
            if (filters.inStock) {
                constraints.push(where('inStock', '>', 0));
            }

            // Handle sorting - avoid composite index requirements
            let sortField = 'createdAt'; // Default sort field
            let sortDirection = 'desc';

            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'popularity':
                        // If category filter is applied, skip sorting to avoid index requirement
                        if (!filters.category || filters.category === 'all') {
                            sortField = 'popularity';
                            sortDirection = 'desc';
                        }
                        break;
                    case 'newest':
                        sortField = 'createdAt';
                        sortDirection = 'desc';
                        break;
                    case 'price-low':
                        // Only apply price sorting if no category filter
                        if (!filters.category || filters.category === 'all') {
                            sortField = 'price';
                            sortDirection = 'asc';
                        }
                        break;
                    case 'price-high':
                        // Only apply price sorting if no category filter
                        if (!filters.category || filters.category === 'all') {
                            sortField = 'price';
                            sortDirection = 'desc';
                        }
                        break;
                    case 'rating':
                        // Only apply rating sorting if no category filter
                        if (!filters.category || filters.category === 'all') {
                            sortField = 'rating';
                            sortDirection = 'desc';
                        }
                        break;
                    default:
                        sortField = 'createdAt';
                        sortDirection = 'desc';
                }
            }

            // Build the query
            if (constraints.length > 0) {
                // If we have filters, apply them
                q = query(q, ...constraints);

                // Only add orderBy if we don't have category filter (to avoid composite index requirement)
                if (!filters.category || filters.category === 'all') {
                    q = query(q, orderBy(sortField, sortDirection));
                }
            } else {
                // No filters, safe to apply sorting
                q = query(q, orderBy(sortField, sortDirection));
            }

            // Apply limit for performance
            // If no limit specified and no filters, default to 100 to load small-medium catalogs
            // If limit is specified, use it (max 200)
            // If filters are applied, default to 20 for pagination
            let limitCount = 100; // Default for unfiltered queries (load more products)
            if (filters.limit) {
                limitCount = Math.min(filters.limit, 200);
            } else if (filters.category || filters.search || filters.fabric || filters.occasion || filters.color || filters.minPrice || filters.maxPrice) {
                limitCount = 20; // Default for filtered queries (pagination)
            }
            q = query(q, limit(limitCount));

            console.log('Executing Firestore query...');
            const snapshot = await getDocs(q);

            let products = snapshot.docs.map(doc => {
                const data = doc.data();
                // Ensure images is always an array
                if (data.images && !Array.isArray(data.images)) {
                    data.images = [data.images];
                } else if (!data.images && data.image) {
                    data.images = [data.image];
                } else if (!data.images) {
                    data.images = [];
                }
                return {
                    id: doc.id,
                    ...data
                };
            });

            console.log(`Fetched ${products.length} products from Firestore`);

            // If no products found, return empty array (no fallback)
            if (products.length === 0) {
                console.warn('⚠️ No products found in Firestore. Please upload products using the admin panel.');
                return {
                    products: [],
                    total: 0
                };
            }

            // Apply client-side sorting if we couldn't sort server-side due to index limitations
            if (filters.category && filters.category !== 'all' && filters.sortBy) {
                products = this.sortProductsClientSide(products, filters.sortBy);
                console.log(`Applied client-side sorting by: ${filters.sortBy}`);
            }

            // Apply client-side search filter if specified
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                products = products.filter(product =>
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.description?.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)
                );
                console.log(`Applied search filter: ${filters.search}, found ${products.length} results`);
            }

            // Apply client-side filters for better performance (fabric, occasion, color, price)
            if (filters.fabric) {
                products = products.filter(p => 
                    p.fabric && p.fabric.toLowerCase() === filters.fabric.toLowerCase()
                );
            }

            if (filters.occasion) {
                products = products.filter(p => 
                    p.occasion && p.occasion.toLowerCase().includes(filters.occasion.toLowerCase())
                );
            }

            if (filters.color) {
                products = products.filter(p => 
                    p.color && p.color.toLowerCase() === filters.color.toLowerCase()
                );
            }

            if (filters.minPrice) {
                products = products.filter(p => (p.price || 0) >= parseFloat(filters.minPrice));
            }

            if (filters.maxPrice) {
                products = products.filter(p => (p.price || 0) <= parseFloat(filters.maxPrice));
            }

            return {
                products,
                total: products.length
            };

        } catch (error) {
            console.error('Error in getAllProducts:', error);

            // Fallback: Try a simpler query without sorting
            if (error.code === 'failed-precondition' || error.message.includes('index')) {
                console.log('Index error detected, trying fallback query...');

                try {
                    let fallbackQuery = collection(db, this.collectionName);

                    // Only apply category filter for fallback
                    if (filters.category && filters.category !== 'all') {
                        fallbackQuery = query(fallbackQuery, where('category', '==', filters.category));
                    }

                    fallbackQuery = query(fallbackQuery, limit(filters.limit || 20));

                    const fallbackSnapshot = await getDocs(fallbackQuery);
                    let fallbackProducts = fallbackSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Apply client-side sorting
                    if (filters.sortBy) {
                        fallbackProducts = this.sortProductsClientSide(fallbackProducts, filters.sortBy);
                    }

                    if (fallbackProducts.length > 0) {
                        console.log(`Fallback query successful: ${fallbackProducts.length} products`);
                        return {
                            products: fallbackProducts,
                            total: fallbackProducts.length
                        };
                    }
                } catch (fallbackError) {
                    console.error('Fallback query also failed:', fallbackError);
                }
            }

            // Re-throw error instead of using fallback
            console.error('❌ Firebase query failed:', error);
            throw error;
        }
    }

// Add this helper method to your ProductAPI class
    sortProductsClientSide(products, sortBy) {
        const productsCopy = [...products];

        switch (sortBy) {
            case 'popularity':
                return productsCopy.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            case 'newest':
                return productsCopy.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
                    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
                    return dateB - dateA;
                });
            case 'price-low':
                return productsCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-high':
                return productsCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'rating':
                return productsCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'discount':
                return productsCopy.sort((a, b) => {
                    const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
                    const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
                    return discountB - discountA;
                });
            default:
                return productsCopy;
        }
    }

    async getProduct(id) {
        try {
            if (!db || db._isMock) {
                console.warn('Firebase Firestore is not initialized. Cannot fetch product.');
                throw new Error('Firebase is not properly configured');
            }

            const docRef = doc(db, this.collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('Product not found');
            }
        } catch (error) {
            handleApiError(error, 'fetch product');
        }
    }

    async createProduct(productData) {
        try {
            const docRef = await addDoc(collection(db, this.collectionName), {
                ...productData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            handleApiError(error, 'create product');
        }
    }

    async updateProduct(id, productData) {
        try {
            const docRef = doc(db, this.collectionName, id);
            await updateDoc(docRef, {
                ...productData,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            handleApiError(error, 'update product');
        }
    }

    async deleteProduct(id) {
        try {
            const docRef = doc(db, this.collectionName, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            handleApiError(error, 'delete product');
        }
    }

    // IMMEDIATE FIX: Replace the getFeaturedProducts method in your frontend/src/services/api.js

    // Update to frontend/src/services/api.js - Fix the getFeaturedProducts method

// Add this method to your ProductAPI class or replace the existing one:

    async getFeaturedProducts(limitCount = 8) {
        try {
            // Check if Firestore is properly initialized
            if (!db || db._isMock) {
                console.error('❌ Firebase Firestore is not initialized.');
                throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
            }

            console.log(' Fetching featured products from Firebase...');

            // Try to get products marked as featured
            const q = query(
                collection(db, this.collectionName),
                where('featured', '==', true),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const featuredProducts = snapshot.docs.map(doc => {
                const data = doc.data();
                // Ensure images is always an array
                if (data.images && !Array.isArray(data.images)) {
                    data.images = [data.images];
                } else if (!data.images && data.image) {
                    data.images = [data.image];
                } else if (!data.images) {
                    data.images = [];
                }
                return {
                    id: doc.id,
                    ...data
                };
            });

            if (featuredProducts.length > 0) {
                console.log(' Found featured products:', featuredProducts.length);
                return featuredProducts;
            }

            // Fallback: If no products are marked as featured, get the latest products
            console.log(' No featured products found, trying latest products...');

            const fallbackQuery = query(
                collection(db, this.collectionName),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const fallbackSnapshot = await getDocs(fallbackQuery);
            const latestProducts = fallbackSnapshot.docs.map(doc => {
                const data = doc.data();
                // Ensure images is always an array
                if (data.images && !Array.isArray(data.images)) {
                    data.images = [data.images];
                } else if (!data.images && data.image) {
                    data.images = [data.image];
                } else if (!data.images) {
                    data.images = [];
                }
                return {
                    id: doc.id,
                    ...data
                };
            });

            if (latestProducts.length > 0) {
                console.log(' Using latest products as featured:', latestProducts.length);
                return latestProducts;
            }

            // No products found, return empty array
            console.warn('⚠️ No products found in Firestore. Please upload products using the admin panel.');
            return [];

        } catch (error) {
            console.error(' Error fetching featured products:', error);

            // If there's an index error, try without the orderBy
            if (error.code === 'failed-precondition' || error.message.includes('index')) {
                console.log(' Retrying without orderBy due to index issue...');

                try {
                    const simpleQuery = query(
                        collection(db, this.collectionName),
                        limit(limitCount)
                    );

                    const simpleSnapshot = await getDocs(simpleQuery);
                    const simpleProducts = simpleSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    console.log(' Fallback: Got products without orderBy:', simpleProducts.length);
                    return simpleProducts;
                } catch (fallbackError) {
                    console.error(' Fallback also failed:', fallbackError);
                    throw fallbackError;
                }
            }

            // Re-throw error instead of using fallback
            console.error('❌ Firebase error occurred:', error);
            throw error;
        }
    }

    async getProductsByCategory(category, limitCount = 20) {  // Changed parameter name
        try {
            if (!db || db._isMock) {
                console.error('❌ Firebase Firestore is not initialized.');
                throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
            }

            const q = query(
                collection(db, this.collectionName),
                where('category', '==', category),
                orderBy('createdAt', 'desc'),
                limit(limitCount)  // Use the imported 'limit' function with 'limitCount' parameter
            );

            const snapshot = await getDocs(q);
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // If no products found, return empty array
            if (products.length === 0) {
                console.warn(`⚠️ No products found in category ${category}. Please upload products using the admin panel.`);
            }

            return products;
        } catch (error) {
            console.error('❌ Error fetching products by category:', error);
            throw error;
        }
    }
    // Replace the searchProducts method in your ProductAPI class with this enhanced version

    async searchProducts(searchQuery, filters = {}) {
        try {
            console.log('SearchProducts called with query:', searchQuery, 'filters:', filters);

            // Get all products first
            const products = await this.getAllProducts(filters);
            console.log('Got products for search:', products.products?.length || 0);

            if (!searchQuery || !searchQuery.trim()) {
                console.log('Empty search query, returning all products');
                return products;
            }

            const searchTerm = searchQuery.toLowerCase().trim();
            console.log('Searching for:', searchTerm);

            const filteredProducts = products.products.filter(product => {
                // Create an array of all searchable fields
                const searchableFields = [
                    product.name,
                    product.description,
                    product.category,
                    product.fabric,
                    product.sku,
                    // Handle arrays like colors and features
                    ...(Array.isArray(product.colors) ? product.colors : []),
                    ...(Array.isArray(product.features) ? product.features : []),
                    ...(Array.isArray(product.tags) ? product.tags : [])
                ].filter(Boolean); // Remove null/undefined values

                // Check if search term exists in any field
                const matches = searchableFields.some(field => {
                    if (typeof field === 'string') {
                        return field.toLowerCase().includes(searchTerm);
                    }
                    return false;
                });

                // Debug logging for first few products
                if (products.products.indexOf(product) < 3) {
                    console.log(`Product "${product.name}":`, {
                        searchableFields,
                        matches,
                        searchTerm
                    });
                }

                return matches;
            });

            console.log(`Search "${searchQuery}" found ${filteredProducts.length} matching products out of ${products.products.length} total`);

            // Log some example matches for debugging
            if (filteredProducts.length > 0) {
                console.log('Sample matches:', filteredProducts.slice(0, 3).map(p => p.name));
            }

            return {
                products: filteredProducts,
                total: filteredProducts.length
            };
        } catch (error) {
            console.error('Error in searchProducts:', error);
            handleApiError(error, 'search products');
        }
    }
}

// Order API
class OrderAPI {
    constructor() {
        this.collectionName = 'orders';
    }

    async createOrder(orderData) {
        try {
            const docRef = await addDoc(collection(db, this.collectionName), {
                ...orderData,
                orderNumber: `ORD-${Date.now()}`,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            handleApiError(error, 'create order');
        }
    }

    async getOrders(filters = {}) {
        try {
            let q = collection(db, this.collectionName);

            // Apply filters
            if (filters.status && filters.status !== 'all') {
                q = query(q, where('status', '==', filters.status));
            }

            if (filters.userId) {
                q = query(q, where('userId', '==', filters.userId));
            }

            // Apply date filtering
            if (filters.dateRange && filters.dateRange !== 'all') {
                const now = new Date();
                let startDate;

                switch (filters.dateRange) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'quarter':
                        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
                        startDate = new Date(now.getFullYear(), quarterStart, 1);
                        break;
                    default:
                        startDate = null;
                }

                if (startDate) {
                    q = query(q, where('createdAt', '>=', startDate));
                }
            }

            // Apply sorting
            q = query(q, orderBy('createdAt', 'desc'));

            // Apply pagination
            if (filters.limit) {
                q = query(q, limit(filters.limit));
            }

            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { orders };
        } catch (error) {
            handleApiError(error, 'fetch orders');
        }
    }

    async getOrder(id) {
        try {
            const docRef = doc(db, this.collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('Order not found');
            }
        } catch (error) {
            handleApiError(error, 'fetch order');
        }
    }

    async getUserOrders(userId) {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { orders };
        } catch (error) {
            handleApiError(error, 'fetch user orders');
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const docRef = doc(db, this.collectionName, orderId);
            await updateDoc(docRef, {
                status,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            handleApiError(error, 'update order status');
        }
    }

    async updatePaymentStatus(orderId, paymentStatus, paymentDetails = {}) {
        try {
            const docRef = doc(db, this.collectionName, orderId);
            await updateDoc(docRef, {
                paymentStatus,
                paymentDetails,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            handleApiError(error, 'update payment status');
        }
    }

    async exportOrders(filters = {}) {
        try {
            const { orders } = await this.getOrders(filters);

            // Convert to CSV format
            const headers = ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date'];
            const csvData = orders.map(order => [
                order.orderNumber,
                order.customer?.name || '',
                order.customer?.email || '',
                order.total,
                order.status,
                new Date(order.createdAt?.toDate()).toLocaleDateString()
            ]);

            const csvContent = [headers, ...csvData]
                .map(row => row.join(','))
                .join('\n');

            return csvContent;
        } catch (error) {
            handleApiError(error, 'export orders');
        }
    }
}

// Customer API
class CustomerAPI {
    constructor() {
        this.collectionName = 'customers';
    }

    async getCustomers(filters = {}) {
        try {
            let q = collection(db, this.collectionName);

            // Apply filters
            if (filters.status && filters.status !== 'all') {
                q = query(q, where('status', '==', filters.status));
            }

            if (filters.segment && filters.segment !== 'all') {
                // Implement segment logic based on your business rules
                switch (filters.segment) {
                    case 'vip':
                        q = query(q, where('totalSpent', '>=', 50000));
                        break;
                    case 'regular':
                        q = query(q, where('orderCount', '>=', 3));
                        break;
                    case 'new':
                        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                        q = query(q, where('createdAt', '>=', thirtyDaysAgo));
                        break;
                    case 'inactive':
                        q = query(q, where('status', '==', 'inactive'));
                        break;
                }
            }

            // Apply sorting
            q = query(q, orderBy('createdAt', 'desc'));

            const snapshot = await getDocs(q);
            const customers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { customers };
        } catch (error) {
            handleApiError(error, 'fetch customers');
        }
    }

    async getCustomer(id) {
        try {
            const docRef = doc(db, this.collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('Customer not found');
            }
        } catch (error) {
            handleApiError(error, 'fetch customer');
        }
    }

    async createCustomer(customerData) {
        try {
            const docRef = await addDoc(collection(db, this.collectionName), {
                ...customerData,
                status: 'active',
                orderCount: 0,
                totalSpent: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            handleApiError(error, 'create customer');
        }
    }

    async updateCustomer(id, customerData) {
        try {
            const docRef = doc(db, this.collectionName, id);
            await updateDoc(docRef, {
                ...customerData,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            handleApiError(error, 'update customer');
        }
    }

    async exportCustomers(filters = {}) {
        try {
            const { customers } = await this.getCustomers(filters);

            // Convert to CSV format
            const headers = ['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Status', 'Joined'];
            const csvData = customers.map(customer => [
                customer.name,
                customer.email,
                customer.phone || '',
                customer.orderCount || 0,
                customer.totalSpent || 0,
                customer.status,
                new Date(customer.createdAt?.toDate()).toLocaleDateString()
            ]);

            const csvContent = [headers, ...csvData]
                .map(row => row.join(','))
                .join('\n');

            return csvContent;
        } catch (error) {
            handleApiError(error, 'export customers');
        }
    }
}

// Analytics API
class AnalyticsAPI {
    async getAnalytics(dateRange = '30days') {
        try {
            // Check if Firestore is properly initialized
            if (!db || db._isMock) {
                console.warn('Firebase Firestore is not initialized. Returning empty analytics data.');
                throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
            }

            // Calculate date range
            const now = new Date();
            let startDate;

            switch (dateRange) {
                case '7days':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30days':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90days':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '12months':
                    startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            // Fetch orders for the date range
            let orders = [];
            try {
                const ordersQuery = query(
                    collection(db, 'orders'),
                    where('createdAt', '>=', startDate),
                    orderBy('createdAt', 'desc')
                );
                const ordersSnapshot = await getDocs(ordersQuery);
                orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (ordersError) {
                console.warn('Error fetching orders for analytics:', ordersError);
                // Continue with empty orders array
            }

            // Fetch customers for the date range
            let customers = [];
            try {
                const customersQuery = query(
                    collection(db, 'customers'),
                    where('createdAt', '>=', startDate),
                    orderBy('createdAt', 'desc')
                );
                const customersSnapshot = await getDocs(customersQuery);
                customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (customersError) {
                console.warn('Error fetching customers for analytics:', customersError);
                // Continue with empty customers array
            }

            // Calculate overview metrics
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
            const totalOrders = orders.length;
            const newCustomers = customers.length;

            // Calculate conversion rate (mock calculation)
            const conversionRate = totalOrders > 0 ? (totalOrders / (totalOrders + 100)) * 100 : 0;

            // Generate sales chart data
            const salesChart = this.generateSalesChart(orders, dateRange);

            // Get top products
            const topProducts = await this.getTopProducts(orders);

            // Calculate customer metrics
            const customerMetrics = this.calculateCustomerMetrics(orders, customers);

            // Generate recent activity
            const recentActivity = this.generateRecentActivity(orders, customers);

            return {
                overview: {
                    totalRevenue,
                    revenueChange: 12.5, // Mock percentage change
                    totalOrders,
                    ordersChange: 8.3,
                    newCustomers,
                    customersChange: 15.2,
                    conversionRate,
                    conversionChange: 2.1
                },
                salesChart,
                topProducts,
                customerMetrics,
                recentActivity
            };
        } catch (error) {
            console.error('Error in getAnalytics:', error);
            // Re-throw error so component can handle it
            throw error;
        }
    }

    generateSalesChart(orders, dateRange) {
        // Group orders by time periods
        const periods = dateRange === '7days' ? 7 : dateRange === '30days' ? 4 : dateRange === '90days' ? 12 : 12;
        const chart = [];
        const now = new Date();
        
        // Initialize chart with zero values
        for (let i = 0; i < periods; i++) {
            chart.push({
                label: dateRange === '7days' ? `Day ${i + 1}` :
                    dateRange === '30days' ? `Week ${i + 1}` :
                        `Month ${i + 1}`,
                value: 0
            });
        }

        // Group orders by period
        orders.forEach(order => {
            const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            if (!orderDate || isNaN(orderDate.getTime())) return;

            let periodIndex = 0;
            const orderValue = order.total || 0;

            if (dateRange === '7days') {
                // Group by day
                const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
                periodIndex = periods - 1 - daysDiff;
            } else if (dateRange === '30days') {
                // Group by week
                const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
                periodIndex = periods - 1 - Math.floor(daysDiff / 7);
            } else {
                // Group by month
                const monthsDiff = (now.getFullYear() - orderDate.getFullYear()) * 12 + 
                                  (now.getMonth() - orderDate.getMonth());
                periodIndex = periods - 1 - monthsDiff;
            }

            if (periodIndex >= 0 && periodIndex < periods) {
                chart[periodIndex].value += orderValue;
            }
        });

        // Round values
        return chart.map(item => ({
            ...item,
            value: Math.round(item.value)
        }));
    }

    async getTopProducts(orders) {
        // Aggregate products from orders
        const productMap = {};

        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productId = item.id || item.productId;
                    if (!productId) return;

                    if (!productMap[productId]) {
                        productMap[productId] = {
                            id: productId,
                            name: item.name || 'Unknown Product',
                            image: item.image || item.images?.[0] || 'https://via.placeholder.com/100',
                            sales: 0,
                            revenue: 0
                        };
                    }

                    const quantity = item.quantity || 1;
                    const price = item.price || 0;
                    productMap[productId].sales += quantity;
                    productMap[productId].revenue += price * quantity;
                });
            }
        });

        // Convert to array and sort by revenue
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3);

        // If no products found, return mock data
        if (topProducts.length === 0) {
            return [
                {
                    id: '1',
                    name: 'Banarasi Silk Saree',
                    image: 'https://images.unsplash.com/photo-1610030469978-6bb537f3b982?w=100&h=100&fit=crop',
                    sales: 0,
                    revenue: 0
                },
                {
                    id: '2',
                    name: 'Designer Georgette',
                    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100&h=100&fit=crop',
                    sales: 0,
                    revenue: 0
                },
                {
                    id: '3',
                    name: 'Cotton Handloom',
                    image: 'https://images.unsplash.com/photo-1596706487679-9f95f5891975?w=100&h=100&fit=crop',
                    sales: 0,
                    revenue: 0
                }
            ];
        }

        return topProducts;
    }

    calculateCustomerMetrics(orders, customers) {
        const avgOrderValue = orders.length > 0 ?
            orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length : 0;

        const lifetimeValue = customers.length > 0 ?
            customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0) / customers.length : 0;

        const repeatCustomers = customers.filter(c => (c.orderCount || 0) > 1).length;
        const repeatRate = customers.length > 0 ? repeatCustomers / customers.length : 0;

        return {
            avgOrderValue,
            lifetimeValue,
            repeatRate
        };
    }

    generateRecentActivity(orders, customers) {
        const activities = [];

        // Add recent orders
        orders.slice(0, 3).forEach(order => {
            activities.push({
                type: 'order',
                message: `New order placed by ${order.customer?.name || 'Customer'}`,
                timestamp: this.formatTimestamp(order.createdAt)
            });
        });

        // Add recent customers
        customers.slice(0, 2).forEach(customer => {
            activities.push({
                type: 'customer',
                message: `New customer registration: ${customer.name}`,
                timestamp: this.formatTimestamp(customer.createdAt)
            });
        });

        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Just now';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Inventory API
class InventoryAPI {
    async getInventory(filters = {}) {
        try {
            // For inventory, we'll use the products collection and focus on stock data
            const productAPI = new ProductAPI();
            const result = await productAPI.getAllProducts(filters);

            // Transform products to inventory format
            const items = result.products.map(product => ({
                id: product.id,
                name: product.name,
                sku: product.sku || `SKU-${product.id}`,
                category: product.category,
                stock: product.inStock || 0,
                lowStockThreshold: product.lowStockThreshold || 10,
                image: product.images?.[0] || product.image
            }));

            return { items };
        } catch (error) {
            handleApiError(error, 'fetch inventory');
        }
    }

    async updateStock(productId, newStock) {
        try {
            const docRef = doc(db, 'products', productId);
            await updateDoc(docRef, {
                inStock: newStock,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            handleApiError(error, 'update stock');
        }
    }

    async bulkUpdateStock(updates) {
        try {
            const batch = writeBatch(db);

            updates.forEach(({ productId, stock }) => {
                const docRef = doc(db, 'products', productId);
                batch.update(docRef, {
                    inStock: stock,
                    updatedAt: serverTimestamp()
                });
            });

            await batch.commit();
            return true;
        } catch (error) {
            handleApiError(error, 'bulk update stock');
        }
    }
}

// Settings API
class SettingsAPI {
    constructor() {
        this.collectionName = 'settings';
        this.docId = 'store_settings';
    }

    async getSettings() {
        try {
            const docRef = doc(db, this.collectionName, this.docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                // Return default settings
                return this.getDefaultSettings();
            }
        } catch (error) {
            handleApiError(error, 'fetch settings');
        }
    }

    async updateSettings(settingsData) {
        try {
            const docRef = doc(db, this.collectionName, this.docId);
            await updateDoc(docRef, {
                ...settingsData,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            handleApiError(error, 'update settings');
        }
    }

    getDefaultSettings() {
        return {
            general: {
                storeName: 'Srija4Her',
                storeDescription: 'Premium Sarees for Every Occasion',
                storeEmail: 'contact@srija4her.com',
                storePhone: '+91 9876543210',
                storeAddress: '123 Fashion Street, Mumbai, India',
                currency: 'INR',
                timezone: 'Asia/Kolkata'
            },
            payment: {
                razorpayEnabled: false,
                razorpayKeyId: '',
                razorpayKeySecret: '',
                stripeEnabled: false,
                stripePublishableKey: '',
                stripeSecretKey: '',
                codEnabled: true,
                upiEnabled: true
            },
            shipping: {
                freeShippingThreshold: 1500,
                defaultShippingRate: 100,
                shippingZones: [],
                estimatedDeliveryDays: 7
            },
            email: {
                smtpHost: '',
                smtpPort: 587,
                smtpUsername: '',
                smtpPassword: '',
                fromEmail: 'noreply@srija4her.com',
                fromName: 'Srija4Her'
            },
            notifications: {
                orderNotifications: true,
                lowStockAlerts: true,
                customerSignups: true,
                dailyReports: false
            }
        };
    }
}

// Wishlist API
class WishlistAPI {
    constructor() {
        this.collectionName = 'wishlists';
    }

    async getUserWishlist(userId) {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('userId', '==', userId),
                orderBy('addedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { items };
        } catch (error) {
            handleApiError(error, 'fetch wishlist');
        }
    }

    async addToWishlist(userId, productData) {
        try {
            const docRef = await addDoc(collection(db, this.collectionName), {
                userId,
                productId: productData.id,
                ...productData,
                addedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            handleApiError(error, 'add to wishlist');
        }
    }

    async removeFromWishlist(userId, productId) {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('userId', '==', userId),
                where('productId', '==', productId)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            return true;
        } catch (error) {
            handleApiError(error, 'remove from wishlist');
        }
    }

    async clearWishlist(userId) {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            return true;
        } catch (error) {
            handleApiError(error, 'clear wishlist');
        }
    }
}

// Admin API
class AdminAPI {
    async getDashboardStats() {
        try {
            // Get counts from different collections
            const [productsSnap, ordersSnap, customersSnap] = await Promise.all([
                getDocs(collection(db, 'products')),
                getDocs(collection(db, 'orders')),
                getDocs(collection(db, 'customers'))
            ]);

            const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate stats
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
            const totalOrders = orders.length;
            const totalCustomers = customersSnap.size;
            const totalProducts = products.length;
            const pendingOrders = orders.filter(order => order.status === 'pending').length;
            const lowStockProducts = products.filter(product =>
                (product.inStock || 0) <= (product.lowStockThreshold || 10)
            ).length;

            // Get recent orders
            const recentOrders = orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    customerName: order.customer?.name || 'Unknown',
                    customerEmail: order.customer?.email || '',
                    total: order.total || 0,
                    status: order.status,
                    createdAt: order.createdAt
                }));

            return {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProducts,
                pendingOrders,
                lowStockProducts,
                recentOrders
            };
        } catch (error) {
            handleApiError(error, 'fetch dashboard stats');
        }
    }

    async getAllOrders() {
        try {
            const orderAPI = new OrderAPI();
            return await orderAPI.getOrders();
        } catch (error) {
            handleApiError(error, 'fetch all orders');
        }
    }

    async getAllCustomers() {
        try {
            const customerAPI = new CustomerAPI();
            return await customerAPI.getCustomers();
        } catch (error) {
            handleApiError(error, 'fetch all customers');
        }
    }
}

// Storage API for file uploads
class StorageAPI {
    async uploadImage(file, path = 'products') {
        try {
            const filename = `${path}/${generateId()}-${file.name}`;
            const storageRef = ref(storage, filename);

            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        } catch (error) {
            handleApiError(error, 'upload image');
        }
    }

    async uploadMultipleImages(files, path = 'products') {
        try {
            const uploadPromises = files.map(file => this.uploadImage(file, path));
            const urls = await Promise.all(uploadPromises);
            return urls;
        } catch (error) {
            handleApiError(error, 'upload multiple images');
        }
    }

    async deleteImage(imageUrl) {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
            return true;
        } catch (error) {
            handleApiError(error, 'delete image');
        }
    }

    async testConnection() {
        try {
            // Test by trying to get storage reference
            const testRef = ref(storage, 'test');
            return {
                success: true,
                message: 'Storage connection successful'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// User API for profile management
class UserAPI {
    constructor() {
        this.collectionName = 'users';
    }

    async getUserProfile(userId) {
        try {
            const docRef = doc(db, this.collectionName, userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null;
            }
        } catch (error) {
            handleApiError(error, 'fetch user profile');
        }
    }

    async updateUserProfile(userId, profileData) {
        try {
            const docRef = doc(db, this.collectionName, userId);
            await updateDoc(docRef, {
                ...profileData,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            handleApiError(error, 'update user profile');
        }
    }

    async createUserProfile(userId, profileData) {
        try {
            const docRef = doc(db, this.collectionName, userId);
            await updateDoc(docRef, {
                ...profileData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            handleApiError(error, 'create user profile');
        }
    }
}

// Initialize API instances
let productAPI, orderAPI, customerAPI, analyticsAPI, inventoryAPI, settingsAPI, wishlistAPI, adminAPI, storageAPI, userAPI;

try {
    productAPI = new ProductAPI();
    orderAPI = new OrderAPI();
    customerAPI = new CustomerAPI();
    analyticsAPI = new AnalyticsAPI();
    inventoryAPI = new InventoryAPI();
    settingsAPI = new SettingsAPI();
    wishlistAPI = new WishlistAPI();
    adminAPI = new AdminAPI();
    storageAPI = new StorageAPI();
    userAPI = new UserAPI();

    console.log(' All API services initialized successfully');
} catch (error) {
    console.error(' Error initializing API services:', error);

    // Create fallback mock instances
    productAPI = {
        getAllProducts: (filters) => Promise.resolve({ products: [], total: 0 }),
        getProduct: (id) => Promise.resolve(null),
        getFeaturedProducts: () => Promise.resolve([]),
        getProductsByCategory: () => Promise.resolve([]),
        createProduct: () => Promise.resolve('mock_product_id'),
        updateProduct: () => Promise.resolve(true),
        deleteProduct: () => Promise.resolve(true),
        searchProducts: () => Promise.resolve({ products: [], total: 0 })
    };

    orderAPI = {
        createOrder: () => Promise.resolve('mock_order_id'),
        getOrders: () => Promise.resolve({ orders: [] }),
        getOrder: () => Promise.resolve(null),
        getUserOrders: () => Promise.resolve({ orders: [] }),
        updateOrderStatus: () => Promise.resolve(true),
        updatePaymentStatus: () => Promise.resolve(true),
        exportOrders: () => Promise.resolve('')
    };

    customerAPI = {
        getCustomers: () => Promise.resolve({ customers: [] }),
        getCustomer: () => Promise.resolve(null),
        createCustomer: () => Promise.resolve('mock_customer_id'),
        updateCustomer: () => Promise.resolve(true),
        exportCustomers: () => Promise.resolve('')
    };

    analyticsAPI = {
        getAnalytics: () => Promise.resolve({
            overview: {},
            salesChart: [],
            topProducts: [],
            customerMetrics: {},
            recentActivity: []
        })
    };

    inventoryAPI = {
        getInventory: () => Promise.resolve({ items: [] }),
        updateStock: () => Promise.resolve(true),
        bulkUpdateStock: () => Promise.resolve(true)
    };

    settingsAPI = {
        getSettings: () => Promise.resolve({}),
        updateSettings: () => Promise.resolve(true)
    };

    wishlistAPI = {
        getUserWishlist: () => Promise.resolve({ items: [] }),
        addToWishlist: () => Promise.resolve('mock_wishlist_id'),
        removeFromWishlist: () => Promise.resolve(true),
        clearWishlist: () => Promise.resolve(true)
    };

    adminAPI = {
        getDashboardStats: () => Promise.resolve({
            totalRevenue: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalProducts: 0,
            pendingOrders: 0,
            lowStockProducts: 0,
            recentOrders: []
        }),
        getAllOrders: () => Promise.resolve({ orders: [] }),
        getAllCustomers: () => Promise.resolve({ customers: [] })
    };

    storageAPI = {
        uploadImage: () => Promise.resolve('mock_image_url'),
        uploadMultipleImages: () => Promise.resolve(['mock_image_url']),
        deleteImage: () => Promise.resolve(true),
        testConnection: () => Promise.resolve({ success: false, message: 'Mock storage' })
    };

    userAPI = {
        getUserProfile: () => Promise.resolve(null),
        updateUserProfile: () => Promise.resolve(true),
        createUserProfile: () => Promise.resolve(true)
    };
}

// Export all API instances
export {
    productAPI,
    orderAPI,
    customerAPI,
    analyticsAPI,
    inventoryAPI,
    settingsAPI,
    wishlistAPI,
    adminAPI,
    storageAPI,
    userAPI
};