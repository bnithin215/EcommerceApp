import React, { useState, useEffect, useCallback } from 'react';
import { Upload, X, Plus, Minus, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { PRODUCT_CATEGORIES, PRODUCT_FILTERS } from '../../utils/constants';
import { productAPI, storageAPI } from '../../services/api';
import { validateImageFile, generateId } from '../../utils/helpers';
import { ButtonLoader, LoadingOverlay } from '../common/Loader';
import toast from 'react-hot-toast';

const ProductForm = ({ product = null, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        originalPrice: product?.originalPrice || '',
        fabric: product?.fabric || '',
        category: product?.category || 'silk',
        inStock: product?.inStock || 0,
        colors: product?.colors || [''],
        features: product?.features || [''],
        care: product?.care || 'Dry clean recommended',
        images: product?.images || [],
        weight: product?.weight || '',
        length: product?.length || '',
        blouseIncluded: product?.blouseIncluded || false,
        occasion: product?.occasion || '',
        sku: product?.sku || ''
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [errors, setErrors] = useState({});

    // Generate SKU if not exists
    useEffect(() => {
        if (!formData.sku && !product) {
            setFormData(prev => ({
                ...prev,
                sku: generateId().toUpperCase()
            }));
        }
    }, [formData.sku, product]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayItem = (field, index) => {
        if (formData[field].length > 1) {
            setFormData(prev => ({
                ...prev,
                [field]: prev[field].filter((_, i) => i !== index)
            }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const validationErrors = [];
        const newPreviews = [];

        files.forEach(file => {
            const fileErrors = validateImageFile(file);
            if (fileErrors.length === 0) {
                validFiles.push(file);
                newPreviews.push({
                    file,
                    preview: URL.createObjectURL(file),
                    id: generateId()
                });
            } else {
                validationErrors.push(...fileErrors);
            }
        });

        if (validationErrors.length > 0) {
            toast.error(validationErrors[0]);
            return;
        }

        if (imageFiles.length + validFiles.length > 10) {
            toast.error('Maximum 10 images allowed per product');
            return;
        }

        setImageFiles(prev => [...prev, ...validFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeExistingImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeNewImage = (index) => {
        const preview = imagePreviews[index];
        if (preview && preview.preview) {
            URL.revokeObjectURL(preview.preview);
        }

        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = useCallback(() => {
        const newErrors = {};

        // Required field validations
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Product name must be at least 3 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Valid price is required';
        }

        if (formData.originalPrice && parseFloat(formData.originalPrice) <= parseFloat(formData.price)) {
            newErrors.originalPrice = 'Original price must be higher than selling price';
        }

        if (!formData.fabric.trim()) {
            newErrors.fabric = 'Fabric type is required';
        }

        if (formData.inStock < 0) {
            newErrors.inStock = 'Stock cannot be negative';
        }

        // Image validation
        const totalImages = formData.images.length + imageFiles.length;
        if (totalImages === 0) {
            newErrors.images = 'At least one product image is required';
        }

        // Clean empty array items
        const cleanColors = formData.colors.filter(color => color.trim() !== '');

        if (cleanColors.length === 0) {
            newErrors.colors = 'At least one color is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, imageFiles.length]);

    const uploadImages = async () => {
        if (imageFiles.length === 0) return [];

        const uploadPromises = imageFiles.map(async (file, index) => {
            try {
                setUploadProgress(prev => ({ ...prev, [index]: 0 }));

                // Simulate upload progress for demo
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => ({
                        ...prev,
                        [index]: Math.min((prev[index] || 0) + Math.random() * 30, 90)
                    }));
                }, 200);

                const imageUrl = await storageAPI.uploadImage(file, 'products');

                clearInterval(progressInterval);
                setUploadProgress(prev => ({ ...prev, [index]: 100 }));

                return imageUrl;
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error(`Failed to upload ${file.name}`);
                throw error;
            }
        });

        return await Promise.all(uploadPromises);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Form submitted with data:', formData);
        console.log('Image files:', imageFiles);

        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        try {
            setUploading(true);
            let imageUrls = [...formData.images];

            // Upload new images
            if (imageFiles.length > 0) {
                console.log('Uploading images...');
                const newImageUrls = await uploadImages();
                imageUrls = [...imageUrls, ...newImageUrls];
                console.log('Images uploaded:', newImageUrls);
            }

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                inStock: parseInt(formData.inStock),
                weight: formData.weight ? parseFloat(formData.weight) : null,
                length: formData.length ? parseFloat(formData.length) : null,
                colors: formData.colors.filter(color => color.trim() !== ''),
                features: formData.features.filter(feature => feature.trim() !== ''),
                images: imageUrls,
                rating: product?.rating || 0,
                reviews: product?.reviews || 0,
                featured: product?.featured || false,
                createdAt: product?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('Final product data:', productData);

            let savedProduct;
            if (product) {
                // Update existing product
                console.log('Updating product:', product.id);
                await productAPI.updateProduct(product.id, productData);
                savedProduct = { ...productData, id: product.id };
                toast.success('Product updated successfully!');
            } else {
                // Create new product
                console.log('Creating new product...');
                const productId = await productAPI.createProduct(productData);
                console.log('Product created with ID:', productId);
                savedProduct = { ...productData, id: productId };
                toast.success('Product created successfully!');
            }

            // Clean up previews
            imagePreviews.forEach(preview => {
                if (preview.preview) {
                    URL.revokeObjectURL(preview.preview);
                }
            });

            // Call the onSave callback
            if (onSave) {
                onSave(savedProduct);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Error saving product. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress({});
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
            {uploading && (
                <LoadingOverlay message="Saving product..." />
            )}

            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    {product ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    {product ? 'Update product information' : 'Fill in the product details to add to inventory'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                    <h4 className="text-md font-medium text-gray-900 border-b pb-2">Basic Information</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Enter product name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                {PRODUCT_CATEGORIES.slice(1).map(category => (
                                    <option key={category.id} value={category.slug}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Enter detailed product description"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SKU
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="Auto-generated SKU"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Occasion
                            </label>
                            <select
                                name="occasion"
                                value={formData.occasion}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="">Select occasion</option>
                                <option value="wedding">Wedding</option>
                                <option value="party">Party</option>
                                <option value="festival">Festival</option>
                                <option value="casual">Casual</option>
                                <option value="office">Office/Formal</option>
                                <option value="ethnic">Traditional/Ethnic</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pricing and Inventory */}
                <div className="space-y-6">
                    <h4 className="text-md font-medium text-gray-900 border-b pb-2">Pricing & Inventory</h4>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selling Price * (₹)
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                    errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="0"
                                min="0"
                                step="0.01"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Original Price (₹)
                            </label>
                            <input
                                type="number"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                    errors.originalPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="0"
                                min="0"
                                step="0.01"
                            />
                            {errors.originalPrice && (
                                <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Quantity *
                            </label>
                            <input
                                type="number"
                                name="inStock"
                                value={formData.inStock}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                    errors.inStock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="0"
                                min="0"
                            />
                            {errors.inStock && (
                                <p className="mt-1 text-sm text-red-600">{errors.inStock}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight (grams)
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    <h4 className="text-md font-medium text-gray-900 border-b pb-2">Product Details</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fabric Type *
                            </label>
                            <select
                                name="fabric"
                                value={formData.fabric}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                                    errors.fabric ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select fabric</option>
                                {PRODUCT_FILTERS.fabrics.map(fabric => (
                                    <option key={fabric} value={fabric}>{fabric}</option>
                                ))}
                            </select>
                            {errors.fabric && (
                                <p className="mt-1 text-sm text-red-600">{errors.fabric}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Length (meters)
                            </label>
                            <input
                                type="number"
                                name="length"
                                value={formData.length}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="5.5"
                                min="0"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Care Instructions
                            </label>
                            <select
                                name="care"
                                value={formData.care}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="Dry clean recommended">Dry clean recommended</option>
                                <option value="Dry clean only">Dry clean only</option>
                                <option value="Machine washable">Machine washable</option>
                                <option value="Hand wash only">Hand wash only</option>
                                <option value="Machine wash cold">Machine wash cold</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="blouseIncluded"
                            checked={formData.blouseIncluded}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Blouse piece included
                        </label>
                    </div>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 border-b pb-2">Available Colors *</h4>
                    {formData.colors.map((color, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => handleArrayChange('colors', index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="Enter color (e.g., Red, Royal Blue)"
                            />
                            {formData.colors.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('colors', index)}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addArrayItem('colors')}
                        className="flex items-center text-pink-600 hover:text-pink-700 text-sm font-medium"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Color
                    </button>
                    {errors.colors && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.colors}
                        </p>
                    )}
                </div>

                {/* Features */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 border-b pb-2">Product Features</h4>
                    {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleArrayChange('features', index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="Enter feature (e.g., Handwoven, Gold thread work)"
                            />
                            {formData.features.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('features', index)}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addArrayItem('features')}
                        className="flex items-center text-pink-600 hover:text-pink-700 text-sm font-medium"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Feature
                    </button>
                </div>

                {/* Images */}
                <div className="space-y-6">
                    <h4 className="text-md font-medium text-gray-900 border-b pb-2">Product Images *</h4>

                    {/* Existing Images */}
                    {formData.images.length > 0 && (
                        <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-3">Current Images</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Images Preview */}
                    {imagePreviews.length > 0 && (
                        <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-3">New Images</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={preview.id} className="relative group">
                                        <img
                                            src={preview.preview}
                                            alt={`New ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                        />
                                        {uploadProgress[index] !== undefined && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                <div className="text-white text-xs font-medium">
                                                    {Math.round(uploadProgress[index])}%
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors">
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <ImageIcon className="h-12 w-12 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Upload Product Images</h3>
                                <p className="text-gray-500">Drag and drop your images here, or click to browse</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    PNG, JPG, WEBP up to 5MB each • Maximum 10 images
                                </p>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors"
                            >
                                <Upload className="h-5 w-5 mr-2" />
                                Choose Images
                            </label>
                        </div>
                    </div>

                    {errors.images && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.images}
                        </p>
                    )}
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={uploading}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={uploading}
                        className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {uploading ? (
                            <>
                                <ButtonLoader className="mr-2" />
                                {imageFiles.length > 0 ? 'Uploading Images...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-5 w-5" />
                                {product ? 'Update Product' : 'Create Product'}
                            </>
                        )}
                    </button>
                </div>

                {/* Upload Progress */}
                {uploading && imageFiles.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">Uploading Images...</p>
                        <div className="space-y-2">
                            {imageFiles.map((file, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <span className="text-sm text-blue-700 flex-1">{file.name}</span>
                                    <div className="w-32 bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress[index] || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-blue-700 w-12 text-right">
                                        {Math.round(uploadProgress[index] || 0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ProductForm;