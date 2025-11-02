// src/components/admin/ProductUploader.js
import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Database, RefreshCw, Package } from 'lucide-react';
import { uploadProductsToFirebase, checkExistingProducts } from '../../scripts/uploadProducts';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProductUploader = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [existingProducts, setExistingProducts] = useState(null);
    const [checking, setChecking] = useState(false);

    const handleCheckExisting = async () => {
        try {
            setChecking(true);
            const existing = await checkExistingProducts();
            setExistingProducts(existing);

            if (existing.count > 0) {
                toast.success(`Found ${existing.count} existing products in Firebase`);
            } else {
                toast.success('No existing products found. Ready to upload!');
            }
        } catch (error) {
            console.error('Check existing error:', error);
            toast.error(`Failed to check existing products: ${error.message}`);
        } finally {
            setChecking(false);
        }
    };

    const handleUploadProducts = async () => {
        try {
            setUploading(true);
            setUploadResults(null);

            console.log('Starting product upload...');
            toast.loading('Uploading products to Firebase...', { id: 'upload' });

            const results = await uploadProductsToFirebase();

            setUploadResults(results);

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            toast.dismiss('upload');

            if (failed === 0) {
                toast.success(`Successfully uploaded all ${successful} products!`);
            } else {
                toast.error(`Uploaded ${successful} products, ${failed} failed`);
            }

            // Refresh existing count
            await handleCheckExisting();

        } catch (error) {
            console.error('Upload error:', error);
            toast.dismiss('upload');
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleRefreshProducts = async () => {
        try {
            setRefreshing(true);
            toast.loading('Refreshing products from Firebase...', { id: 'refresh' });

            // Force refresh by calling the API
            const result = await productAPI.getAllProducts();
            console.log('Refreshed products from Firebase:', result);

            toast.dismiss('refresh');
            toast.success(`Loaded ${result.products.length} products from Firebase`);

            // Optionally refresh the page to reload all product data
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Refresh error:', error);
            toast.dismiss('refresh');
            toast.error(`Failed to refresh: ${error.message}`);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Database Management</h3>
                    <p className="text-sm text-gray-600">
                        Upload initial product data to Firebase and manage your product database.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Check Existing Section */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Package className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Check Existing Products</h4>
                                <p className="text-sm text-gray-600">
                                    {existingProducts ?
                                        `Found ${existingProducts.count} products in Firebase` :
                                        'Check how many products are already in Firebase'
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleCheckExisting}
                            disabled={checking}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {checking ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Package className="h-4 w-4 mr-2" />
                                    Check Products
                                </>
                            )}
                        </button>
                    </div>

                    {/* Upload Section */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Upload className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Upload Sample Products</h4>
                                <p className="text-sm text-gray-600">Upload 5 sample saree products to Firebase</p>
                            </div>
                        </div>
                        <button
                            onClick={handleUploadProducts}
                            disabled={uploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {uploading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Products
                                </>
                            )}
                        </button>
                    </div>

                    {/* Refresh Section */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Database className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Refresh from Firebase</h4>
                                <p className="text-sm text-gray-600">Fetch latest products from Firebase database</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefreshProducts}
                            disabled={refreshing}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {refreshing ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh Products
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Upload Results */}
                {uploadResults && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Upload Results</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {uploadResults.map((result, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                    {result.success ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span className="text-green-700">
                        {result.name} - Uploaded successfully
                      </span>
                                            {result.sku && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          SKU: {result.sku}
                        </span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                            <span className="text-red-700">
                        {result.name} - Failed: {result.error}
                      </span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">
                                <strong>Summary:</strong> {uploadResults.filter(r => r.success).length} successful, {uploadResults.filter(r => !r.success).length} failed
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>First, click "Check Products" to see existing products in Firebase</li>
                        <li>Click "Upload Products" to add sample products to Firebase</li>
                        <li>Wait for the upload to complete and check results</li>
                        <li>Click "Refresh Products" to load products from Firebase in your app</li>
                        <li>Navigate to Product Management to see the uploaded products</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default ProductUploader;