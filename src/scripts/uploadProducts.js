// src/scripts/uploadProducts.js
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

// Your product data with proper category mapping
const productsData = [
    {
        name: "Magenta Silk Saree",
        category: "silk", // mapped to your category system
        color: "Magenta",
        size: 5.5,
        price: 4999,
        originalPrice: 7499,
        weight: 650,
        occasion: "Wedding",
        features: ["Gold Zari Border", "Traditional Weave"],
        imageUrl: "https://i.pinimg.com/736x/8a/e0/f8/8ae0f80209332b243b0d93fb497cc4fa.jpg"
    },
    {
        name: "Royal Blue Designer Saree",
        category: "designer",
        color: "Royal Blue",
        size: 5.8,
        price: 5799,
        originalPrice: 8299,
        weight: 600,
        occasion: "Party Wear",
        features: ["Stone Work", "Designer Blouse"],
        imageUrl: "https://i.pinimg.com/736x/59/08/f4/5908f4b1985c6dac02640866c7944a02.jpg"
    },
    {
        name: "Teal Cotton Printed Saree",
        category: "cotton",
        color: "Teal",
        size: 6.3,
        price: 1599,
        originalPrice: 2299,
        weight: 480,
        occasion: "Casual Wear",
        features: ["Printed Pattern", "Soft Fabric"],
        imageUrl: "https://i.pinimg.com/736x/28/1c/18/281c185273c799c2a68ea4f8623ad773.jpg"
    },
    {
        name: "Maroon Bridal Silk Saree",
        category: "wedding",
        color: "Maroon",
        size: 5.5,
        price: 8499,
        originalPrice: 11500,
        weight: 720,
        occasion: "Wedding",
        features: ["Heavy Zari Work", "Rich Pallu"],
        imageUrl: "https://www.bangaloredesignerboutique.com/wp-content/uploads/2024/01/Set-4-image-3.jpg"
    },
    {
        name: "Golden Yellow Festive Saree",
        category: "silk",
        color: "Golden Yellow",
        size: 5.5,
        price: 3999,
        originalPrice: 5999,
        weight: 580,
        occasion: "Festive",
        features: ["Shimmer Finish", "Contrasting Border"],
        imageUrl: "https://i.pinimg.com/736x/43/7d/fa/437dfaebf0deff4931d02e05d6025ca7.jpg"
    }
];

// Function to generate SKU
const generateSKU = (name, category) => {
    const nameCode = name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    const categoryCode = category.toUpperCase().substring(0, 3);
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${categoryCode}-${nameCode}-${randomNum}`;
};

// Function to transform product data to match your schema
const transformProductData = (product) => {
    // Generate a detailed description
    const description = `Beautiful ${product.name.toLowerCase()} crafted with attention to detail. This elegant saree is perfect for ${product.occasion.toLowerCase()} and features ${product.features.join(' and ').toLowerCase()}. Made from premium quality fabric with a comfortable fit and stunning appearance.`;

    return {
        name: product.name,
        description: description,
        price: product.price,
        originalPrice: product.originalPrice,
        images: [product.imageUrl],
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Random rating between 3.5-5.0
        reviews: Math.floor(Math.random() * 200) + 50, // Random reviews between 50-250
        fabric: determineFabric(product.category),
        inStock: Math.floor(Math.random() * 15) + 5, // Random stock between 5-20
        colors: [product.color],
        category: product.category,
        features: product.features,
        care: determineCareInstructions(product.category),
        weight: product.weight,
        length: product.size,
        occasion: product.occasion,
        sku: generateSKU(product.name, product.category),
        blouseIncluded: Math.random() > 0.4, // 60% chance of blouse included
        featured: Math.random() > 0.6, // 40% chance of being featured
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };
};

// Helper function to determine fabric based on category
const determineFabric = (category) => {
    const fabricMap = {
        'silk': 'Pure Silk',
        'cotton': 'Cotton',
        'designer': 'Georgette',
        'wedding': 'Heavy Silk',
        'casual': 'Cotton Blend',
        'party': 'Chiffon'
    };
    return fabricMap[category] || 'Mixed Fabric';
};

// Helper function to determine care instructions
const determineCareInstructions = (category) => {
    const careMap = {
        'silk': 'Dry clean only',
        'cotton': 'Machine washable',
        'designer': 'Dry clean recommended',
        'wedding': 'Dry clean only',
        'casual': 'Machine washable',
        'party': 'Dry clean recommended'
    };
    return careMap[category] || 'Dry clean recommended';
};

// Function to check if products already exist
export const checkExistingProducts = async () => {
    try {
        if (!db) {
            throw new Error('Firebase not initialized');
        }

        const productsCollection = collection(db, 'products');
        const snapshot = await getDocs(productsCollection);

        console.log(`📊 Found ${snapshot.size} existing products in Firebase`);

        return {
            count: snapshot.size,
            products: snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        };
    } catch (error) {
        console.error('Error checking existing products:', error);
        return { count: 0, products: [] };
    }
};

// Main upload function
export const uploadProductsToFirebase = async () => {
    try {
        console.log('🚀 Starting product upload to Firebase...');

        if (!db) {
            throw new Error('Firebase database not initialized. Please check your Firebase configuration.');
        }

        // Check if products already exist
        const existing = await checkExistingProducts();
        if (existing.count > 0) {
            console.log('⚠️  Products already exist in Firebase. Proceeding with upload anyway...');
        }

        const results = [];
        const productsCollection = collection(db, 'products');

        for (let i = 0; i < productsData.length; i++) {
            const product = productsData[i];
            console.log(`📦 Uploading product ${i + 1}/${productsData.length}: ${product.name}`);

            try {
                const transformedProduct = transformProductData(product);
                console.log('📋 Transformed product data:', {
                    name: transformedProduct.name,
                    category: transformedProduct.category,
                    price: transformedProduct.price,
                    sku: transformedProduct.sku
                });

                const docRef = await addDoc(productsCollection, transformedProduct);

                results.push({
                    success: true,
                    id: docRef.id,
                    name: product.name,
                    sku: transformedProduct.sku
                });

                console.log(`✅ Successfully uploaded: ${product.name} (ID: ${docRef.id}, SKU: ${transformedProduct.sku})`);

                // Small delay to avoid overwhelming Firebase
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`❌ Failed to upload ${product.name}:`, error);
                results.push({
                    success: false,
                    name: product.name,
                    error: error.message
                });
            }
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`\n📊 Upload Summary:`);
        console.log(`✅ Successful uploads: ${successful}`);
        console.log(`❌ Failed uploads: ${failed}`);
        console.log(`📱 Total products: ${results.length}`);

        if (successful > 0) {
            console.log('\n🎉 Successfully uploaded products:');
            results.filter(r => r.success).forEach(r => {
                console.log(`  • ${r.name} (ID: ${r.id}, SKU: ${r.sku})`);
            });
        }

        if (failed > 0) {
            console.log('\n❌ Failed uploads:');
            results.filter(r => !r.success).forEach(r => {
                console.log(`  • ${r.name}: ${r.error}`);
            });
        }

        return results;
    } catch (error) {
        console.error('💥 Error in bulk upload:', error);
        throw new Error(`Bulk upload failed: ${error.message}`);
    }
};

// Export the data and functions
export { productsData, transformProductData };