// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Enhanced Firebase configuration with validation
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
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
        console.error('Missing Firebase configuration fields:', missingFields);
        console.error('Please check your .env file and ensure all REACT_APP_FIREBASE_* variables are set');
        return false;
    }

    console.log('Firebase configuration validated successfully');
    return true;
};

// Initialize Firebase with error handling
let app, db, auth, storage;

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

    // Connect to emulators in development (optional)
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true') {
        console.log('🔧 Connecting to Firebase emulators...');

        // Only connect if not already connected
        if (!auth._delegate._config.emulator) {
            connectAuthEmulator(auth, 'http://localhost:9099');
        }

        if (!db._delegate._databaseId.projectId.includes('demo-')) {
            connectFirestoreEmulator(db, 'localhost', 8080);
        }

        if (!storage._delegate._host.includes('localhost')) {
            connectStorageEmulator(storage, 'localhost', 9199);
        }
    }

    console.log('Firebase initialized successfully');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('Auth Domain:', firebaseConfig.authDomain);

} catch (error) {
    console.error('💥 Firebase initialization failed:', error);

    // Create mock objects for development
    console.warn('🔄 Creating mock Firebase objects for development...');

    db = {
        _isMock: true,
        app: { options: firebaseConfig }
    };

    auth = {
        _isMock: true,
        currentUser: null
    };

    storage = {
        _isMock: true
    };
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

export { app, db, auth, storage };