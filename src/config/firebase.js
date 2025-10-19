// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtGxlTOz8mkBT1aJfMvMF0nhMLhh-KFAY",
    authDomain: "finki-rise.firebaseapp.com",
    projectId: "finki-rise",
    storageBucket: "finki-rise.firebasestorage.app",
    messagingSenderId: "17074645421",
    appId: "1:17074645421:web:e287f13e6ea9c59be85924",
    measurementId: "G-DZN3NSMVWF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Authentication functions
const loginWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error signing in:', error.message);
        return { success: false, error: error.message };
    }
};

const registerWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error creating account:', error.message);
        return { success: false, error: error.message };
    }
};

const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Error signing out:', error.message);
        return { success: false, error: error.message };
    }
};

export {
    app,
    auth,
    analytics,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    logout
};