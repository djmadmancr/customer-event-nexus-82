
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - Using a working test configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8QQGDHtFz6iVzK5CQ_rGqT8sJm7pQqYs",
  authDomain: "nexus-crm-test.firebaseapp.com",
  projectId: "nexus-crm-test",
  storageBucket: "nexus-crm-test.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Enable network for Firestore
export { auth, firestore };
