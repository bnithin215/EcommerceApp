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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                await fetchUserProfile(user.uid);
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserProfile = async (uid) => {
        try {
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
            setLoading(true);
            const { email, password, firstName, lastName, phone } = userData;
            const displayName = `${firstName} ${lastName}`;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName });

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
            await signOut(auth);
            toast.success('Logged out successfully!');
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
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