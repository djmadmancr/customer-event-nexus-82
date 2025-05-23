
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration with fallback values if environment variables are not set
// For development purposes, we're using fallback values directly in the code
const firebaseConfig = {
  apiKey: "AIzaSyAIzaSyAIzfCLiGGGGG1234567890EXAMPLE",
  authDomain: "crm-example.firebaseapp.com",
  projectId: "crm-example",
  storageBucket: "crm-example.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
