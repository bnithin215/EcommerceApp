/**
 * Script to upload products from saree.json to Firebase Firestore
 * 
 * Usage: node scripts/uploadProductsToFirebase.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Firebase Admin SDK
try {
    // Check if Firebase is already initialized
    if (!admin.apps.length) {
        // Initialize with service account or use application default credentials
        // For local development, you can use the Firebase Admin SDK with a service account
        // Or use the environment variables from .env file
        
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : null;

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            // Use application default credentials (for local development with Firebase CLI)
            // Or initialize with environment variables
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
            });
        }
    }
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.error('Please ensure you have Firebase Admin SDK configured.');
    process.exit(1);
}

const db = admin.firestore();

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
        return admin.firestore.Timestamp.now();
    }
    const date = new Date(dateString);
    return admin.firestore.Timestamp.fromDate(date);
}

// Transform product data to match Firestore schema
function transformProduct(product) {
    const category = categoryMap[product.category] || product.category;
    
    // Ensure images is an array
    const images = Array.isArray(product.images) 
        ? product.images 
        : product.images 
            ? [product.images] 
            : product.imageUrl 
                ? [product.imageUrl] 
                : [];

    return {
        name: product.name,
        description: product.description || `${product.name} - ${product.occasion || 'Elegant'} ${product.fabric || ''} saree`,
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
        updatedAt: convertToTimestamp(product.updatedAt),
        // Additional fields for compatibility
        popularity: product.reviews ? (product.reviews * product.rating) : 0
    };
}

// Upload products to Firestore
async function uploadProducts() {
    try {
        console.log('🚀 Starting product upload to Firebase Firestore...\n');

        // Read saree.json file
        const jsonPath = path.join(__dirname, '..', 'saree.json');
        if (!fs.existsSync(jsonPath)) {
            console.error('❌ Error: saree.json file not found at:', jsonPath);
            process.exit(1);
        }

        const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`📦 Found ${productsData.length} products in saree.json\n`);

        // Get existing products to avoid duplicates
        const productsRef = db.collection('products');
        const existingSnapshot = await productsRef.get();
        const existingSkus = new Set();
        existingSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.sku) {
                existingSkus.add(data.sku);
            }
        });
        console.log(`📊 Found ${existingSkus.size} existing products in Firestore\n`);

        // Transform and upload products
        let uploadedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const batch = db.batch();
        let batchCount = 0;
        const BATCH_SIZE = 500; // Firestore batch limit is 500

        for (let i = 0; i < productsData.length; i++) {
            const product = productsData[i];
            const transformedProduct = transformProduct(product);

            // Skip if product with same SKU already exists
            if (existingSkus.has(transformedProduct.sku)) {
                console.log(`⏭️  Skipping product "${product.name}" - SKU already exists: ${transformedProduct.sku}`);
                skippedCount++;
                continue;
            }

            // Add to batch
            const docRef = productsRef.doc();
            batch.set(docRef, transformedProduct);
            batchCount++;

            // Commit batch when it reaches the limit
            if (batchCount >= BATCH_SIZE) {
                await batch.commit();
                console.log(`✅ Uploaded batch of ${batchCount} products`);
                uploadedCount += batchCount;
                batchCount = 0;
                // Create new batch
                const newBatch = db.batch();
                Object.assign(batch, newBatch);
            }
        }

        // Commit remaining products
        if (batchCount > 0) {
            await batch.commit();
            console.log(`✅ Uploaded final batch of ${batchCount} products`);
            uploadedCount += batchCount;
        }

        console.log('\n📊 Upload Summary:');
        console.log(`   ✅ Uploaded: ${uploadedCount} products`);
        console.log(`   ⏭️  Skipped: ${skippedCount} products (duplicates)`);
        console.log(`   ❌ Errors: ${errorCount} products`);
        console.log(`   📦 Total: ${productsData.length} products\n`);

        console.log('🎉 Product upload completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Restart your development server');
        console.log('   2. Check the Firebase Console to verify products');
        console.log('   3. Products should now load from Firestore instead of JSON files\n');

    } catch (error) {
        console.error('❌ Error uploading products:', error);
        process.exit(1);
    }
}

// Run the upload
uploadProducts()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });

