/**
 * Browser-based script to upload products from saree.json to Firebase Firestore
 * 
 * Usage: 
 * 1. Import this script in a React component or run it in browser console
 * 2. Or create a simple admin page to trigger the upload
 */

import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';

// Load saree.json data - we'll fetch it when needed
async function loadSareeData() {
    try {
        // Try to fetch from public folder first
        const response = await fetch('/saree.json');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('Could not fetch saree.json from public folder:', error);
    }
    
    // If not in public folder, try importing as module (requires JSON to be in src)
    try {
        const sareeModule = await import('../../saree.json');
        return sareeModule.default || sareeModule;
    } catch (error) {
        console.error('Could not import saree.json:', error);
        throw new Error('Could not load saree.json. Please ensure the file exists in the public folder or src directory.');
    }
}

// Category mapping from saree.json categories to app categories
const categoryMap = {
    'linen': 'casual',        // Linen -> Casual Wear
    'silk': 'silk',           // Silk -> Silk Sarees
    'cotton': 'cotton',       // Cotton -> Cotton Sarees
    'chiffon': 'party',       // Chiffon -> Party Wear
    'organza': 'party',       // Organza -> Party Wear
    'georgette': 'designer'   // Georgette -> Designer Sarees
};

// Helper function to convert ISO date string to Firestore Timestamp
function convertToTimestamp(dateString) {
    if (!dateString) {
        return serverTimestamp();
    }
    try {
        const date = new Date(dateString);
        return Timestamp.fromDate(date);
    } catch (error) {
        return serverTimestamp();
    }
}

// Transform product data to match Firestore schema
function transformProduct(product) {
    const category = categoryMap[product.category] || product.category || 'all';
    
    // Ensure images is an array
    const images = Array.isArray(product.images) 
        ? product.images 
        : product.images 
            ? [product.images] 
            : product.imageUrl 
                ? [product.imageUrl] 
                : [];

    return {
        name: product.name || 'Untitled Product',
        description: product.description || `${product.name || 'Beautiful'} ${product.fabric || ''} saree, perfect for ${product.occasion || 'various'} occasions.`,
        category: category,
        price: Number(product.price) || 0,
        originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
        image: images[0] || '', // Main image for backward compatibility
        images: images, // Array of images
        inStock: Number(product.inStock) || 0,
        rating: Number(product.rating) || 4.5,
        reviews: Number(product.reviews) || 0,
        color: product.color || '',
        colors: Array.isArray(product.colors) ? product.colors : product.color ? [product.color] : [],
        size: Number(product.size) || Number(product.length) || 5.5,
        length: Number(product.length) || Number(product.size) || 5.5,
        weight: Number(product.weight) || 600,
        fabric: product.fabric || '',
        occasion: product.occasion || '',
        features: Array.isArray(product.features) ? product.features : [],
        sku: product.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        blouseIncluded: product.blouseIncluded !== undefined ? product.blouseIncluded : true,
        care: product.care || 'Dry clean only',
        featured: product.featured !== undefined ? product.featured : false,
        createdAt: convertToTimestamp(product.createdAt),
        updatedAt: serverTimestamp(),
        // Additional fields for compatibility
        popularity: product.reviews ? (product.reviews * product.rating) : 0
    };
}

// Upload products to Firestore
export async function uploadProductsToFirebase(progressCallback = null) {
    // This function delegates to uploadProductsOneByOne which handles everything
    return await uploadProductsOneByOne(progressCallback);
}

// Alternative function that uploads one by one (slower but more reliable)
export async function uploadProductsOneByOne(progressCallback = null) {
    try {
        console.log('🚀 Starting product upload (one by one) to Firebase Firestore...\n');

        if (!db || db._isMock) {
            throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
        }

        // Load saree.json data
        const productsData = await loadSareeData();
        console.log(`📦 Found ${productsData.length} products in saree.json\n`);

        // Get existing products to avoid duplicates
        const productsRef = collection(db, 'products');
        const existingSnapshot = await getDocs(productsRef);
        const existingSkus = new Set();
        existingSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.sku) {
                existingSkus.add(data.sku);
            }
        });
        console.log(`📊 Found ${existingSkus.size} existing products in Firestore\n`);

        let uploadedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < productsData.length; i++) {
            const product = productsData[i];
            const transformedProduct = transformProduct(product);

            // Skip if product with same SKU already exists
            if (existingSkus.has(transformedProduct.sku)) {
                console.log(`⏭️  Skipping product "${product.name}" - SKU already exists: ${transformedProduct.sku}`);
                skippedCount++;
                continue;
            }

            try {
                await addDoc(productsRef, transformedProduct);
                uploadedCount++;
                console.log(`✅ Uploaded (${uploadedCount}/${productsData.length}): ${product.name}`);
                
                if (progressCallback) {
                    progressCallback({
                        uploaded: uploadedCount,
                        total: productsData.length,
                        skipped: skippedCount,
                        errors: errorCount,
                        current: product.name
                    });
                }
            } catch (error) {
                console.error(`❌ Error uploading product "${product.name}":`, error);
                errorCount++;
            }
        }

        const summary = {
            uploaded: uploadedCount,
            skipped: skippedCount,
            errors: errorCount,
            total: productsData.length
        };

        console.log('\n📊 Upload Summary:');
        console.log(`   ✅ Uploaded: ${uploadedCount} products`);
        console.log(`   ⏭️  Skipped: ${skippedCount} products (duplicates)`);
        console.log(`   ❌ Errors: ${errorCount} products`);
        console.log(`   📦 Total: ${productsData.length} products\n`);

        return summary;

    } catch (error) {
        console.error('❌ Error uploading products:', error);
        throw error;
    }
}

// Default export
export default uploadProductsToFirebase;
