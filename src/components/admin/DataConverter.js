// src/components/admin/DataConverter.js
import React, { useState } from 'react';
import { Download, Upload, ArrowRight, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const DataConverter = () => {
    const [originalData, setOriginalData] = useState('');
    const [convertedData, setConvertedData] = useState('');
    const [converting, setConverting] = useState(false);

    // Your original data as default
    const defaultData = `[
  {
    "name": "Magenta Silk Saree",
    "category": "Silk Sarees",
    "color": "Magenta",
    "size": 5.5,
    "price": 4999,
    "originalPrice": 7499,
    "weight": 650,
    "occasion": "Wedding",
    "features": ["Gold Zari Border", "Traditional Weave"],
    "imageUrl": "https://i.pinimg.com/736x/8a/e0/f8/8ae0f80209332b243b0d93fb497cc4fa.jpg"
  },
  {
    "name": "Royal Blue Designer Saree",
    "category": "Designer Sarees",
    "color": "Royal Blue",
    "size": 5.8,
    "price": 5799,
    "originalPrice": 8299,
    "weight": 600,
    "occasion": "Party Wear",
    "features": ["Stone Work", "Designer Blouse"],
    "imageUrl": "https://i.pinimg.com/736x/59/08/f4/5908f4b1985c6dac02640866c7944a02.jpg"
  },
  {
    "name": "Teal Cotton Printed Saree",
    "category": "Cotton Sarees",
    "color": "Teal",
    "size": 6.3,
    "price": 1599,
    "originalPrice": 2299,
    "weight": 480,
    "occasion": "Casual Wear",
    "features": ["Printed Pattern", "Soft Fabric"],
    "imageUrl": "https://i.pinimg.com/736x/28/1c/18/281c185273c799c2a68ea4f8623ad773.jpg"
  },
  {
    "name": "Maroon Bridal Silk Saree",
    "category": "Wedding Collection",
    "color": "Maroon",
    "size": 5.5,
    "price": 8499,
    "originalPrice": 11500,
    "weight": 720,
    "occasion": "Wedding",
    "features": ["Heavy Zari Work", "Rich Pallu"],
    "imageUrl": "https://www.bangaloredesignerboutique.com/wp-content/uploads/2024/01/Set-4-image-3.jpg"
  },
  {
    "name": "Golden Yellow Festive Saree",
    "category": "Silk Sarees",
    "color": "Golden Yellow",
    "size": 5.5,
    "price": 3999,
    "originalPrice": 5999,
    "weight": 580,
    "occasion": "Festive",
    "features": ["Shimmer Finish", "Contrasting Border"],
    "imageUrl": "https://i.pinimg.com/736x/43/7d/fa/437dfaebf0deff4931d02e05d6025ca7.jpg"
  }
]`;

    // Conversion functions
    const mapCategoryToFirebase = (category) => {
        const categoryMap = {
            'Silk Sarees': 'silk',
            'Designer Sarees': 'designer',
            'Cotton Sarees': 'cotton',
            'Wedding Collection': 'wedding',
            'Party Wear': 'party',
            'Casual Wear': 'casual'
        };
        return categoryMap[category] || category.toLowerCase().replace(/\s+/g, '');
    };

    const determineFabricFromCategory = (category) => {
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

    const determineCareFromCategory = (category) => {
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

    const convertData = (yourData) => {
        return yourData.map(item => ({
            name: item.name,
            category: mapCategoryToFirebase(item.category),
            price: item.price,
            originalPrice: item.originalPrice,
            description: `Beautiful ${item.name.toLowerCase()} perfect for ${item.occasion.toLowerCase()}. Features ${item.features.join(' and ').toLowerCase()}.`,
            fabric: determineFabricFromCategory(mapCategoryToFirebase(item.category)),
            color: item.color,
            colors: [item.color],
            features: item.features,
            imageUrl: item.imageUrl,
            images: [item.imageUrl],
            weight: item.weight,
            length: item.size,
            occasion: item.occasion,
            care: determineCareFromCategory(mapCategoryToFirebase(item.category)),
            inStock: Math.floor(Math.random() * 20) + 5,
            rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
            reviews: Math.floor(Math.random() * 200) + 50,
            blouseIncluded: Math.random() > 0.5,
            featured: Math.random() > 0.7
        }));
    };

    const handleConvert = () => {
        try {
            setConverting(true);

            const dataToConvert = originalData || defaultData;
            const parsedData = JSON.parse(dataToConvert);

            let dataArray = Array.isArray(parsedData) ? parsedData : parsedData.products || [];

            if (dataArray.length === 0) {
                throw new Error('No valid products found in the data');
            }

            const converted = convertData(dataArray);
            setConvertedData(JSON.stringify(converted, null, 2));

            toast.success(`Successfully converted ${converted.length} products!`);
        } catch (error) {
            toast.error(`Conversion failed: ${error.message}`);
            console.error('Conversion error:', error);
        } finally {
            setConverting(false);
        }
    };

    const downloadConverted = () => {
        if (!convertedData) {
            toast.error('No converted data to download');
            return;
        }

        const blob = new Blob([convertedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'firebase-ready-products.json';
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Downloaded firebase-ready-products.json');
    };

    const copyToClipboard = async () => {
        if (!convertedData) {
            toast.error('No converted data to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(convertedData);
            toast.success('Converted JSON copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const loadDefaultData = () => {
        setOriginalData(defaultData);
        toast.success('Loaded default sample data');
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        JSON Data Converter
                    </h3>
                    <p className="text-sm text-gray-600">
                        Convert your product data format to Firebase-ready format. Paste your JSON data or use the sample data.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Original Data Input */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Original Data</h4>
                            <button
                                onClick={loadDefaultData}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Load Sample Data
                            </button>
                        </div>
                        <textarea
                            value={originalData}
                            onChange={(e) => setOriginalData(e.target.value)}
                            placeholder="Paste your JSON data here or click 'Load Sample Data'"
                            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                            style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                        />
                    </div>

                    {/* Converted Data Output */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Firebase-Ready Data</h4>
                            {convertedData && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                                    >
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copy
                                    </button>
                                    <button
                                        onClick={downloadConverted}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </button>
                                </div>
                            )}
                        </div>
                        <textarea
                            value={convertedData}
                            readOnly
                            placeholder="Converted data will appear here..."
                            className="w-full h-96 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                            style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                        />
                    </div>
                </div>

                {/* Convert Button */}
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleConvert}
                        disabled={converting}
                        className="flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {converting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Converting...
                            </>
                        ) : (
                            <>
                                <ArrowRight className="h-5 w-5 mr-2" />
                                Convert to Firebase Format
                            </>
                        )}
                    </button>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">How to Use:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Paste your original JSON data in the left textarea (or use sample data)</li>
                        <li>Click "Convert to Firebase Format" to transform the data</li>
                        <li>Copy the converted JSON or download it as a file</li>
                        <li>Use the converted JSON in the "JSON File Upload" section</li>
                    </ol>
                </div>

                {/* Data Format Info */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Data Transformation:</h4>
                    <div className="text-sm text-yellow-800 space-y-1">
                        <p>• Maps category names to Firebase-friendly slugs</p>
                        <p>• Generates descriptions from name, occasion, and features</p>
                        <p>• Adds fabric type based on category</p>
                        <p>• Converts single color to colors array</p>
                        <p>• Adds random stock, rating, and review counts</p>
                        <p>• Sets care instructions based on category</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataConverter;