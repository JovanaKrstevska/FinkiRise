import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, createUserProfile } from '../services/databaseService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setCurrentUser(user);
                if (user) {
                    // Determine user role based on email domain (fallback method)
                    const email = user.email;
                    const role = (email.includes('@finki.ukim.mk') || email.includes('@professor.'))
                        ? 'professor' : 'student';

                    // Set basic profile first (fallback)
                    const basicProfile = {
                        email: user.email,
                        role: role,
                        name: user.displayName || email.split('@')[0]
                    };

                    setUserProfile(basicProfile);
                    setUserRole(role);

                    // Try to get/create user profile from database (optional enhancement)
                    try {
                        const profileResult = await getUserProfile(user.uid);

                        if (profileResult.success) {
                            setUserProfile(profileResult.data);
                            setUserRole(profileResult.data.role);
                        } else {
                            // Try to create new user profile
                            await createUserProfile(user.uid, basicProfile);
                        }
                    } catch (dbError) {
                        console.warn('Database operation failed, using fallback profile:', dbError);
                        // Continue with basic profile - app still works without database
                    }
                } else {
                    setUserProfile(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Auth state change error:', error);
                // Set user anyway if we have basic info
                if (user) {
                    const email = user.email;
                    const role = (email.includes('@finki.ukim.mk') || email.includes('@professor.'))
                        ? 'professor' : 'student';
                    setCurrentUser(user);
                    setUserRole(role);
                }
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        userProfile,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};