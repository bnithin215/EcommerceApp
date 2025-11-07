import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    // Monitor auth state changes
    useEffect(() => {
        // Check if auth is properly initialized
        if (!auth || auth._isMock) {
            console.warn('Firebase Auth not properly initialized, skipping auth state listener');
            setLoading(false);
            return;
        }

        let unsubscribe;
        try {
            unsubscribe = onAuthStateChanged(auth, async (user) => {
                try {
                    if (user) {
                        setUser(user);
                        await fetchUserProfile(user.uid);
                    } else {
                        setUser(null);
                        setUserProfile(null);
                    }
                } catch (error) {
                    console.error('Error in auth state change handler:', error);
                } finally {
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error('Error setting up auth state listener:', error);
            setLoading(false);
        }

        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                try {
                    unsubscribe();
                } catch (error) {
                    console.error('Error unsubscribing from auth state:', error);
                }
            }
        };
    }, []);

    const fetchUserProfile = async (uid) => {
        try {
            if (!db || db._isMock) {
                console.warn('Firebase Firestore not initialized, skipping user profile fetch');
                return;
            }

            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const register = async (userData) => {
        try {
            if (!auth || auth._isMock) {
                const errorMsg = 'Firebase Auth is not configured. To enable authentication:\n1. Create a .env file in the root directory\n2. Add your Firebase configuration (see console for details)\n3. Restart the development server';
                console.error(errorMsg);
                throw new Error('Firebase Auth is not configured. Please check the console for setup instructions.');
            }

            setLoading(true);
            const { email, password, firstName, lastName, phone } = userData;
            const displayName = `${firstName} ${lastName}`;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName });

            if (db && !db._isMock) {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName,
                    firstName,
                    lastName,
                    phone,
                    role: 'customer',
                    createdAt: new Date().toISOString(),
                    isActive: true
                });
            }

            toast.success('Account created successfully!');
            return user;
        } catch (error) {
            toast.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            if (!auth || auth._isMock) {
                const errorMsg = 'Firebase Auth is not configured. To enable authentication:\n1. Create a .env file in the root directory\n2. Add your Firebase configuration (see console for details)\n3. Restart the development server';
                console.error(errorMsg);
                throw new Error('Firebase Auth is not configured. Please check the console for setup instructions.');
            }

            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            toast.success('Logged in successfully!');
            return userCredential.user;
        } catch (error) {
            toast.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (!auth || auth._isMock) {
                console.warn('Firebase Auth not initialized, clearing local state');
                setUser(null);
                setUserProfile(null);
                return;
            }

            await signOut(auth);
            toast.success('Logged out successfully!');
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            if (!auth || auth._isMock) {
                const errorMsg = 'Firebase Auth is not configured. To enable password reset:\n1. Create a .env file in the root directory\n2. Add your Firebase configuration (see console for details)\n3. Restart the development server';
                console.error(errorMsg);
                throw new Error('Firebase Auth is not configured. Please check the console for setup instructions.');
            }

            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent!');
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const isAuthenticated = () => !!user;
    const isAdmin = () => userProfile?.role === 'admin';

    const value = {
        user,
        userProfile,
        loading,
        register,
        login,
        logout,
        resetPassword,
        isAuthenticated,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};