import { RAZORPAY_CONFIG, COMPANY_INFO } from '../utils/constants';
import { orderAPI } from './api';

// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Payment Service
class PaymentService {
    constructor() {
        this.isScriptLoaded = false;
    }

    async initializeRazorpay() {
        // Check if Razorpay key is configured
        if (!RAZORPAY_CONFIG.key || RAZORPAY_CONFIG.key === '') {
            throw new Error('Razorpay Key ID is not configured. Please add REACT_APP_RAZORPAY_KEY_ID to your .env file and restart the application.');
        }

        if (!this.isScriptLoaded) {
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
            }
            this.isScriptLoaded = true;
        }
        
        if (!window.Razorpay) {
            throw new Error('Razorpay SDK is not available. Please refresh the page.');
        }
        
        return window.Razorpay;
    }

    async createOrder(orderData) {
        try {
            // Create order in your database first
            const orderId = await orderAPI.createOrder(orderData);

            // For Razorpay testing: We'll let Razorpay create the order automatically
            // In production, you should create a Razorpay order via your backend API first
            // For now, we'll return order data without Razorpay order_id
            // Razorpay will automatically create the order when payment is initiated
            // For Razorpay testing, we use INR currency
            // In production with international orders, you may need to handle currency conversion
            return {
                id: orderId, // Database order ID
                amount: Math.round(orderData.total * 100), // Amount in paisa (for INR)
                currency: 'INR', // Razorpay test mode works with INR
                receipt: `receipt_${orderId}`,
                status: 'created'
            };
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async processPayment(orderData, userDetails) {
        try {
            // Validate Razorpay key is configured
            console.log('Checking Razorpay configuration...', {
                hasKey: !!RAZORPAY_CONFIG.key,
                keyLength: RAZORPAY_CONFIG.key?.length || 0,
                keyPrefix: RAZORPAY_CONFIG.key?.substring(0, 10) || 'NOT SET'
            });
            
            if (!RAZORPAY_CONFIG.key || RAZORPAY_CONFIG.key === '' || RAZORPAY_CONFIG.key.trim() === '') {
                console.error('Razorpay Key ID is missing!', {
                    envValue: process.env.REACT_APP_RAZORPAY_KEY_ID,
                    configValue: RAZORPAY_CONFIG.key
                });
                throw new Error('Razorpay Key ID is not configured. Please add REACT_APP_RAZORPAY_KEY_ID to your .env file and restart the application.');
            }

            const Razorpay = await this.initializeRazorpay();

            // Create order in database
            const order = await this.createOrder(orderData);

            return new Promise((resolve, reject) => {
                // For testing: Razorpay will automatically create an order
                // In production, you should create a Razorpay order via backend API first
                // and pass the order_id here instead of amount
                const options = {
                    key: RAZORPAY_CONFIG.key,
                    amount: order.amount, // Amount in paisa
                    currency: order.currency || 'INR',
                    name: RAZORPAY_CONFIG.name,
                    description: RAZORPAY_CONFIG.description || `Order #${order.id}`,
                    image: RAZORPAY_CONFIG.image,
                    // Note: For testing, we're not passing order_id
                    // Razorpay will create the order automatically
                    // In production, create order via backend API and pass: order_id: 'order_xxxxx'
                    handler: async (response) => {
                        try {
                            console.log('Payment successful:', response);
                            
                            // Verify payment and update order in database
                            const verificationResult = await this.verifyPayment(response, order.id);
                            
                            resolve({
                                success: true,
                                payment: response,
                                order: order,
                                verification: verificationResult
                            });
                        } catch (error) {
                            console.error('Payment verification error:', error);
                            reject({
                                success: false,
                                error: error.message || 'Payment verification failed'
                            });
                        }
                    },
                    prefill: {
                        name: userDetails.name || '',
                        email: userDetails.email || '',
                        contact: userDetails.phone || userDetails.contact || ''
                    },
                    notes: {
                        order_id: order.id, // Database order ID
                        customer_id: userDetails.id || ''
                    },
                    theme: {
                        color: '#ec4899' // Pink color matching the app theme
                    },
                    modal: {
                        ondismiss: () => {
                            reject({
                                success: false,
                                error: 'Payment cancelled by user'
                            });
                        }
                    }
                };

                try {
                    const razorpayInstance = new Razorpay(options);
                    
                    // Handle payment failure
                    razorpayInstance.on('payment.failed', (response) => {
                        console.error('Payment failed:', response);
                        reject({
                            success: false,
                            error: response.error?.description || 'Payment failed. Please try again.'
                        });
                    });
                    
                    // Open Razorpay checkout
                    razorpayInstance.open();
                } catch (error) {
                    console.error('Error opening Razorpay:', error);
                    reject({
                        success: false,
                        error: 'Failed to initialize payment gateway. Please check your Razorpay configuration.'
                    });
                }
            });
        } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
        }
    }

    async verifyPayment(paymentResponse, orderId) {
        try {
            // In production, send this to your backend for verification
            // For demo purposes, we'll simulate verification
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResponse;

            // Simulate verification delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update order status in database
            await orderAPI.updatePaymentStatus(orderId, 'success', {
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                signature: razorpay_signature,
                method: 'razorpay',
                timestamp: new Date().toISOString()
            });

            return {
                verified: true,
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id
            };
        } catch (error) {
            console.error('Payment verification error:', error);

            // Update order with failed payment
            await orderAPI.updatePaymentStatus(orderId, 'failed', {
                error: error.message,
                timestamp: new Date().toISOString()
            });

            throw error;
        }
    }

    async initiateRefund(paymentId, amount, reason = '') {
        try {
            // In production, call your backend API for refund
            // For demo purposes, we'll simulate refund process
            console.log('Initiating refund:', { paymentId, amount, reason });

            // Simulate refund delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            return {
                refund_id: `rfnd_${Date.now()}`,
                payment_id: paymentId,
                amount: amount,
                status: 'processed',
                created_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Refund error:', error);
            throw error;
        }
    }

    // Utility methods for payment handling
    formatAmount(amount) {
        return Math.round(amount * 100); // Convert to paisa
    }

    parseAmount(amount) {
        return amount / 100; // Convert from paisa to rupees
    }

    generateReceiptId(orderId) {
        return `receipt_${orderId}_${Date.now()}`;
    }

    validatePaymentData(orderData) {
        const errors = [];

        if (!orderData.total || orderData.total <= 0) {
            errors.push('Invalid order amount');
        }

        if (!orderData.items || orderData.items.length === 0) {
            errors.push('Order must contain at least one item');
        }

        if (!orderData.customerDetails) {
            errors.push('Customer details are required');
        }

        if (!orderData.shippingAddress) {
            errors.push('Shipping address is required');
        }

        return errors;
    }

    // Handle payment errors
    handlePaymentError(error) {
        console.error('Payment error:', error);

        const errorMessages = {
            'BAD_REQUEST_ERROR': 'Invalid payment request. Please try again.',
            'GATEWAY_ERROR': 'Payment gateway error. Please try again later.',
            'NETWORK_ERROR': 'Network error. Please check your connection.',
            'SERVER_ERROR': 'Server error. Please try again later.',
            'RATE_LIMIT_ERROR': 'Too many requests. Please try again later.'
        };

        return errorMessages[error.code] || error.message || 'Payment failed. Please try again.';
    }

    // Get payment status
    async getPaymentStatus(paymentId) {
        try {
            // In production, call your backend API
            // For demo purposes, return mock status
            return {
                id: paymentId,
                status: 'captured',
                amount: 250000, // Amount in paisa
                currency: 'INR',
                method: 'card',
                captured: true,
                created_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching payment status:', error);
            throw error;
        }
    }

    // Calculate fees (if any)
    calculatePaymentFees(amount, method = 'card') {
        // Razorpay fee structure (approximate)
        const feeRates = {
            card: 0.02, // 2%
            netbanking: 0.015, // 1.5%
            upi: 0.005, // 0.5%
            wallet: 0.01 // 1%
        };

        const rate = feeRates[method] || feeRates.card;
        const fee = amount * rate;
        const gst = fee * 0.18; // 18% GST on fees

        return {
            fee: Math.round(fee * 100) / 100,
            gst: Math.round(gst * 100) / 100,
            total: Math.round((fee + gst) * 100) / 100
        };
    }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;