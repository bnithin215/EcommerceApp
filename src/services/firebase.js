// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Enhanced Firebase configuration with validation
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
    const requiredFields = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId'
    ];

    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

    if (missingFields.length > 0) {
        console.error('❌ Missing Firebase configuration fields:', missingFields);
        console.error('📝 To configure Firebase:');
        console.error('   1. Create a .env file in the root directory');
        console.error('   2. Add your Firebase configuration:');
        console.error('      REACT_APP_FIREBASE_API_KEY=your_api_key');
        console.error('      REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com');
        console.error('      REACT_APP_FIREBASE_PROJECT_ID=your-project-id');
        console.error('      REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com');
        console.error('      REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id');
        console.error('      REACT_APP_FIREBASE_APP_ID=your_app_id');
        console.error('   3. Get these values from: https://console.firebase.google.com/');
        console.error('   4. Restart your development server after creating .env');
        console.warn('⚠️  App will run in demo mode without Firebase features (login, cart, etc.)');
        return false;
    }

    console.log('Firebase configuration validated successfully');
    return true;
};

// Initialize Firebase with error handling
let app, db, auth, storage, analytics;

try {
    if (!validateFirebaseConfig()) {
        throw new Error('Invalid Firebase configuration');
    }

    console.log('Initializing Firebase...');
    app = initializeApp(firebaseConfig);

    // Initialize services
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    // Initialize Analytics (only in browser environment)
    if (typeof window !== 'undefined') {
        isSupported().then((supported) => {
            if (supported) {
                analytics = getAnalytics(app);
                console.log('Firebase Analytics initialized');
            } else {
                console.log('Firebase Analytics not supported in this environment');
            }
        }).catch((error) => {
            console.warn('Firebase Analytics initialization failed:', error);
        });
    }

    // Connect to emulators in development (optional)
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true') {
        console.log('🔧 Connecting to Firebase emulators...');

        try {
            // Only connect if not already connected - use try-catch for safety
            try {
                if (auth?._delegate?._config?.emulator) {
                    console.log('Auth emulator already connected');
                } else {
                    connectAuthEmulator(auth, 'http://localhost:9099');
                }
            } catch (authError) {
                console.warn('Could not connect to Auth emulator:', authError.message);
            }

            try {
                if (db?._delegate?._databaseId?.projectId?.includes('demo-')) {
                    console.log('Firestore emulator already connected');
                } else {
                    connectFirestoreEmulator(db, 'localhost', 8080);
                }
            } catch (dbError) {
                console.warn('Could not connect to Firestore emulator:', dbError.message);
            }

            try {
                if (storage?._delegate?._host?.includes('localhost')) {
                    console.log('Storage emulator already connected');
                } else {
                    connectStorageEmulator(storage, 'localhost', 9199);
                }
            } catch (storageError) {
                console.warn('Could not connect to Storage emulator:', storageError.message);
            }
        } catch (error) {
            console.warn('Error connecting to emulators:', error.message);
        }
    }

    console.log('Firebase initialized successfully');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('Auth Domain:', firebaseConfig.authDomain);

} catch (error) {
    console.error('💥 Firebase initialization failed:', error);

    // Create mock objects for development with proper error handling
    console.warn('🔄 Creating mock Firebase objects for development...');
    console.warn('⚠️  IMPORTANT: Firebase is not configured. The app will work in demo mode:');
    console.warn('   ✅ Products can be viewed (using fallback data)');
    console.warn('   ❌ User authentication will not work');
    console.warn('   ❌ Shopping cart will not persist');
    console.warn('   ❌ Orders cannot be placed');
    console.warn('   📝 To enable full features, configure Firebase in your .env file');

    db = {
        _isMock: true,
        app: { options: firebaseConfig }
    };

    auth = {
        _isMock: true,
        currentUser: null,
        // Provide a mock onAuthStateChanged to prevent errors
        onAuthStateChanged: () => {
            console.warn('Firebase Auth is mocked. onAuthStateChanged is not functional.');
            return () => {}; // Return empty unsubscribe function
        }
    };

    storage = {
        _isMock: true
    };

    analytics = null;
}

// Utility function to check if Firebase is ready
export const isFirebaseReady = () => {
    return db && !db._isMock && auth && !auth._isMock;
};

// Utility function to get Firebase status
export const getFirebaseStatus = () => {
    if (!db || db._isMock) {
        return {
            status: 'error',
            message: 'Firebase not initialized properly',
            ready: false
        };
    }

    return {
        status: 'connected',
        message: 'Firebase ready',
        ready: true,
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain
    };
};

// Enhanced error handling for Firebase operations
export const handleFirebaseError = (error, operation = 'Firebase operation') => {
    console.error(` ${operation} failed:`, error);

    // Common Firebase error messages
    const errorMessages = {
        'auth/user-not-found': 'User not found. Please check your credentials.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'firestore/permission-denied': 'Permission denied. Please check your Firestore rules.',
        'firestore/unavailable': 'Firestore is temporarily unavailable. Please try again.',
        'storage/unauthorized': 'Not authorized to access storage. Please check permissions.',
        'storage/canceled': 'Upload was canceled.',
        'storage/unknown': 'Unknown storage error occurred.'
    };

    const userFriendlyMessage = errorMessages[error.code] || error.message;

    return {
        code: error.code,
        message: userFriendlyMessage,
        originalError: error
    };
};

// Test Firebase connection
export const testFirebaseConnection = async () => {
    try {
        if (!isFirebaseReady()) {
            throw new Error('Firebase not ready');
        }

        // Try to access Firestore
        const { collection, getDocs } = await import('firebase/firestore');
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);

        return {
            success: true,
            message: 'Firebase connection successful',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            success: false,
            message: `Firebase connection failed: ${error.message}`,
            error: error,
            timestamp: new Date().toISOString()
        };
    }
};

export { app, db, auth, storage, analytics };