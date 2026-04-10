"use client"
import { initializeApp } from "firebase/app";
import { createContext, useContext, useEffect, useState } from "react";

import { getFirestore } from "firebase/firestore";
import { saveUserAfterLogin } from "./user.controller";
import { toast } from "sonner";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firebasedb = getFirestore(app);
setPersistence(auth, browserSessionPersistence);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context)
    throw new Error("useFirebase must be used within a FirebaseProvider");
  return context;
};

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  // TODO: Implement user authentication logic
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null); // type User from firebase/auth
  const [authloading, setAuthloading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser(user);
        setIsUserLoggedIn(true);
      } else {
        setIsUserLoggedIn(false);
      }
      setAuthloading(false);
    });
  },[]);

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      toast.success(`Signed up as ${result.user.email}`);
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed. Please try again.');
    }
  };
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success(`Welcome back, ${result.user.email}`);
    } catch (error: any) {
      toast.error("Invalid email or password");
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(`Signed in as ${result.user.displayName}`);
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed.');
    }
  };

  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      toast.success(
        `Signed in as ${result.user.displayName || result.user.email}`
      );
    } catch (error: any) {
      toast.error(error.message || 'GitHub sign-in failed.');
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out");
    } catch (error: any) {
      toast.error("Failed to log out.");
    }
  };

  

  return (
    <FirebaseContext.Provider value={{
       isUserLoggedIn,
       loggedInUser,
       signInWithEmail,
       signUpWithEmail,
       signInWithGithub,
       signInWithGoogle,
       logOut,
       authloading,
     }}>
      {children}
    </FirebaseContext.Provider>
  )
}