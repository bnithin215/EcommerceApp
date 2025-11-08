import React, { useState } from 'react';
import { uploadProductsOneByOne } from '../../scripts/uploadProductsToFirebase';
import { Upload, CheckCircle, XCircle, Loader, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadProducts = ({ onUploadComplete, onCancel }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [result, setResult] = useState(null);

    const handleUpload = async () => {
        if (!window.confirm('Are you sure you want to upload all products from saree.json to Firebase? This may take a few minutes.')) {
            return;
        }

        setUploading(true);
        setProgress(null);
        setResult(null);

        try {
            const summary = await uploadProductsOneByOne((progressData) => {
                setProgress(progressData);
            });

            setResult(summary);
            toast.success(`Successfully uploaded ${summary.uploaded} products!`);
            if (onUploadComplete) {
                setTimeout(() => {
                    onUploadComplete();
                }, 2000);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Upload failed: ${error.message}`);
            setResult({
                uploaded: 0,
                skipped: 0,
                errors: 1,
                total: 0,
                error: error.message
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Products to Firebase</h2>
                    <p className="text-gray-600">
                        Upload all products from saree.json to Firebase Firestore database.
                    </p>
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                )}
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Before uploading:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Ensure Firebase is properly configured in your .env file</li>
                            <li>Products with existing SKUs will be skipped (no duplicates)</li>
                            <li>This process may take a few minutes depending on the number of products</li>
                            <li>Do not refresh the page during upload</li>
                        </ul>
                    </div>
                </div>
            </div>

            {progress && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                        <span className="text-sm text-gray-600">
                            {progress.uploaded} / {progress.total}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                            className="bg-pink-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.uploaded / progress.total) * 100}%` }}
                        />
                    </div>
                    {progress.current && (
                        <p className="text-xs text-gray-600">Uploading: {progress.current}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                        <span>✅ Uploaded: {progress.uploaded}</span>
                        <span>⏭️ Skipped: {progress.skipped}</span>
                        <span>❌ Errors: {progress.errors}</span>
                    </div>
                </div>
            )}

            {result && (
                <div className={`mb-6 p-4 border rounded-lg ${
                    result.error 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                }`}>
                    <div className="flex items-start">
                        {result.error ? (
                            <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                        ) : (
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                        )}
                        <div>
                            <p className={`font-semibold mb-2 ${
                                result.error ? 'text-red-800' : 'text-green-800'
                            }`}>
                                {result.error ? 'Upload Failed' : 'Upload Completed'}
                            </p>
                            {result.error ? (
                                <p className="text-sm text-red-700">{result.error}</p>
                            ) : (
                                <div className="text-sm text-green-700 space-y-1">
                                    <p>✅ Uploaded: {result.uploaded} products</p>
                                    <p>⏭️ Skipped: {result.skipped} products (duplicates)</p>
                                    <p>❌ Errors: {result.errors} products</p>
                                    <p>📦 Total: {result.total} products</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all ${
                    uploading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm hover:shadow'
                }`}
            >
                {uploading ? (
                    <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        Uploading Products...
                    </>
                ) : (
                    <>
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Products to Firebase
                    </>
                )}
            </button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                    <strong>Note:</strong> After uploading, you should:
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    <li>Restart your development server</li>
                    <li>Check Firebase Console to verify products are uploaded</li>
                    <li>Products will now load from Firestore instead of JSON files</li>
                </ol>
            </div>
        </div>
    );
};

export default UploadProducts;

