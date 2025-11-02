// src/services/productsService.js
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDoc,
    doc
} from 'firebase/firestore';
import { db } from './firebase';

class ProductsService {
    constructor() {
        this.collectionName = 'products';
    }

    // Get featured products
    async getFeaturedProducts(limitCount = 8) {
        try {
            console.log('Fetching featured products from Firebase...');

            const q = query(
                collection(db, this.collectionName),
                where('featured', '==', true),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const featuredProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`Found ${featuredProducts.length} featured products`);
            return featuredProducts;

        } catch (error) {
            console.error('Error fetching featured products:', error);
            throw new Error('Failed to fetch featured products');
        }
    }

    // Get all products with filtering and pagination
    async getProducts(filters = {}) {
        try {
            const {
                category = null,
                featured = null,
                inStockOnly = false,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                limitCount = 20,
                lastDoc = null
            } = filters;

            console.log('Fetching products with filters:', filters);

            let q = collection(db, this.collectionName);

            // Apply filters
            const constraints = [];

            if (category && category !== 'all') {
                constraints.push(where('category', '==', category));
            }

            if (featured !== null) {
                constraints.push(where('featured', '==', featured));
            }

            if (inStockOnly) {
                constraints.push(where('inStock', '>', 0));
            }

            // Add ordering
            constraints.push(orderBy(sortBy, sortOrder));

            // Add pagination
            if (lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            constraints.push(limit(limitCount));

            // Build query
            q = query(q, ...constraints);

            const snapshot = await getDocs(q);
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`Found ${products.length} products`);

            return {
                products,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
                hasMore: snapshot.docs.length === limitCount
            };

        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products');
        }
    }

    // Get single product by ID
    async getProduct(productId) {
        try {
            console.log(`Fetching product: ${productId}`);

            const docRef = doc(db, this.collectionName, productId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const product = {
                    id: docSnap.id,
                    ...docSnap.data()
                };
                console.log('Product found:', product.name);
                return product;
            } else {
                throw new Error('Product not found');
            }

        } catch (error) {
            console.error('Error fetching product:', error);
            throw new Error('Failed to fetch product');
        }
    }

    // Get products by category
    async getProductsByCategory(category, limitCount = 12) {
        try {
            console.log(`Fetching products in category: ${category}`);

            const q = query(
                collection(db, this.collectionName),
                where('category', '==', category),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`Found ${products.length} products in ${category} category`);
            return products;

        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw new Error('Failed to fetch products by category');
        }
    }

    // Search products by name or description
    async searchProducts(searchTerm, limitCount = 20) {
        try {
            console.log(`Searching products for: ${searchTerm}`);

            // Note: Firestore doesn't support full-text search natively
            // This is a basic implementation - for better search, consider Algolia or ElasticSearch
            const q = query(
                collection(db, this.collectionName),
                orderBy('name'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const allProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter on client side (not ideal for large datasets)
            const searchResults = allProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
            );

            console.log(`Found ${searchResults.length} products matching search`);
            return searchResults;

        } catch (error) {
            console.error('Error searching products:', error);
            throw new Error('Failed to search products');
        }
    }

    // Get products with price range filter
    async getProductsByPriceRange(minPrice, maxPrice, limitCount = 20) {
        try {
            console.log(`Fetching products in price range: ${minPrice} - ${maxPrice}`);

            const q = query(
                collection(db, this.collectionName),
                where('price', '>=', minPrice),
                where('price', '<=', maxPrice),
                orderBy('price', 'asc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`Found ${products.length} products in price range`);
            return products;

        } catch (error) {
            console.error('Error fetching products by price range:', error);
            throw new Error('Failed to fetch products by price range');
        }
    }

    // Get trending products (high rating + recent)
    async getTrendingProducts(limitCount = 8) {
        try {
            console.log('Fetching trending products...');

            const q = query(
                collection(db, this.collectionName),
                where('rating', '>=', 4.0),
                orderBy('rating', 'desc'),
                orderBy('reviews', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const trendingProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`Found ${trendingProducts.length} trending products`);
            return trendingProducts;

        } catch (error) {
            console.error('Error fetching trending products:', error);
            throw new Error('Failed to fetch trending products');
        }
    }

    // Get sale/discounted products
    async getSaleProducts(limitCount = 12) {
        try {
            console.log('Fetching sale products...');

            const q = query(
                collection(db, this.collectionName),
                orderBy('originalPrice', 'desc'),
                limit(limitCount * 2) // Get more to filter
            );

            const snapshot = await getDocs(q);
            const allProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter products that have a discount (originalPrice > price)
            const saleProducts = allProducts
                .filter(product => product.originalPrice && product.originalPrice > product.price)
                .slice(0, limitCount);

            console.log(`Found ${saleProducts.length} sale products`);
            return saleProducts;

        } catch (error) {
            console.error('Error fetching sale products:', error);
            throw new Error('Failed to fetch sale products');
        }
    }

    // Get product categories (distinct categories)
    async getCategories() {
        try {
            console.log('Fetching product categories...');

            const q = query(collection(db, this.collectionName));
            const snapshot = await getDocs(q);

            const categoriesSet = new Set();
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.category) {
                    categoriesSet.add(data.category);
                }
            });

            const categories = Array.from(categoriesSet).sort();
            console.log(`Found ${categories.length} categories:`, categories);
            return categories;

        } catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Failed to fetch categories');
        }
    }
}

// Export singleton instance
export const productsService = new ProductsService();
export default productsService;